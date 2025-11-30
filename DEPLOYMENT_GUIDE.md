# 🚀 Deployment Guide - Community Collaboration System

Complete guide to deploy the Arc Raiders Database community collaboration system.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (linked to GitHub)
- Discord Developer account
- Discord Server with moderator role configured

---

## 🔧 Step 1: Discord Application Setup

### 1.1 Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it **"Arc Raiders Database"**
4. Click **"Create"**

### 1.2 Configure OAuth2

1. Go to **OAuth2** → **General**
2. Add Redirect URLs:
   - `http://localhost:3000/api/auth/discord/callback` (for local development)
   - `https://your-domain.vercel.app/api/auth/discord/callback` (for production)
3. Click **"Save Changes"**
4. Copy your **Client ID** and **Client Secret** (you'll need these later)

### 1.3 Create Bot

1. Go to **Bot** section
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Under **Privileged Gateway Intents**, enable:
   - ✅ **SERVER MEMBERS INTENT**
4. Click **"Reset Token"** and copy the **Bot Token**
5. Click **"Save Changes"**

### 1.4 Add Bot to Your Server

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
3. Select bot permissions:
   - ✅ `Read Messages/View Channels`
4. Copy the generated URL and open it in your browser
5. Select your Discord server and authorize

### 1.5 Create Webhook

1. Go to your Discord server
2. Right-click on the channel where you want notifications
3. **Edit Channel** → **Integrations** → **Webhooks**
4. Click **"New Webhook"**
5. Name it **"ARDB Notifications"**
6. Copy the **Webhook URL**

---

## 💾 Step 2: Vercel Postgres Setup

### 2.1 Create Database

1. Go to https://vercel.com/dashboard
2. Select your project (or create new one)
3. Go to **Storage** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose a name: **"ardb-database"**
7. Select region (closest to your users)
8. Click **"Create"**

### 2.2 Get Connection Strings

1. Once created, click on your database
2. Go to **".env.local"** tab
3. Copy all the environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

---

## ⚙️ Step 3: Environment Variables

### 3.1 Create `.env.local` (Local Development)

Create `.env.local` in your project root:

```env
# Vercel Postgres
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-prisma-url"
POSTGRES_URL_NON_POOLING="your-non-pooling-url"
POSTGRES_URL_NO_SSL="your-no-ssl-url"
POSTGRES_USER="your-user"
POSTGRES_HOST="your-host"
POSTGRES_PASSWORD="your-password"
POSTGRES_DATABASE="your-database"

# Discord OAuth
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"

# Discord Bot
DISCORD_BOT_TOKEN="your-bot-token"

# Discord Server
DISCORD_GUILD_ID="1439278522924404744"
DISCORD_MODERATOR_ROLE_ID="1443865078779875443"

# Discord Webhook
DISCORD_WEBHOOK_URL="your-webhook-url"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-generated-secret"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3.2 Configure Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add ALL the variables from above
4. **IMPORTANT:** For `DISCORD_REDIRECT_URI` in production, use:
   ```
   https://your-domain.vercel.app/api/auth/discord/callback
   ```
5. For `NEXT_PUBLIC_BASE_URL` in production, use:
   ```
   https://your-domain.vercel.app
   ```

---

## 📦 Step 4: Install Dependencies

```bash
npm install
```

This installs:
- `@vercel/postgres` - Database client
- `jose` - JWT library for sessions
- All existing dependencies

---

## 🗄️ Step 5: Run Database Migration

### 5.1 Local Development

```bash
npm run migrate
```

This will:
- Create all 6 tables (users, item_edits, edit_comments, item_overrides, item_history, sync_conflicts)
- Create all indexes
- Create triggers for `updated_at` fields

Expected output:
```
🚀 Starting database migration...
📝 Found 30 SQL statements to execute

[1/30] Executing...
✅ Success
...
✅ Database migration completed successfully!

Created tables:
  - users
  - item_edits
  - edit_comments
  - item_overrides
  - item_history
  - sync_conflicts
```

### 5.2 Production (Vercel)

The migration will run automatically on first deployment, or you can run it manually:

```bash
# Set production env vars
export POSTGRES_URL="your-production-url"

# Run migration
npm run migrate
```

---

## 🚀 Step 6: Deploy to Vercel

### 6.1 Push to GitHub

```bash
git add .
git commit -m "feat: add community collaboration system"
git push origin main
```

### 6.2 Deploy via Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click **"Deploy"**

### 6.3 Verify Deployment

1. Wait for deployment to complete
2. Visit your production URL
3. Test Discord login
4. Verify moderator permissions

---

## ✅ Step 7: Verify Installation

### 7.1 Test Authentication

1. Visit your site (local or production)
2. Click **"Login with Discord"**
3. Authorize the application
4. You should be redirected back logged in
5. Your username should appear in the header

### 7.2 Test Edit Proposal

1. Go to any item page
2. Click **"Edit Item"** button
3. Make some changes (e.g., add a translation)
4. Add a reason (optional)
5. Click **"Submit for Review"**
6. Check Discord channel for webhook notification
7. Go to `/moderation` (if you're a moderator)
8. You should see your proposal in the pending list

### 7.3 Test Moderation

1. Go to `/moderation`
2. Verify you can see pending edits
3. Click **"Review"** on an edit
4. Check the diff viewer shows changes correctly
5. Try approving the edit
6. Go back to the item page - verify changes are applied
7. Check that item shows "Community Edited" badge

### 7.4 Test Comments

1. Open an edit review page
2. Add a comment
3. Verify comment appears
4. Wait 10 seconds - verify polling updates comments

---

## 🔍 Step 8: Configure GitHub Secrets

For the sync conflict detection to work in GitHub Actions:

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:
   - `POSTGRES_URL` - Your production Postgres URL
   - `DISCORD_WEBHOOK_URL` - Your webhook URL

Now the workflow will automatically detect conflicts after each sync.

---

## 📊 Step 9: Monitor & Maintain

### Check Database

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Count pending edits
SELECT COUNT(*) FROM item_edits WHERE status = 'pending';

-- Count community-edited items
SELECT COUNT(*) FROM item_overrides;

-- View recent activity
SELECT * FROM item_history ORDER BY created_at DESC LIMIT 10;
```

### Check Logs

- **Vercel:** Dashboard → Your Project → Deployments → View Function Logs
- **GitHub Actions:** Actions tab → Sync Data workflow → View logs

### Discord Notifications

You should receive Discord notifications for:
- ✅ New edit proposals
- ⚠️ Sync conflicts detected

---

## 🐛 Troubleshooting

### Login doesn't work

**Symptom:** Redirect loop or "Unauthorized" error

**Solution:**
1. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
2. Check `DISCORD_REDIRECT_URI` matches exactly (including http/https)
3. Verify redirect URL is added in Discord Developer Portal
4. Check `JWT_SECRET` is set
5. Clear cookies and try again

### Moderator role not detected

**Symptom:** User logged in but can't access `/moderation`

**Solution:**
1. Verify `DISCORD_BOT_TOKEN` is set
2. Check `DISCORD_GUILD_ID` matches your server ID
3. Verify `DISCORD_MODERATOR_ROLE_ID` is correct
4. Make sure the bot is in your server
5. Ensure bot has "SERVER MEMBERS INTENT" enabled
6. User must have the moderator role in Discord

### Database connection fails

**Symptom:** "Failed to connect to database" errors

**Solution:**
1. Verify all `POSTGRES_*` env vars are set
2. Check Vercel Postgres is running (Vercel Dashboard → Storage)
3. Try reconnecting in Vercel Dashboard
4. Verify region matches your deployment
5. Check if you exceeded connection limits

### Edit submission fails

**Symptom:** "Failed to create edit proposal" error

**Solution:**
1. Check browser console for errors
2. Verify database tables exist (`npm run migrate`)
3. Check Vercel function logs
4. Verify user is authenticated
5. Check `item_edits` table has correct schema

### Webhook notifications not sent

**Symptom:** No Discord messages when edits are created

**Solution:**
1. Verify `DISCORD_WEBHOOK_URL` is set correctly
2. Test webhook manually: `curl -X POST -H "Content-Type: application/json" -d '{"content":"test"}' YOUR_WEBHOOK_URL`
3. Check Discord channel permissions
4. Verify webhook wasn't deleted in Discord
5. Check function logs for webhook errors

---

## 🎯 Post-Deployment Checklist

- [ ] Discord OAuth working
- [ ] Users can log in/out
- [ ] Moderator role detection working
- [ ] Edit form accessible and functional
- [ ] Edit submission creates database entry
- [ ] Discord webhook notifications sent
- [ ] Moderation dashboard shows edits
- [ ] Real-time polling working (5s interval)
- [ ] Diff viewer displays changes correctly
- [ ] Approve/Reject actions work
- [ ] Comments can be posted
- [ ] Item overrides apply correctly
- [ ] Community Edited badge shows
- [ ] Sync conflict detection working
- [ ] GitHub Actions workflow successful

---

## 📞 Support

If you encounter issues:

1. Check Vercel function logs
2. Check GitHub Actions logs
3. Check browser console errors
4. Verify all environment variables
5. Test database connection
6. Check Discord bot permissions

---

## 🎉 Success!

Your community collaboration system is now live! Users can:

- ✅ Login with Discord
- ✅ Propose edits to items
- ✅ Add missing translations
- ✅ Update stats and crafting info
- ✅ Comment on proposals

Moderators can:

- ✅ Review all proposals in real-time
- ✅ See visual diffs of changes
- ✅ Approve or reject with reasons
- ✅ Comment on proposals
- ✅ Resolve sync conflicts

The system will:

- ✅ Send Discord notifications
- ✅ Track complete history
- ✅ Detect sync conflicts automatically
- ✅ Apply approved changes instantly

---

**Happy moderating! 🚀**
