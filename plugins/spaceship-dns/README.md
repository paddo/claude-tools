# spaceship-dns

Manage DNS records for domains on [spaceship.com](https://spaceship.com) via their API.

## Setup

### 1. Get API credentials

1. Log in to [Spaceship](https://spaceship.com)
2. Go to API Manager and create an API key
3. Note your API key and secret

### 2. Set environment variables

Add to `~/.zshrc` or `~/.bashrc`:

```bash
export SPACESHIP_API_KEY="your-key"
export SPACESHIP_API_SECRET="your-secret"
```

## Usage

```
/spaceship-dns list records for example.com
/spaceship-dns add A record for api.example.com pointing to 1.2.3.4
/spaceship-dns setup resend email for example.com
```

The command understands records pasted from Spaceship UI, Resend, Cloudflare, or plain text descriptions.

## Dependencies

- `curl`
- `jq`
