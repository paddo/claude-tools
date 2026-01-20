#!/bin/bash
set -euo pipefail

# mobile runner (Maestro-based)
# Usage: runner.sh <command> [args...]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="${MAESTRO_DEV_LOGS:-/tmp/maestro-dev}"
mkdir -p "$LOG_DIR"

# JSON log helper
log_json() {
  local level="$1" msg="$2"
  echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"level\":\"$level\",\"msg\":\"$msg\"}" | tee -a "$LOG_DIR/runner.log"
}

# Check/install maestro
ensure_maestro() {
  # Check ~/.maestro/bin first
  if [[ -x "$HOME/.maestro/bin/maestro" ]]; then
    export PATH="$HOME/.maestro/bin:$PATH"
    return 0
  fi

  if command -v maestro &>/dev/null; then
    return 0
  fi

  log_json "error" "Maestro not found. Install with: curl -fsSL https://get.maestro.mobile.dev | bash"
  exit 1
}

# Check for fswatch (macOS) or inotifywait (Linux)
ensure_watcher() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v fswatch &>/dev/null; then
      log_json "error" "fswatch not found. Install with: brew install fswatch"
      exit 1
    fi
  else
    if ! command -v inotifywait &>/dev/null; then
      log_json "error" "inotifywait not found. Install with: apt-get install inotify-tools"
      exit 1
    fi
  fi
}

# Start device log streaming (JSON format)
start_logs() {
  local platform="$1" app_id="$2"
  local log_file="$LOG_DIR/device.log"

  > "$log_file"  # Clear log

  if [[ "$platform" == "ios" ]]; then
    # iOS simulator logs
    xcrun simctl spawn booted log stream \
      --level debug \
      --style ndjson \
      --predicate "subsystem == '$app_id' OR process == '$app_id'" \
      >> "$log_file" 2>&1 &
  else
    # Android logs - parse to JSON
    local pid
    pid=$(adb shell pidof -s "$app_id" 2>/dev/null || echo "")

    if [[ -n "$pid" ]]; then
      adb logcat --pid="$pid" -v json 2>/dev/null >> "$log_file" &
    else
      # Fallback: filter by tag
      adb logcat -v json "*:D" 2>/dev/null | grep -i "$app_id" >> "$log_file" &
    fi
  fi

  echo $! > "$LOG_DIR/log_stream.pid"
  log_json "info" "Log streaming started to $log_file"
}

stop_logs() {
  if [[ -f "$LOG_DIR/log_stream.pid" ]]; then
    kill "$(cat "$LOG_DIR/log_stream.pid")" 2>/dev/null || true
    rm -f "$LOG_DIR/log_stream.pid"
  fi
}

# Run maestro test
run_test() {
  local flow_file="$1"
  local result_file="$LOG_DIR/test-result.log"

  log_json "info" "Running test: $flow_file"

  local start_time
  start_time=$(date +%s)

  if maestro test "$flow_file" > "$result_file" 2>&1; then
    local end_time duration
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    log_json "info" "Test PASSED in ${duration}s"
    echo "{\"status\":\"pass\",\"flow\":\"$flow_file\",\"duration\":$duration}"
  else
    local end_time duration
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    log_json "error" "Test FAILED in ${duration}s - see $result_file"
    echo "{\"status\":\"fail\",\"flow\":\"$flow_file\",\"duration\":$duration,\"output\":\"$result_file\"}"
    cat "$result_file" >&2
    return 1
  fi
}

# Check if dev loop is running
is_running() {
  if [[ -f "$LOG_DIR/dev.pid" ]]; then
    local pid
    pid=$(cat "$LOG_DIR/dev.pid")
    if kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
    rm -f "$LOG_DIR/dev.pid"
  fi
  return 1
}

# Dev loop: watch → rebuild → test
dev_loop() {
  local platform="$1"
  local app_id="$2"
  local src_dir="$3"
  local flow_file="$4"
  local build_cmd="${5:-}"
  local extensions="${6:-swift,kt,java,cs,xaml,dart}"

  # Check if already running
  local existing_pid
  if existing_pid=$(is_running); then
    echo "{\"status\":\"already_running\",\"pid\":$existing_pid,\"log_dir\":\"$LOG_DIR\"}"
    return 0
  fi

  ensure_maestro
  ensure_watcher

  # Write PID file
  echo $$ > "$LOG_DIR/dev.pid"
  trap 'rm -f "$LOG_DIR/dev.pid"; stop_logs' EXIT

  log_json "info" "Starting dev loop"
  log_json "info" "Platform: $platform, App: $app_id"
  log_json "info" "Source: $src_dir, Flow: $flow_file"

  # Start log streaming
  start_logs "$platform" "$app_id"

  # Initial test
  run_test "$flow_file" || true

  # Watch loop
  log_json "info" "Watching $src_dir for changes..."

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS: fswatch
    fswatch -r -e ".*" -i "\\.swift$" -i "\\.kt$" -i "\\.java$" -i "\\.cs$" -i "\\.xaml$" "$src_dir" | while read -r changed; do
      log_json "info" "File changed: $changed"

      if [[ -n "$build_cmd" ]]; then
        log_json "info" "Rebuilding..."
        eval "$build_cmd" >> "$LOG_DIR/build.log" 2>&1 || log_json "error" "Build failed"
      fi

      run_test "$flow_file" || true
    done
  else
    # Linux: inotifywait
    inotifywait -m -r -e modify,create --format '%w%f' "$src_dir" | while read -r changed; do
      if echo "$changed" | grep -qE "\\.(swift|kt|java|cs|xaml)$"; then
        log_json "info" "File changed: $changed"

        if [[ -n "$build_cmd" ]]; then
          log_json "info" "Rebuilding..."
          eval "$build_cmd" >> "$LOG_DIR/build.log" 2>&1 || log_json "error" "Build failed"
        fi

        run_test "$flow_file" || true
      fi
    done
  fi
}

# Continuous mode (maestro native)
continuous() {
  local flow_dir="$1"

  ensure_maestro

  log_json "info" "Starting Maestro continuous mode on $flow_dir"
  maestro test "$flow_dir" --continuous 2>&1 | tee -a "$LOG_DIR/maestro.log"
}

# Parity test - run same flow on two devices (sequential to avoid driver conflicts)
parity_test() {
  local flow_file="$1"
  local device1="$2"
  local device2="$3"
  local label1="${4:-primary}"
  local label2="${5:-secondary}"

  ensure_maestro

  local parity_dir="$LOG_DIR/parity-$(date +%s)"
  mkdir -p "$parity_dir/$label1" "$parity_dir/$label2"

  log_json "info" "Starting parity test: $label1 ($device1) vs $label2 ($device2)"

  # Run sequentially to avoid driver conflicts
  log_json "info" "Running on $label1..."
  local result1=0
  maestro test "$flow_file" --device "$device1" --test-output-dir "$parity_dir/$label1" > "$parity_dir/$label1.log" 2>&1 || result1=$?

  log_json "info" "Running on $label2..."
  local result2=0
  maestro test "$flow_file" --device "$device2" --test-output-dir "$parity_dir/$label2" > "$parity_dir/$label2.log" 2>&1 || result2=$?

  # Report results
  local status="pass"
  [[ $result1 -ne 0 || $result2 -ne 0 ]] && status="fail"

  log_json "info" "Parity test complete: $label1=$result1, $label2=$result2"

  cat <<EOF
{
  "status": "$status",
  "flow": "$flow_file",
  "parity_dir": "$parity_dir",
  "$label1": {"device": "$device1", "exit_code": $result1, "log": "$parity_dir/$label1.log"},
  "$label2": {"device": "$device2", "exit_code": $result2, "log": "$parity_dir/$label2.log"}
}
EOF
}

# List available devices
list_devices() {
  echo "=== iOS Simulators ==="
  xcrun simctl list devices available 2>/dev/null | grep -E "iPhone|iPad" | head -10 || echo "None found"

  echo ""
  echo "=== Android Devices ==="
  adb devices 2>/dev/null | grep -v "List" | grep -v "^$" || echo "None found"
}

# Get recent logs
logs() {
  local lines="${1:-50}"
  local log_type="${2:-device}"

  case "$log_type" in
    device)
      tail -n "$lines" "$LOG_DIR/device.log" 2>/dev/null || echo "No device logs"
      ;;
    runner)
      tail -n "$lines" "$LOG_DIR/runner.log" 2>/dev/null || echo "No runner logs"
      ;;
    build)
      tail -n "$lines" "$LOG_DIR/build.log" 2>/dev/null || echo "No build logs"
      ;;
    test)
      cat "$LOG_DIR/test-result.log" 2>/dev/null || echo "No test results"
      ;;
    all)
      echo "=== Runner ===" && tail -n "$lines" "$LOG_DIR/runner.log" 2>/dev/null || true
      echo "=== Device ===" && tail -n "$lines" "$LOG_DIR/device.log" 2>/dev/null || true
      echo "=== Build ===" && tail -n "$lines" "$LOG_DIR/build.log" 2>/dev/null || true
      ;;
  esac
}

# Status check
status() {
  local has_maestro="false"
  [[ -x "$HOME/.maestro/bin/maestro" ]] || command -v maestro &>/dev/null && has_maestro="true"

  echo "{"
  echo "  \"log_dir\": \"$LOG_DIR\","
  echo "  \"maestro\": $has_maestro,"
  echo "  \"watcher\": $(command -v fswatch &>/dev/null || command -v inotifywait &>/dev/null && echo "true" || echo "false"),"
  echo "  \"log_streaming\": $(test -f "$LOG_DIR/log_stream.pid" && kill -0 "$(cat "$LOG_DIR/log_stream.pid")" 2>/dev/null && echo "true" || echo "false")"
  echo "}"
}

# Check deps and show install instructions if missing
install() {
  local missing=0

  echo "Checking dependencies..."

  # Maestro
  if [[ -x "$HOME/.maestro/bin/maestro" ]] || command -v maestro &>/dev/null; then
    echo "  maestro: OK"
  else
    echo "  maestro: MISSING - Install with: curl -fsSL https://get.maestro.mobile.dev | bash"
    missing=1
  fi

  # File watcher
  if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v fswatch &>/dev/null; then
      echo "  fswatch: OK"
    else
      echo "  fswatch: MISSING - Install with: brew install fswatch"
      missing=1
    fi
  else
    if command -v inotifywait &>/dev/null; then
      echo "  inotifywait: OK"
    else
      echo "  inotifywait: MISSING - Install with: apt-get install inotify-tools"
      missing=1
    fi
  fi

  # ADB (optional)
  if command -v adb &>/dev/null; then
    echo "  adb: OK"
  else
    echo "  adb: MISSING (optional, needed for Android)"
  fi

  # xcrun (optional)
  if command -v xcrun &>/dev/null; then
    echo "  xcrun: OK"
  else
    echo "  xcrun: MISSING (optional, needed for iOS)"
  fi

  if [[ $missing -eq 1 ]]; then
    echo ""
    echo "Install missing dependencies and run again."
    exit 1
  fi

  echo ""
  echo "All dependencies installed!"
  status
}

# Main
case "${1:-help}" in
  install)
    install
    ;;
  dev)
    # dev <platform> <app-id> <src-dir> <flow-file> [build-cmd] [extensions]
    dev_loop "${2:-}" "${3:-}" "${4:-}" "${5:-}" "${6:-}" "${7:-}"
    ;;
  continuous|watch)
    continuous "${2:-.}"
    ;;
  test)
    ensure_maestro
    run_test "${2:-}"
    ;;
  logs)
    logs "${2:-50}" "${3:-device}"
    ;;
  start-logs)
    start_logs "${2:-ios}" "${3:-}"
    ;;
  stop-logs)
    stop_logs
    ;;
  status)
    status
    ;;

  running)
    if pid=$(is_running); then
      echo "{\"running\":true,\"pid\":$pid,\"log_dir\":\"$LOG_DIR\"}"
    else
      echo "{\"running\":false}"
    fi
    ;;

  stop-dev)
    if pid=$(is_running); then
      kill "$pid" 2>/dev/null || true
      rm -f "$LOG_DIR/dev.pid"
      echo "{\"stopped\":true,\"pid\":$pid}"
    else
      echo "{\"stopped\":false,\"reason\":\"not running\"}"
    fi
    ;;

  parity)
    # parity <flow-file> <device1> <device2> [label1] [label2]
    if [[ -z "${2:-}" || -z "${3:-}" || -z "${4:-}" ]]; then
      echo "Usage: runner.sh parity <flow-file> <device1-udid> <device2-udid> [label1] [label2]"
      echo ""
      echo "Examples:"
      echo "  # iOS vs Android"
      echo "  runner.sh parity ./flow.yaml 8A3C9222-... emulator-5554 ios android"
      echo ""
      echo "  # Two iOS simulators (migration)"
      echo "  runner.sh parity ./flow.yaml 8A3C9222-... 1B2C3D4E-... old new"
      exit 1
    fi
    parity_test "${2}" "${3}" "${4}" "${5:-primary}" "${6:-secondary}"
    ;;

  devices)
    list_devices
    ;;
  shell-cmd)
    # Print command for user to run in their terminal
    cat <<EOF
# Run this in your terminal:
export PATH="\$HOME/.maestro/bin:\$PATH"
$SCRIPT_DIR/runner.sh dev ${2:-ios} ${3:-com.example.app} ${4:-.} ${5:-./flows/smoke.yaml} ${6:+"\"$6\""}

# Claude can read logs with:
# cat /tmp/maestro-dev/runner.log | jq -r '.msg'
# cat /tmp/maestro-dev/device.log | jq '.eventMessage'
EOF
    ;;

  *)
    cat <<EOF
mobile runner (Maestro-based)

Commands:
  install                              Install maestro + file watcher
  dev <plat> <app> <src> <flow> [cmd]  Full dev loop with file watching
  continuous <flow-dir>                Maestro native continuous mode
  test <flow-file>                     Run single test
  logs [n] [device|runner|build|all]   Show recent logs
  start-logs <platform> <app-id>       Start device log streaming
  stop-logs                            Stop log streaming
  status                               Show current status
  running                              Check if dev loop is running
  stop-dev                             Stop the dev loop
  parity <flow> <dev1> <dev2> [l1] [l2]  Run flow on two devices, compare
  devices                              List available iOS/Android devices
  shell-cmd <plat> <app> <src> <flow>  Print command for your terminal

Environment:
  MAESTRO_DEV_LOGS  Log directory (default: /tmp/maestro-dev)

Examples:
  runner.sh install
  runner.sh dev ios com.example.app ./src ./flows/login.yaml "xcodebuild ..."
  runner.sh continuous ./flows
  runner.sh logs 100 device
  runner.sh shell-cmd ios com.example.app ./src ./flows/test.yaml
EOF
    ;;
esac
