# Deployment Guide

## Vercel Deployment

### Prerequisites
1. Vercel account
2. PostgreSQL database (Vercel Postgres recommended)
3. GitHub repository with your code

### Step 1: Database Setup

1. **Create Vercel Postgres Database:**
   - Go to Vercel Dashboard
   - Navigate to Storage tab
   - Create a new Postgres database
   - Copy the connection string

2. **Alternative: External PostgreSQL:**
   - Use any PostgreSQL provider (Supabase, Railway, etc.)
   - Get the connection string

### Step 2: Environment Variables

Set these environment variables in Vercel:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```

**Generate secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### Step 3: Deploy to Vercel

1. **Connect Repository:**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

### Step 4: Database Migration

After deployment, run database setup:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link to project:**
   ```bash
   vercel link
   ```

4. **Run database commands:**
   ```bash
   # Generate Prisma client
   vercel env pull .env.local
   npm run db:generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed the database
   npm run db:seed
   ```

### Step 5: Verify Deployment

1. **Check health endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test login:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@acme.test","password":"password"}'
   ```

3. **Open frontend:**
   - Visit `https://your-app.vercel.app`
   - Login with test accounts

## Local Development

### Quick Start

```bash
# Clone repository
git clone <your-repo>
cd saas-notes-application

# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your database URL

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database with test data
npm run db:seed

# Open Prisma Studio
npx prisma studio
```

## Testing

### API Tests

```bash
# Run API tests
node test-api.js

# Test with custom URL
BASE_URL=https://your-app.vercel.app node test-api.js
```

### Manual Testing

1. **Health Check:**
   - `GET /api/health`

2. **Authentication:**
   - Login with test accounts
   - Verify JWT token generation

3. **Tenant Isolation:**
   - Login as Acme user
   - Verify no Globex data visible
   - Login as Globex user
   - Verify no Acme data visible

4. **Role Enforcement:**
   - Try upgrade as Member (should fail)
   - Try upgrade as Admin (should succeed)

5. **Subscription Limits:**
   - Create 3 notes as Free tenant
   - Verify limit enforcement
   - Upgrade to Pro
   - Verify unlimited notes

6. **CRUD Operations:**
   - Create, read, update, delete notes
   - Verify proper error handling

## Troubleshooting

### Common Issues

1. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Check database is accessible
   - Ensure Prisma client is generated

2. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser storage

3. **CORS Issues:**
   - Verify NEXTAUTH_URL matches deployment URL
   - Check API endpoint accessibility

4. **Build Issues:**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check TypeScript compilation

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View build logs
vercel logs

# Check database connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset
npm run db:seed
```

## Production Considerations

### Security
- Use strong, unique secrets
- Enable HTTPS only
- Regular security updates
- Monitor for suspicious activity

### Performance
- Enable Vercel Analytics
- Monitor database performance
- Optimize images and assets
- Use CDN for static content

### Monitoring
- Set up error tracking (Sentry)
- Monitor API response times
- Track user activity
- Database performance metrics

### Backup
- Regular database backups
- Version control for code
- Environment variable backup
- Document configuration changes
