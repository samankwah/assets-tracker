# Deployment Guide - Asset Tracker

## Overview

This guide covers deployment options for the Asset Tracker application, including local development, staging, and production environments.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] ESLint checks passing
- [ ] Performance optimized

### Configuration
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Security headers set

### Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile responsive testing
- [ ] Performance testing passed
- [ ] Security testing completed

---

## Environment Setup

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Environment Variables
Create `.env` files for each environment:

#### Development (.env.development)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
VITE_APP_NAME=Asset Tracker (Dev)
VITE_STORAGE_PREFIX=asset_tracker_dev_
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

#### Staging (.env.staging)
```env
VITE_API_URL=https://staging-api.assettracker.com
VITE_APP_ENV=staging
VITE_APP_NAME=Asset Tracker (Staging)
VITE_STORAGE_PREFIX=asset_tracker_staging_
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=your_sentry_dsn
```

#### Production (.env.production)
```env
VITE_API_URL=https://api.assettracker.com
VITE_APP_ENV=production
VITE_APP_NAME=Asset Tracker
VITE_STORAGE_PREFIX=asset_tracker_
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_TRACKING_ID=your_ga_id
```

---

## Build Process

### Production Build
```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build for production
npm run build

# Preview build locally
npm run preview
```

### Build Optimization
The build process includes:
- Code minification
- Tree shaking
- Asset optimization
- CSS purging
- Source maps generation

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [asset-files]
├── index.html
└── favicon.ico
```

---

## Deployment Options

## 1. Netlify Deployment

### Automatic Deployment
1. **Connect Repository**
   - Log in to Netlify
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Add from `.env.production`

3. **Deploy Settings**
   ```toml
   # netlify.toml
   [build]
   command = "npm run build"
   publish = "dist"
   
   [build.environment]
   NODE_VERSION = "18"
   
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   
   [[headers]]
   for = "/assets/*"
   [headers.values]
   Cache-Control = "max-age=31536000"
   ```

### Manual Deployment
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 2. Vercel Deployment

### Automatic Deployment
1. **Connect Repository**
   - Log in to Vercel
   - Click "Import Project"
   - Connect your GitHub repository

2. **Configure Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **Environment Variables**
   - Add environment variables from `.env.production`

### Manual Deployment
```bash
# Build the project
npm run build

# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## 3. AWS S3 + CloudFront

### S3 Bucket Setup
1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-asset-tracker-bucket
   ```

2. **Configure Static Website**
   ```json
   {
     "IndexDocument": {
       "Suffix": "index.html"
     },
     "ErrorDocument": {
       "Key": "index.html"
     }
   }
   ```

3. **Set Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-asset-tracker-bucket/*"
       }
     ]
   }
   ```

### CloudFront Distribution
1. **Create Distribution**
   - Origin: S3 bucket
   - Default Root Object: `index.html`
   - Error Pages: 404 → `/index.html` (200 status)

2. **Configure Caching**
   ```json
   {
     "CacheBehaviors": [
       {
         "PathPattern": "/assets/*",
         "TTL": 31536000,
         "ViewerProtocolPolicy": "redirect-to-https"
       },
       {
         "PathPattern": "/*",
         "TTL": 0,
         "ViewerProtocolPolicy": "redirect-to-https"
       }
     ]
   }
   ```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-asset-tracker-bucket --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 4. Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### Docker Commands
```bash
# Build image
docker build -t asset-tracker .

# Run container
docker run -p 80:80 asset-tracker

# Docker Compose
docker-compose up -d
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

---

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run test
    - npm run lint
  only:
    - main
    - develop

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $WEBHOOK_URL
  only:
    - main
```

---

## SSL/HTTPS Configuration

### Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Your app configuration
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Performance Monitoring

### Web Vitals
```javascript
// Add to index.html
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

---

## Security Considerations

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.assettracker.com;
  font-src 'self' https://fonts.gstatic.com;
">
```

### Security Headers
```nginx
# Additional security headers
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
add_header Cross-Origin-Embedder-Policy "require-corp";
add_header Cross-Origin-Opener-Policy "same-origin";
add_header Cross-Origin-Resource-Policy "cross-origin";
```

### Environment Security
- Use environment variables for sensitive data
- Never commit API keys or secrets
- Use secret management services
- Enable audit logging
- Regular security updates

---

## Monitoring & Alerting

### Error Tracking (Sentry)
```javascript
// src/utils/sentry.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

### Analytics (Google Analytics)
```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga4';

ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);

export const trackEvent = (action, category, label) => {
  ReactGA.event({
    action,
    category,
    label,
  });
};
```

### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake
- AWS CloudWatch

---

## Rollback Strategy

### Quick Rollback
1. **Identify Issue**
   - Monitor error rates
   - Check user reports
   - Review logs

2. **Rollback Process**
   ```bash
   # For S3/CloudFront
   aws s3 sync s3://backup-bucket/ s3://live-bucket/ --delete
   aws cloudfront create-invalidation --distribution-id ID --paths "/*"
   
   # For Netlify
   netlify sites:list
   netlify api sites deploy --site-id=SITE_ID --deploy-id=PREVIOUS_DEPLOY_ID
   
   # For Docker
   docker pull asset-tracker:previous-tag
   docker-compose up -d
   ```

3. **Post-Rollback**
   - Verify system stability
   - Notify stakeholders
   - Document incident
   - Plan fix deployment

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
npm --version
```

#### Deployment Errors
```bash
# Check environment variables
env | grep VITE_

# Verify build output
ls -la dist/

# Test production build locally
npm run preview
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for memory leaks
npm run dev -- --profile
```

---

## Support

### Documentation
- [Deployment Wiki](https://wiki.assettracker.com/deployment)
- [Troubleshooting Guide](https://wiki.assettracker.com/troubleshooting)
- [API Documentation](./API_DOCUMENTATION.md)

### Emergency Contacts
- **DevOps Team**: devops@assettracker.com
- **On-Call Engineer**: +1-555-0123
- **Status Page**: https://status.assettracker.com

### Incident Response
1. **Immediate**: Rollback if critical
2. **Short-term**: Hot-fix deployment
3. **Long-term**: Root cause analysis and prevention

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Asset Tracker application across various platforms and environments. Follow the security best practices and monitoring guidelines to ensure a stable, secure, and performant production deployment.

Remember to:
- Test thoroughly before deploying
- Monitor application performance
- Keep dependencies updated
- Maintain security best practices
- Document any deployment customizations

For questions or issues, contact the development team or refer to the project documentation.