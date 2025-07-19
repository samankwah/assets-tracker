# Deployment Guide

This guide covers different deployment options for the Asset Tracker application.

## Quick Deployment Options

### 1. Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/asset-tracker)

**Steps:**
1. Fork this repository
2. Connect your GitHub account to Netlify
3. Click "Deploy to Netlify" button above
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy!

### 2. Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/asset-tracker)

**Steps:**
1. Click "Deploy with Vercel" button above
2. Import your Git repository
3. Configure project settings (auto-detected)
4. Deploy!

### 3. GitHub Pages

**Steps:**
1. Fork this repository
2. Go to Settings > Pages
3. Set source to "GitHub Actions"
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Manual Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Preview the build (optional)
npm run preview
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Static Hosting

After building, upload the contents of the `dist/` directory to your hosting provider:

- **Apache**: Upload to `public_html` or `www` directory
- **Nginx**: Upload to your configured document root
- **AWS S3**: Upload to your S3 bucket with static website hosting enabled
- **Google Cloud Storage**: Upload to your bucket with website configuration

## Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t asset-tracker .

# Run the container
docker run -p 3000:80 asset-tracker
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

### Deploy to Container Platforms

- **AWS ECS**: Use the provided Docker image
- **Google Cloud Run**: Deploy containerized application
- **Azure Container Instances**: Run Docker containers
- **DigitalOcean App Platform**: Deploy from GitHub with Docker

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the variables for your environment:

```env
VITE_APP_TITLE=Asset Tracker
VITE_API_URL=https://your-api-domain.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Performance Optimization

### Code Splitting

The application uses dynamic imports for code splitting:

```javascript
// Routes are lazy-loaded
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Assets = lazy(() => import('./pages/Assets'))
```

### Bundle Analysis

Analyze your bundle size:

```bash
npm run build -- --analyze
```

### Caching Strategy

- **Static Assets**: Cached for 1 year
- **HTML**: No cache (for updates)
- **Service Worker**: Cache API responses

## Security Considerations

### Content Security Policy

Add to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### HTTPS

Always use HTTPS in production:

- Enable SSL/TLS certificates
- Redirect HTTP to HTTPS
- Use HSTS headers

### Environment Variables

Never expose sensitive data:

```env
# ❌ Wrong - exposed to client
VITE_API_SECRET=secret_key

# ✅ Correct - server-side only
API_SECRET=secret_key
```

## Monitoring and Analytics

### Error Tracking

Add Sentry for error tracking:

```javascript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN
})
```

### Analytics

Add Google Analytics:

```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Troubleshooting

### Common Issues

1. **404 on refresh**: Configure server redirects
2. **Environment variables not working**: Check `VITE_` prefix
3. **Build failures**: Check Node.js version compatibility
4. **Slow loading**: Enable compression and caching

### Debug Build

```bash
# Build with debug info
npm run build -- --debug

# Check bundle size
npm run build -- --analyze
```

## Automated Deployment

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1
      with:
        publish-dir: './dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Custom Domain

### DNS Configuration

Point your domain to the hosting provider:

- **Netlify**: Add CNAME record to `your-site.netlify.app`
- **Vercel**: Add CNAME record to `cname.vercel-dns.com`
- **GitHub Pages**: Add CNAME record to `username.github.io`

### SSL Certificate

Most hosting providers offer free SSL certificates:

- **Netlify**: Automatic SSL with Let's Encrypt
- **Vercel**: Automatic SSL certificates
- **Cloudflare**: Free SSL with CDN

## Support

For deployment issues:

1. Check the hosting provider's documentation
2. Review build logs for errors
3. Test locally with `npm run build && npm run preview`
4. Contact support if needed

## Backup and Recovery

### Database Backup

If using a database:

```bash
# Backup
mysqldump -u user -p database > backup.sql

# Restore
mysql -u user -p database < backup.sql
```

### File Backup

Regularly backup your source code and configuration files to version control and cloud storage.