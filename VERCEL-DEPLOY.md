# Deploy AgentFeed to Vercel

## Quick Deploy (3 steps):

1. **Create Vercel account** (if you don't have one):
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import this project**:
   - Dashboard → New Project
   - Import from Git
   - OR: Push to GitHub first, then import

3. **Set environment variables** in Vercel dashboard:
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-random-secret-key-min-32-chars
   ```

4. **Deploy!**
   - Vercel auto-deploys
   - You get a URL like: `https://agentfeed.vercel.app`

## Database Options:

**Option 1: Vercel Postgres** (easiest)
- Add Vercel Postgres in dashboard
- Auto-injects DATABASE_URL
- Run migrations: `npx prisma migrate deploy`

**Option 2: External** (Neon, Supabase, Railway)
- Get connection string from provider
- Add to Vercel env vars
- Run migrations

## After Deploy:

1. Run migrations in Vercel:
   ```bash
   vercel env pull .env
   npx prisma migrate deploy
   ```

2. Visit your URL!

---

**OR give me a Vercel token and I'll deploy it now:**

1. Go to https://vercel.com/account/tokens
2. Create new token
3. Give me the token
4. I'll run: `vercel --token YOUR_TOKEN --yes --prod`

Done in 30 seconds.
