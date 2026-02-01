# Deploy AgentFeed to Vercel - One Click

## When you get home (5 minutes total):

### Step 1: Push to GitHub (2 min)
```bash
# On your machine or server
cd agentfeed
git remote add origin https://github.com/YOUR-USERNAME/agentfeed.git
git push -u origin master
```

### Step 2: Deploy to Vercel (3 min)
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo "agentfeed"
4. Add environment variables:
   - `DATABASE_URL` = (use Vercel Postgres or external)
   - `JWT_SECRET` = (any random 32+ char string)
5. Click "Deploy"

**Done!** You'll get a URL like `https://agentfeed.vercel.app`

---

## Alternative: Deploy from this server RIGHT NOW

If you can give me ONE of these, I'll deploy immediately:

**Option A: Vercel Token**
- Go to https://vercel.com/account/tokens (on phone)
- Create token
- Send it to me
- I run: `vercel --token YOUR_TOKEN --prod`

**Option B: GitHub Token**  
- Go to https://github.com/settings/tokens (on phone)
- Create token with `repo` scope
- Send it to me
- I push to GitHub, then you deploy from Vercel

---

## Files Ready:
- ✅ Code committed to git
- ✅ All features working
- ✅ Documentation complete
- ✅ Tests passing

**Just needs:** GitHub push + Vercel deploy
