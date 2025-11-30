# 🤝 Community Collaboration System

Wikipedia-style collaborative editing system for Arc Raiders Database.

---

## 📖 Overview

The Arc Raiders Database now includes a complete community collaboration system that allows users to contribute edits to item data, similar to Wikipedia. All edits are reviewed by moderators before being published.

### Key Features

✅ **Discord Authentication** - Secure login via Discord OAuth
✅ **Edit Proposals** - Submit changes to any item field
✅ **Moderation Dashboard** - Real-time review interface for moderators
✅ **Visual Diff Viewer** - Side-by-side comparison of changes
✅ **Comment System** - Discuss edits before approval
✅ **Auto-Notifications** - Discord webhooks for new submissions
✅ **Conflict Detection** - Automatic detection of sync conflicts
✅ **Complete Audit Trail** - Full history of all changes
✅ **Multi-language Support** - Edit all 18 language translations

---

## 🎯 User Flow

### For Contributors

1. **Login** → Click "Login with Discord" in header
2. **Find Item** → Browse to any item page
3. **Edit** → Click "Edit Item" button
4. **Make Changes** → Edit translations, stats, crafting, etc.
5. **Submit** → Add optional reason and submit for review
6. **Wait** → Moderators review your submission
7. **Notification** → Get notified when approved/rejected

### For Moderators

1. **Dashboard** → Visit `/moderation` (auto-refreshing every 5s)
2. **Review** → Click "Review" on pending edits
3. **Compare** → View diff of original vs proposed changes
4. **Comment** → Discuss with contributor if needed
5. **Decide** → Approve (publishes immediately) or Reject (with reason)
6. **Conflicts** → Resolve sync conflicts between RaidTheory and community

---

## 🏗️ Architecture

### Database Schema

```
users                 → Discord-authenticated users
├── item_edits        → Edit proposals (pending/approved/rejected)
│   ├── edit_comments → Comments on proposals
│   └── item_history  → Complete audit trail
├── item_overrides    → Approved edits (override JSON data)
└── sync_conflicts    → Detected conflicts with RaidTheory syncs
```

### Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Database:** Vercel Postgres (PostgreSQL)
- **Auth:** Discord OAuth 2.0 + JWT sessions
- **Real-time:** Client-side polling (5s interval)
- **Notifications:** Discord Webhooks

### Data Flow

```
User Submits Edit
    ↓
Saved to item_edits (pending)
    ↓
Discord Notification Sent
    ↓
Moderator Reviews
    ↓
Approve → item_overrides → Published
    ↓
Reject → Deleted (with reason)
```

---

## 📁 File Structure

### Backend

```
lib/
├── db/
│   ├── schema.sql          # Database schema
│   └── db.ts               # Query helpers (30+ functions)
├── discord.ts              # Discord API + webhooks
├── auth.ts                 # JWT session management
└── itemLoader.ts           # DB override + JSON merge

app/api/
├── auth/
│   ├── discord/            # OAuth flow
│   ├── me/                 # Get current user
│   └── logout/             # Logout
├── edits/
│   ├── route.ts            # List/create edits
│   └── [id]/
│       ├── route.ts        # Get/update edit
│       ├── approve/        # Approve (mods only)
│       ├── reject/         # Reject (mods only)
│       └── comments/       # List/add comments
```

### Frontend

```
app/
├── items/[slug]/edit/      # Edit form page
└── moderation/
    ├── page.tsx            # Main dashboard
    └── edit/[id]/          # Review single edit

components/
├── auth/
│   ├── DiscordLoginButton  # OAuth button
│   └── UserMenu            # User dropdown
├── edit/
│   ├── ItemEditForm        # Main edit form
│   ├── TranslationEditor   # 18 languages
│   ├── MetadataEditor      # Type, rarity, value, etc.
│   ├── StatsEditor         # Stat block
│   └── ComponentsEditor    # Crafting recipes
└── moderation/
    ├── ModerationDashboard # Main interface
    ├── EditList            # Polling list
    ├── EditStats           # Statistics
    ├── DiffViewer          # Visual diff
    ├── ApprovalActions     # Approve/reject
    └── CommentThread       # Discussion

hooks/
├── useAuth.ts              # Current user state
└── useEditPolling.ts       # Real-time updates
```

---

## 🔧 API Reference

### Authentication

```typescript
GET  /api/auth/discord          # Initiate OAuth
GET  /api/auth/discord/callback # OAuth callback
GET  /api/auth/me               # Get current user
POST /api/auth/logout           # Logout
```

### Edit Proposals

```typescript
GET  /api/edits                 # List edits
     ?status=pending|approved|rejected
     ?itemId=xxx
     ?userId=123

POST /api/edits                 # Create edit
     { itemId, editData, originalData, reason? }

GET  /api/edits/[id]            # Get single edit
PUT  /api/edits/[id]            # Update edit (mods only)
POST /api/edits/[id]/approve    # Approve (mods only)
POST /api/edits/[id]/reject     # Reject (mods only)
     { reason }
```

### Comments

```typescript
GET  /api/edits/[id]/comments   # List comments
POST /api/edits/[id]/comments   # Add comment
     { comment }
```

---

## 🎨 UI Components

### Edit Form Tabs

1. **Translations** (🌐)
   - Name translations (18 languages)
   - Description translations (18 languages)
   - Tip: "You don't need to fill all languages"

2. **Metadata** (📋)
   - Item type, rarity, value
   - Workbench, icon, flavor text
   - Weapon/armor specific fields

3. **Stats** (📊)
   - Add/remove stat entries
   - Quick buttons for common stats
   - Supports numbers and strings

4. **Crafting** (🔨)
   - Crafting recipe components
   - Required components
   - Recycling output

### Moderation Dashboard

- **Statistics Cards** - Total, Pending, Approved, Rejected
- **Filter Tabs** - Pending / Approved / Rejected / All
- **Edit Cards** - User avatar, item name, status, time ago
- **Auto-refresh** - Green pulse indicator (5s polling)
- **Quick Actions** - Review button

### Review Page

- **Contributor Info** - Avatar, username, submission time, reason
- **Diff Viewer** - Expandable fields with color coding:
  - 🟢 Green = Added
  - 🔴 Red = Removed
  - 🟡 Yellow = Modified
  - ⚪ Gray = Unchanged
- **Approval Actions** - Approve / Reject with reason
- **Comment Thread** - Real-time discussion (10s polling)
- **Quick Info Sidebar** - Fields modified, submission date, item ID

---

## 🔔 Notifications

### Discord Webhooks

**New Edit Proposal:**
```
📝 Nouvelle proposition de modification
Item: Adrenaline Shot
Par: Username
Proposition #: 123
```

**Sync Conflict Detected:**
```
⚠️ Conflit de synchronisation détecté
Item: Steel Plate
Un conflit a été détecté entre RaidTheory et modifications communautaires.
```

---

## 🔒 Permissions

### Public Users
- ✅ Browse items
- ✅ View community-edited items
- ❌ Cannot edit (must login)

### Authenticated Users
- ✅ All public permissions
- ✅ Submit edit proposals
- ✅ Comment on own proposals
- ✅ View own contribution history
- ❌ Cannot approve/reject

### Moderators
- ✅ All user permissions
- ✅ Access moderation dashboard
- ✅ Approve/reject edits
- ✅ Edit proposals before approval
- ✅ Comment on any proposal
- ✅ Resolve sync conflicts
- ✅ View complete audit trail

**Moderator Detection:**
- Must have role ID `1443865078779875443`
- In Discord server ID `1439278522924404744`
- Verified via Discord API on every login

---

## 📊 Statistics & Monitoring

### Database Queries

```sql
-- User stats
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as moderators FROM users WHERE is_moderator = TRUE;

-- Edit stats
SELECT status, COUNT(*)
FROM item_edits
GROUP BY status;

-- Top contributors
SELECT u.discord_username, COUNT(e.id) as edits
FROM users u
JOIN item_edits e ON u.id = e.user_id
WHERE e.status = 'approved'
GROUP BY u.id
ORDER BY edits DESC
LIMIT 10;

-- Community-edited items
SELECT COUNT(*) FROM item_overrides;

-- Recent activity
SELECT * FROM item_history
ORDER BY created_at DESC
LIMIT 20;
```

### Performance Metrics

- **Polling Intervals:**
  - Edit list: 5 seconds
  - Statistics: 30 seconds
  - Comments: 10 seconds

- **Database Indexes:**
  - item_edits(status, item_id, user_id, created_at)
  - item_overrides(item_id)
  - sync_conflicts(resolved, item_id)
  - item_history(item_id, created_at)
  - users(discord_id)

---

## 🧪 Testing Scenarios

### Test Edit Submission

1. Login as regular user
2. Go to `/items/adrenaline-shot`
3. Click "Edit Item"
4. Add French translation: `"Dose d'adrénaline"`
5. Add reason: "Added missing French translation"
6. Submit
7. Verify Discord notification sent
8. Check `/moderation` as moderator - should see pending edit

### Test Approval Flow

1. Login as moderator
2. Go to `/moderation`
3. Verify auto-refresh indicator (green pulse)
4. Click "Review" on pending edit
5. Verify diff shows changes correctly
6. Add comment: "Looks good!"
7. Click "Approve"
8. Go to item page - verify translation applied
9. Verify "Community Edited" badge shows

### Test Rejection Flow

1. Login as moderator
2. Review pending edit
3. Click "Reject"
4. Enter reason: "Translation is incorrect"
5. Confirm rejection
6. Verify edit removed from pending list
7. Verify comment added with rejection reason

### Test Conflict Detection

1. Make community edit to an item
2. Approve the edit
3. Modify same field in `data/items.json`
4. Run `npx tsx scripts/detect-sync-conflicts.ts`
5. Verify conflict created in database
6. Verify Discord notification sent
7. Check `/moderation/conflicts` - should see conflict

---

## 🚨 Error Handling

### Common Errors

**"Unauthorized"**
- User not logged in
- Session expired
- Solution: Re-login with Discord

**"Forbidden"**
- User doesn't have moderator role
- Solution: Verify Discord role assignment

**"Failed to create edit proposal"**
- Database connection issue
- Missing required fields
- Solution: Check Vercel logs

**"Failed to approve edit"**
- Edit already reviewed
- Database constraint violation
- Solution: Refresh page, check edit status

---

## 📈 Future Enhancements

Possible improvements (not yet implemented):

- [ ] Email notifications (in addition to Discord)
- [ ] Edit drafts (save and come back later)
- [ ] Batch approvals (approve multiple edits at once)
- [ ] Contributor badges/achievements
- [ ] Edit suggestions (AI-powered recommendations)
- [ ] Version history viewer (see all past versions of an item)
- [ ] Conflict auto-resolution (simple merges)
- [ ] Mobile app notifications
- [ ] Public contribution leaderboard
- [ ] RSS feed of approved edits

---

## 🤝 Contributing Guidelines

### For Contributors

**Do:**
- ✅ Only submit accurate information
- ✅ Check spelling and grammar
- ✅ Add reasons for your changes
- ✅ Use official sources (game, wiki, etc.)
- ✅ Be patient - reviews may take time

**Don't:**
- ❌ Submit speculative/unconfirmed data
- ❌ Make joke edits
- ❌ Duplicate existing contributions
- ❌ Edit without understanding the field
- ❌ Spam submissions

### For Moderators

**Do:**
- ✅ Review carefully and fairly
- ✅ Provide constructive feedback
- ✅ Ask questions if unclear
- ✅ Check sources when possible
- ✅ Be respectful to contributors

**Don't:**
- ❌ Approve without reviewing
- ❌ Reject without reason
- ❌ Edit contributors' work without comment
- ❌ Ignore conflicts
- ❌ Abuse moderator privileges

---

## 📞 Support & Questions

For help with the collaboration system:

1. Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. Check the [Implementation Status](./IMPLEMENTATION_STATUS.md)
3. Review Vercel function logs
4. Check Discord bot permissions
5. Verify environment variables

---

## 📄 License

This collaboration system is part of Arc Raiders Database and follows the same license as the main project.

---

**Built with ❤️ for the Arc Raiders community**

*Empowering players to contribute and collaborate on the ultimate Arc Raiders item database.*
