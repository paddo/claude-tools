# Hermes Tweet Plugin

Guide native Hermes Agent X/Twitter workflows from route discovery through
read-only research and explicitly enabled account actions.

## Runtime Setup

Install the current Hermes Agent plugin:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

Set `XQUIK_API_KEY` in the Hermes runtime environment for authenticated tools.
Leave `HERMES_TWEET_ENABLE_ACTIONS` unset for research and monitoring. Set it to
`true` only for a workflow whose exact account effect the operator approved.

## Tool Contract

- `tweet_explore`: offline route-catalog discovery
- `tweet_read`: catalog-listed reads with `XQUIK_API_KEY`
- `tweet_action`: private reads or mutations with both environment gates

Source: <https://github.com/Xquik-dev/hermes-tweet>

Xquik is an independent third-party service. Not affiliated with X Corp.
"Twitter" and "X" are trademarks of X Corp.
