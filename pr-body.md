## 🔄 Automated Data Synchronization

Synchronizes all game data from [RaidTheory/arcraiders-data](https://github.com/RaidTheory/arcraiders-data).

### 📊 Sync Results

| Data Type | Status | Notes |
|-----------|:------:|-------|
| **Items** | ✅ | Items data, changelog, and snapshot updated |
| **Projects** | ✅ | Projects data synchronized |
| **Quests** | ✅ | Quest files synchronized |
| **Item Tags** | ✅ | Tags regenerated (keep/sell/recycle) |

### 📝 Changes Included

<details>
<summary><b>📦 Items Data</b></summary>

- Downloaded latest items from upstream
- Merged recipe/recycling relationships
- Removed duplicates
- Generated changelog with detected changes
- Updated snapshot for next sync

</details>

<details>
<summary><b>🎯 Projects Data</b></summary>

- Synchronized projects.json from upstream
- Projects define crafting progression and unlocks

</details>

<details>
<summary><b>📋 Quests Data</b></summary>

- Synchronized all quest files from upstream
- Quests influence item tag recommendations

</details>

<details>
<summary><b>🏷️ Item Tags</b></summary>

- Regenerated keep/sell/recycle recommendations
- Based on latest items, projects, and quests
- Updated tag reasons for transparency

</details>

### ✅ Review Checklist

- [ ] **Changelog** - Review changes in `data/changelog.json`
- [ ] **Items Count** - Verify total items count is reasonable
- [ ] **Tag Stats** - Check tag distribution (keep/sell/recycle ratios)
- [ ] **No Breaking Changes** - Ensure no critical items removed
- [ ] **Build Passes** - Verify deployment will succeed

### 🔍 How to Review

1. Check the **Files changed** tab for detailed diffs
2. Review `data/changelog.json` for added/modified/removed items
3. Look at `data/item-tags-computed.json` for tag changes
4. Verify `data/projects.json` and `data/quests/*.json` if relevant

---
🤖 **Automated sync** • Daily at 2 AM UTC • [Workflow](https://github.com/Teyk0o/ARDB/actions/runs/19690702139)
