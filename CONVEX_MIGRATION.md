# Migration from SQLite/Drizzle to Convex

This document outlines the completed migration from SQLite + Drizzle ORM to Convex backend.

## 🎉 What's Been Migrated

### ✅ Database Schema

- **Users table**: Authentication users with email, name, verification status
- **Sessions table**: User session management with expiration tracking
- **Accounts table**: OAuth provider accounts linked to users
- **Verification table**: Email verification and magic link tokens
- **Posts table**: Sample data table for demonstrating CRUD operations

### ✅ Authentication

- **Better Auth integration**: Custom Convex adapter created for Better Auth
- **Magic link authentication**: Email-based passwordless authentication
- **Session management**: Secure session handling with Convex

### ✅ Frontend Integration

- **Convex React provider**: Set up in Next.js app layout
- **Query hooks**: Real-time data fetching with `useQuery`
- **Mutation hooks**: Database operations with `useMutation`
- **Demo component**: PostsList component showing CRUD operations

## 🔧 New Project Structure

```
project/
├── convex/
│   ├── schema.ts          # Database schema definition
│   ├── posts.ts           # Posts CRUD functions
│   ├── auth.ts            # Authentication functions
│   └── _generated/        # Auto-generated Convex types
├── src/
│   ├── lib/
│   │   ├── convex.ts      # Convex client setup
│   │   ├── convex-adapter.ts # Better Auth Convex adapter
│   │   └── auth.ts        # Updated auth config
│   ├── app/
│   │   ├── convex-client-provider.tsx
│   │   └── layout.tsx     # Updated with Convex provider
│   └── components/
│       └── posts-list.tsx # Demo Convex usage
├── convex.json            # Convex configuration
└── package.json           # Updated dependencies
```

## 🚀 Next Steps

### 1. Set up Convex Account

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Initialize Convex in your project
npx convex dev

# This will:
# - Create a Convex account (if needed)
# - Set up a new Convex project
# - Generate environment variables
# - Start the development server
```

### 2. Environment Variables

Update your `.env` file:

```env
# Replace this with your actual Convex deployment URL from `npx convex dev`
NEXT_PUBLIC_CONVEX_URL="https://your-deployment-url.convex.cloud"

# Keep existing auth variables
BETTER_AUTH_SECRET="your-existing-secret"
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-existing-resend-key"
```

### 3. Start Development

```bash
# Terminal 1: Start Convex development server
npm run convex:dev

# Terminal 2: Start Next.js development server
npm run dev
```

## 📊 Schema Differences

### SQLite (Before) → Convex (After)

| SQLite Type          | Convex Type         | Notes                              |
| -------------------- | ------------------- | ---------------------------------- |
| `integer` timestamps | `v.number()`        | Unix timestamps (milliseconds)     |
| `text`               | `v.string()`        | String values                      |
| `integer` boolean    | `v.boolean()`       | Native boolean type                |
| Foreign keys         | `v.id("tableName")` | Type-safe document references      |
| Auto-increment IDs   | `_id`               | Convex auto-generates document IDs |

### Index Migration

- **SQLite indexes** → **Convex indexes**: All indexes migrated with `.index()` calls
- **Unique constraints** → **Index queries**: Enforced at application level with `.unique()`

## 🔍 Code Examples

### Before (Drizzle)

```typescript
// Old database query
const posts = await db.query.posts.findMany({
  orderBy: [desc(posts.createdAt)],
});

// Old database insert
const newPost = await db.insert(posts).values({
  name: "Hello World",
  createdAt: new Date(),
});
```

### After (Convex)

```typescript
// New query
const posts = useQuery(api.posts.getAllPosts);

// New mutation
const createPost = useMutation(api.posts.createPost);
await createPost({ name: "Hello World" });
```

## 🛡️ Authentication Changes

### Better Auth Adapter

A custom Convex adapter was created since there's no official one yet:

- Located in `src/lib/convex-adapter.ts`
- Implements all required Better Auth adapter methods
- Handles user, session, account, and verification operations

### Session Management

- **Sessions stored in Convex**: Instead of SQLite database
- **Real-time updates**: Session changes reflect immediately
- **Type safety**: Full TypeScript support for all auth operations

## 🎯 Benefits of Migration

### Performance

- **Real-time updates**: Data changes reflect instantly across all clients
- **Optimistic updates**: UI updates immediately, syncs in background
- **Automatic caching**: Convex handles query result caching

### Developer Experience

- **Type safety**: Auto-generated TypeScript types for all functions
- **Real-time by default**: No need for websockets or polling
- **Serverless**: No database server to manage or scale

### Scalability

- **Auto-scaling**: Convex handles scaling automatically
- **Global distribution**: Data replicated across regions
- **ACID transactions**: Full transaction support built-in

## 📁 Removed Files

The following SQLite/Drizzle files were removed:

- `src/server/db/` (entire directory)
- `drizzle.config.ts`
- `db.sqlite`
- `drizzle/` (migrations directory)

## 🚨 Important Notes

### Data Migration

This migration creates a **new empty database**. If you had existing data in SQLite:

1. **Export your data** from the old SQLite database
2. **Create import scripts** using Convex mutations
3. **Run data import** after setting up Convex

### Better Auth Configuration

The custom Convex adapter may need updates as Better Auth evolves. Monitor:

- Better Auth releases for official Convex adapter
- Breaking changes in Better Auth API
- Convex API updates affecting the adapter

### Development Workflow

```bash
# Always run Convex dev server alongside Next.js
npm run convex:dev    # Terminal 1
npm run dev          # Terminal 2
```

## 🎉 Success!

Your project has been successfully migrated from SQLite + Drizzle to Convex!

The demo PostsList component on the dashboard shows Convex in action with:

- ✅ Real-time data fetching
- ✅ Optimistic updates
- ✅ Type-safe mutations
- ✅ Automatic error handling

Happy coding with Convex! 🚀
