# Gmail Integration Setup

This app includes a Gmail inbox viewer with real-time updates using OAuth 2.0 and the Gmail API.

## Frontend Configuration

Set the backend API base URL in your environment:

```bash
VITE_API_BASE=http://localhost:3000
```

If not set, it defaults to `http://localhost:3000`.

## Backend Requirements

Your Node/Express backend must implement these endpoints:

### 1. GET `/auth/url`
Returns the OAuth authorization URL:
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### 2. GET `/auth/callback`
Handles OAuth callback, exchanges code for tokens, and stores the refresh token securely server-side.

### 3. GET `/auth/status`
Returns connection status:
```json
{
  "connected": true
}
```

### 4. POST `/auth/disconnect`
Clears stored tokens and disconnects the account.

### 5. GET `/inbox/latest`
Returns the latest messages:
```json
{
  "messages": [
    {
      "id": "msg123",
      "fromName": "John Doe",
      "fromEmail": "john@example.com",
      "subject": "Hello",
      "snippet": "This is a preview...",
      "receivedAtISO": "2025-01-15T10:30:00Z",
      "isUnread": true
    }
  ]
}
```

### 6. GET `/inbox/stream` (Server-Sent Events)
Streams real-time updates:
```
data: {"messages":[...]}

data: {"messages":[...]}
```

## Features

- **OAuth Flow**: Click "Connect Gmail" → authorize in popup → auto-connects
- **Real-time Updates**: Prefers SSE, falls back to polling (30s default)
- **Keyboard Shortcuts**:
  - `R` - Manual refresh (polling mode)
  - `U` - Toggle unread-only filter
- **Settings**: Gear icon to adjust refresh interval (15-60s) and max items (5-20)
- **Debug Mode**: Add `?debug=1` to URL to see connection status, heartbeat times, and message counts

## Gmail API Setup

1. Create project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable Gmail API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/auth/callback`
6. Use scope: `https://www.googleapis.com/auth/gmail.readonly`

## Backend Implementation Notes

- Store refresh tokens securely (environment variables, database, etc.)
- Poll Gmail API every 30s server-side
- Track `lastSeenMessageId` to de-duplicate
- Gmail query: `label:inbox newer_than:2d`
- Request metadata + snippet only (not full payload)
- Handle token refresh automatically
- Broadcast updates via WebSocket or SSE

## Security

- Tokens never exposed to client
- Only readonly scope requested
- No raw HTML email rendering
- Proper error handling for expired tokens
