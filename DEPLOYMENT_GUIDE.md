# Deployment Guide

## Production Deployment

### Backend
1. Use `docker-compose.yml` for deploying the FastAPI backend along with PostgreSQL and Redis.
2. For production, set `DATABASE_URL` to a robust managed database service.
3. Use Nginx as a reverse proxy with SSL termination.
4. Set strong, random keys for `SECRET_KEY` and `ENCRYPTION_KEY`.

### Mobile
1. Use Expo Application Services (EAS) to build standalone apps.
2. `eas build --profile production --platform all`
3. Publish to App Store and Google Play.

## CI/CD
GitHub Actions are configured to automatically test and build the application on pushes to the `main` branch.
