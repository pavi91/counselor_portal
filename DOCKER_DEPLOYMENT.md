# Counselor Portal - Docker Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on VPS
- Git (to clone the repository)

## Deployment Steps

### 1. Clone and Navigate
```bash
git clone <repository-url> counselor_portal
cd counselor_portal
```

### 2. Configure Environment (Optional)
Edit `.env.docker` if you need to change default values:
```bash
nano .env.docker
```

### 3. Build and Start Services
```bash
docker-compose up -d
```

This will:
- Create MySQL database with schema and seed data
- Build and start the backend API
- Build and start the frontend UI
- Create a shared network for service communication

### 4. Verify Deployment
```bash
# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 5. Access the Application
- **Frontend**: http://your-vps-ip:3000
- **Backend API**: http://your-vps-ip:5000/api
- **Swagger Docs**: http://your-vps-ip:5000/api-docs

### 6. Database Access (if needed)
```bash
docker-compose exec db mysql -u db_user -p counselor_portal
```

## Common Commands

### Stop Services
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### View Logs
```bash
docker-compose logs -f <service-name>
# Services: db, backend, frontend
```

### Update Code
```bash
git pull origin main
docker-compose up -d --build
```

## Environment Variables

Edit in `.env.docker` before deployment:

| Variable | Default | Description |
|----------|---------|-------------|
| DB_USER | db_user | Database user |
| DB_PASSWORD | Str0ng!Pass#2026 | Database password |
| DB_NAME | counselor_portal | Database name |
| BACKEND_PORT | 5000 | Backend API port |
| FRONTEND_PORT | 3000 | Frontend port |
| JWT_SECRET | (auto) | JWT signing secret |
| VITE_API_URL | http://localhost:5000/api | Frontend API endpoint |

## Production Recommendations

1. **Change Secrets**: Update `JWT_SECRET`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
2. **Update VITE_API_URL**: Set to your domain (e.g., `https://yourdomain.com/api`)
3. **Enable HTTPS**: Use Nginx reverse proxy with Let's Encrypt SSL
4. **Backup Database**: Set up regular MySQL backups
5. **Scale Backend**: Use multiple backend instances with load balancing

## Troubleshooting

### Database Connection Failed
```bash
docker-compose logs db
# Wait 30 seconds for MySQL to initialize
```

### Port Already in Use
Change ports in `.env.docker`:
```
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Clear Everything and Restart
```bash
docker-compose down -v
docker-compose up -d
```
