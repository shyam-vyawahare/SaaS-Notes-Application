# SaaS Notes Application

A multi-tenant SaaS Notes Application built with Next.js, TypeScript, and PostgreSQL, featuring role-based access control and subscription-based feature gating.

## 🏗️ Architecture

### Multi-Tenancy Approach: Shared Schema with Tenant ID

This application uses a **shared schema with tenant ID column** approach for multi-tenancy. This approach provides:

- **Simplicity**: Single database schema with tenant isolation via `tenant_id` columns
- **Cost-effectiveness**: Shared database resources across all tenants
- **Scalability**: Easy to add new tenants without schema changes
- **Maintenance**: Single codebase and database to maintain

### Database Schema

```sql
-- Tenants table
tenants {
  id: String (Primary Key)
  name: String (Unique) -- e.g., 'Acme', 'Globex'
  slug: String (Unique) -- e.g., 'acme', 'globex'
  subscriptionPlan: Enum (FREE, PRO)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Users table
users {
  id: String (Primary Key)
  email: String (Unique)
  password: String (Hashed)
  role: Enum (ADMIN, MEMBER)
  tenantId: String (Foreign Key to tenants.id)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Notes table
notes {
  id: String (Primary Key)
  title: String
  content: String
  tenantId: String (Foreign Key to tenants.id)
  userId: String (Foreign Key to users.id)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Security & Isolation

- **Tenant Isolation**: All queries are filtered by `tenant_id` to ensure data isolation
- **JWT Authentication**: Secure token-based authentication with user context
- **Role-Based Access**: Admin and Member roles with different permissions
- **Password Hashing**: bcryptjs for secure password storage

## 🚀 Features

### Multi-Tenancy
- ✅ Support for multiple tenants (Acme, Globex)
- ✅ Strict data isolation between tenants
- ✅ Tenant-specific user management

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Member)
- ✅ Predefined test accounts with password: `password`
- ✅ Self-serve registration: `POST /api/auth/register` creates a new tenant on the FREE plan and an Admin user

**Test Accounts:**
- `admin@acme.test` (Admin, Acme tenant)
- `user@acme.test` (Member, Acme tenant)
- `admin@globex.test` (Admin, Globex tenant)
- `user@globex.test` (Member, Globex tenant)

### Subscription Feature Gating
- ✅ Free Plan: Limited to 3 notes per tenant
- ✅ Pro Plan: Unlimited notes
- ✅ Upgrade endpoint: `POST /api/tenants/:slug/upgrade`
- ✅ Real-time limit enforcement

### Notes CRUD API
- ✅ `POST /api/notes` - Create note (with subscription limits)
- ✅ `GET /api/notes` - List tenant notes
- ✅ `GET /api/notes/:id` - Get specific note
- ✅ `PUT /api/notes/:id` - Update note
- ✅ `DELETE /api/notes/:id` - Delete note
- ✅ `POST /api/users/invite` - Admin-only invite endpoint (creates user in current tenant)

### Frontend
- ✅ Modern React/Next.js interface
- ✅ Login form with test account information
- ✅ Registration from login screen
- ✅ Notes dashboard with CRUD operations
- ✅ Upgrade banner for Free plan users
- ✅ Responsive design with Tailwind CSS
- ✅ Dark/Light theme toggle with preference persisted in `localStorage`

### Deployment
- ✅ Vercel-ready configuration
- ✅ CORS enabled for API access via `middleware.ts` (handles `OPTIONS`, sets allow headers)
- ✅ Health endpoint: `GET /api/health`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Vercel Postgres recommended)
- **Authentication**: JWT with bcryptjs
- **Deployment**: Vercel

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Vercel account (for deployment)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd saas-notes-application
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database URL and secrets:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/saas_notes"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   JWT_SECRET="your-jwt-secret-here"
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Vercel Deployment

1. **Connect to Vercel:**
   - Import your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard

2. **Required Environment Variables:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Deploy:**
   - Vercel will automatically build and deploy
   - Run database migrations after deployment

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Health Check
- `GET /api/health` - Application health status

### Notes Management
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## 🔒 Security Features

### Tenant Isolation
- All database queries include `tenant_id` filtering
- JWT tokens contain tenant context
- API middleware enforces tenant boundaries

### Authentication
- JWT tokens with 7-day expiration
- Password hashing with bcryptjs
- Secure token verification on all protected routes

### Authorization
- Role-based access control
- Admin-only upgrade endpoint
- User-specific note ownership

## 🧪 Testing

The application includes predefined test accounts for validation:

**Acme Corporation (Free Plan):**
- Admin: `admin@acme.test` / `password`
- Member: `user@acme.test` / `password`

**Globex Corporation (Free Plan):**
- Admin: `admin@globex.test` / `password`
- Member: `user@globex.test` / `password`

### Test Scenarios
1. **Tenant Isolation**: Login as Acme user, verify no Globex data visible
2. **Role Enforcement**: Try upgrade as Member (should fail)
3. **Subscription Limits**: Create 3 notes as Free tenant, verify limit enforcement
4. **Upgrade Flow**: Upgrade tenant to Pro, verify unlimited notes
5. **CRUD Operations**: Test all note operations

## 📊 Database Schema Details

### Multi-Tenancy Implementation
- **Shared Schema**: Single database with tenant isolation
- **Tenant ID Column**: Every table includes `tenant_id` for filtering
- **Foreign Key Constraints**: Ensure referential integrity
- **Cascade Deletes**: Tenant deletion removes all associated data

### Indexing Strategy
- Primary keys on all tables
- Unique constraints on email and tenant slug
- Foreign key indexes for performance

## 🚀 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **JWT Caching**: Client-side token storage
- **Connection Pooling**: Prisma connection management
- **Vercel Edge**: Global CDN for static assets

## 🔄 Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] File attachments for notes
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Audit logging
- [ ] API rate limiting
- [ ] Multi-language support

## 📝 License

This project is created for educational purposes as part of a SaaS application assignment.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding comprehensive test coverage
- Implementing proper error handling
- Adding monitoring and logging
- Security audit and penetration testing
- Performance optimization
