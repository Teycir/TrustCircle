# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)

1. **Copy environment file:**
```bash
cp .env.example .env
```

2. **Edit .env with your credentials:**
```bash
nano .env
```

3. **Build and run:**
```bash
docker-compose up -d
```

4. **Access the app:**
```
http://localhost:3000
```

### Using Docker CLI

1. **Build image:**
```bash
docker build -t trustcircle .
```

2. **Run container:**
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name trustcircle \
  trustcircle
```

## Commands

```bash
# View logs
docker-compose logs -f

# Stop container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Check health status
docker-compose ps
```

## Production Deployment

### Environment Variables

All variables from `.env.example` must be set:
- Supabase credentials
- Dual Pinata accounts (Capsules + Vaults)
- Resend API key

### Security Best Practices

1. **Use Docker secrets for production:**
```bash
echo "your_secret" | docker secret create pinata_jwt -
```

2. **Run behind reverse proxy (nginx/Caddy):**
```nginx
server {
    listen 443 ssl;
    server_name trustcircle.example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Enable HTTPS with Let's Encrypt**

### Resource Limits

Add to docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

## Troubleshooting

**Build fails:**
- Check Node.js version (requires 20+)
- Ensure all dependencies in package.json

**Container exits:**
- Check logs: `docker-compose logs`
- Verify environment variables are set

**Port already in use:**
- Change port in docker-compose.yml: `"8080:3000"`

## Self-Hosting

For complete privacy, self-host with your own:
1. Supabase instance (self-hosted or cloud)
2. Pinata accounts (or alternative IPFS pinning)
3. Email service (Resend or SMTP)

See [SETUP.md](SETUP.md) for detailed configuration.
