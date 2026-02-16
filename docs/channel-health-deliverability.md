# Channel Health V1.1 - Deliverability Guardrails

## Overview

Extended Channel Health reporting to include critical deliverability metrics: unsubscribe rate, bounce rate, and complaint rate. These metrics take priority in RAG status calculation, ensuring deliverability issues are flagged immediately.

## What Was Implemented

### 1. Database Migration (`012_channel_health_deliverability.sql`)

**New Columns in `metric_snapshots`:**
- `unsubs` (int) - Total unsubscribes
- `unsub_rate` (decimal) - Percentage of sends
- `bounces` (int) - Total bounces (hard + soft)
- `bounce_rate` (decimal) - Percentage of delivered/sends
- `complaints` (int) - Total spam complaints
- `complaint_rate` (decimal) - Percentage of delivered/sends
- `delivered` (int) - Successfully delivered messages

**Extended `kpi_targets`:**
- Added metric types: `unsub_rate`, `bounce_rate`, `complaint_rate`

**Seeded Default Targets:**
```sql
unsub_rate:     green <0.20%, amber 0.20-0.35%, red >0.35%
bounce_rate:    green <1.5%,  amber 1.5-3.0%,   red >3.0%
complaint_rate: green <0.02%, amber 0.02-0.05%, red >0.05%
```

### 2. Import Logic Updates (`app/actions/health.ts`)

**Flexible Column Mapping:**
- Supports: `unsubs`, `unsubscribes`, `Unsubs`, `Unsubscribes`
- Supports: `bounces`, `Bounces`
- Supports: `complaints`, `spam_complaints`, `Complaints`
- Supports: `delivered`, `Delivered`

**Automatic Rate Calculation:**
- If only counts provided, rates are calculated:
  - `unsub_rate = (unsubs / sends) * 100`
  - `bounce_rate = (bounces / delivered || sends) * 100`
  - `complaint_rate = (complaints / delivered || sends) * 100`
- If `delivered` not provided, falls back to `sends - bounces`

**Enhanced RAG Calculation:**
- Deliverability issues take **priority** over engagement metrics
- Order of checks:
  1. 🔴 Critical: Complaint rate > 0.05%
  2. 🔴 Critical: Bounce rate > 3.0%
  3. 🔴 Critical: Unsub rate > 0.35%
  4. 🔴 Engagement: Open rate drop ≥ 25% WoW
  5. 🟡 Warning: Complaint rate > 0.02%
  6. 🟡 Warning: Bounce rate > 1.5%
  7. 🟡 Warning: Unsub rate > 0.20%
  8. 🟡 Warning: Open rate drop 15-25% WoW
  9. 🟢 Green: Meeting all targets

### 3. UI Updates

**Dashboard (`/health` page):**
- Added columns: Unsub Rate, Bounce Rate
- RAG badges now reflect deliverability status
- Updated to pass deliverability targets to RAG calculation

**Workflow Detail (`/health/workflows/[id]`):**
- New metric cards section showing:
  - Unsubscribe Rate (with count)
  - Bounce Rate (with count)
  - Complaint Rate (with count)
- Historical table includes all deliverability columns
- Health flags explain deliverability issues

**Import Page (`/health/import`):**
- Updated description to mention optional deliverability fields
- Flexible column name mapping for Looker exports

### 4. Test Data

**Updated CSV (`test-data/sample-health-metrics.csv`):**
- All rows now include realistic deliverability data
- Test scenarios include:
  - Critical red flags (high unsub/bounce/complaint rates)
  - Amber warnings (rates in warning zone)
  - Healthy deliverability
  - Push/in-app (no deliverability tracking)

## How to Test

### Step 1: Apply Database Migration

```bash
cd crm-atlas
npx supabase migration up
# Or apply via Supabase dashboard
```

### Step 2: Import Test Data

1. Navigate to `/health/import`
2. Upload `test-data/sample-health-metrics.csv`
3. Review preview (now shows deliverability columns)
4. Click "Import Metrics"

### Step 3: View Dashboard

1. Navigate to `/health`
2. Observe new columns: Unsub Rate, Bounce Rate
3. Check RAG badges - should see:
   - 🔴 `wf_re_engagement_007` (high unsub + bounce rates)
   - 🔴 `wf_win_back_010` (critical deliverability issues)
   - 🟡 `wf_weekly_digest_003` (unsub rate spike)
   - 🟢 `wf_onboarding_006`, `wf_birthday_offer_009` (healthy)

### Step 4: Drill Into Details

1. Click on `wf_re_engagement_007`
2. View deliverability metric cards showing:
   - 0.80% unsub rate (RED)
   - 3.09% bounce rate (RED)
   - 0.10% complaint rate (RED)
3. Check historical table showing trends over time
4. Review health flags explaining the issues

### Step 5: Test with Your Data

Replace test CSV with actual Looker export:
- Must include: workflow_id, period_start_date, period_type, channel, sends, opens, clicks
- Optional: unsubs, bounces, complaints, delivered
- Rates will be calculated automatically if not provided

## Key Features

✅ **Priority-based RAG**: Deliverability issues flagged before engagement drops
✅ **Flexible Import**: Handles various column naming conventions from Looker
✅ **Auto-calculation**: Rates computed from counts if not provided
✅ **Comprehensive UI**: Dashboard + detail views show all deliverability metrics
✅ **Historical Tracking**: All deliverability data stored in append-only snapshots
✅ **Type-safe**: Full TypeScript support with proper nullable handling

## Production Deployment

```bash
# Ensure migration is applied to production database
# Then deploy as usual
git add .
git commit -m "Add deliverability guardrails to Channel Health"
git push origin main
```

Vercel will automatically deploy. Build has been verified to pass all TypeScript checks.

## Next Steps (Future V2)

Potential enhancements:
- Hard bounce vs soft bounce distinction
- Deliverability trend charts/sparklines
- Email reputation score integration
- Automated alerts for critical thresholds
- ISP-specific deliverability breakdown
