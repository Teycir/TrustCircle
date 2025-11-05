# Docker Installation Status

## ✅ Current Status: RUNNING & HEALTHY

### Container Details
- **Name**: trustcircle-trustcircle-1
- **Status**: Up and healthy
- **Health Check**: Passing (wget every 30s)
- **Uptime**: Running successfully

### Accessible Ports
- http://localhost:3001 ✓
- http://localhost:3002 ✓
- http://localhost:3003 ✓
- http://localhost:3004 ✓

All ports respond with HTTP 200.

### Configuration
- **Base Image**: Node.js 20 Alpine
- **Build Type**: Multi-stage (deps → builder → runner)
- **User**: Non-root (nextjs:nodejs)
- **Restart Policy**: unless-stopped
- **Environment**: Production mode

### Security Features
- API keys NOT baked into image (runtime injection)
- Placeholder values used during build
- Non-root user execution
- Health monitoring enabled

### Environment Variables
All required variables are set from .env file:
- Supabase credentials ✓
- Pinata Capsules credentials ✓
- Pinata Vaults credentials ✓
- Resend API key (optional for emails)

### Recent Changes
- Removed obsolete `version` field from docker-compose.yml
- Added multiple port mappings (3001-3004)
- Fixed yamllint warnings

### Commands
```bash
docker compose ps              # Check status
docker compose logs -f         # View logs
docker compose restart         # Restart
docker compose down            # Stop
docker compose up -d --build   # Rebuild and start
```

### Notes
- Multiple port mappings allow testing/load balancing scenarios
- RESEND_API_KEY warning is expected if email features not used
- Container automatically restarts on failure
