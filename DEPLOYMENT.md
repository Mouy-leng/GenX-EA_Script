
# Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Set up environment variables in Replit Secrets
- [ ] Configure DATABASE_URL (Neon PostgreSQL)
- [ ] Set API keys (OpenAI, Bybit, Discord, Telegram)
- [ ] Set NODE_ENV=production

### Database Setup
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Verify database connection: `npm run test`

### Code Quality
- [ ] Run linting: `npm run lint`
- [ ] Build application: `npm run build`
- [ ] Test all endpoints: `npm run test`

### Deployment Steps
1. Click the "Deploy" button in Replit
2. Choose "Autoscale" deployment type
3. Configure machine power (recommended: 0.5 vCPU, 1GB RAM)
4. Set max instances based on expected traffic
5. Deploy and monitor logs

### Post-Deployment Verification
- [ ] Check health endpoint: `https://your-app.replit.app/health`
- [ ] Verify WebSocket connections
- [ ] Test API endpoints
- [ ] Monitor application logs
- [ ] Verify database operations

### Monitoring
- Use Replit's deployment monitoring tools
- Check application logs regularly
- Monitor database performance
- Set up alerts for critical errors

### Troubleshooting
- Check environment variables are set correctly
- Verify database connection string
- Review application logs for errors
- Ensure all dependencies are installed
