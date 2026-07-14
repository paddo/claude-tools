# hermes-tweet

Guide Hermes Agent X/Twitter research, monitoring, and approval-gated action planning through Hermes Tweet.

## Source

Hermes Tweet lives at <https://github.com/Xquik-dev/hermes-tweet>. Use that repository for installation, implementation details, and issue tracking.

## Setup

Install Hermes Tweet from the source repository and configure `XQUIK_API_KEY` as an environment variable when read access is needed.

Enable actions only when the user explicitly wants write-capable tools:

```bash
export HERMES_TWEET_ENABLE_ACTIONS=true
```

## Usage

```text
/hermes-tweet research this account before I reply
/hermes-tweet monitor public posts for launch feedback
/hermes-tweet plan a safe response, but do not post it
```

## Safety

- Start with exploration before read or action tools.
- Keep write actions explicit and opt-in.
- Never ask users to paste credentials, cookies, or session material into chat.
- Summarize external posts instead of copying long text.
- Refuse platform bypass, impersonation, or spam automation requests.
