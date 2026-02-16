# Channel Health Test Data

## sample-health-metrics.csv

Test CSV file with 25 rows covering various scenarios for the Channel Health import feature with deliverability metrics.

### Test Scenarios Included:

#### 1. **Green Status** (Meeting Targets)
- `wf_onboarding_006`: 30% open rate, consistent performance
- `wf_birthday_offer_009`: 31% open rate, high engagement
- `wf_product_update_005`: 28% open rate, stable

#### 2. **Red Status** (Performance Issues)
- `wf_weekly_digest_003`: Open rate **dropped 28.6%** WoW (23% → 15%)
  - Should trigger: "Open rate dropped 28.6% WoW"
- `wf_cart_abandonment_002`: Open rate dropped from 25% to 22%
- `wf_win_back_010`: Very low open rate at 10%

#### 3. **Amber Status** (Warning)
- `wf_re_engagement_007`: Open rate dropped from 20% to 12% (40% drop)
- `wf_monthly_summary_008`: Dropped from 20% to 18%

#### 4. **Different Channels**
- Email: Most workflows
- Push: `wf_promo_push_004` (20% open rate)
- In-App: `wf_product_update_005` (28% open rate)

#### 5. **Different Period Types**
- Week: Most workflows (3 weeks of data)
- Month: `wf_monthly_summary_008` (2 months)

#### 6. **Volume Variations**
- High volume: `wf_monthly_summary_008` (180k sends)
- Medium volume: `wf_weekly_digest_003` (45k sends)
- Low volume: `wf_birthday_offer_009` (3.5k sends)

### How to Test:

1. Navigate to `/health/import` in your browser
2. Upload `sample-health-metrics.csv`
3. Review the preview table (shows first 5 rows)
4. Click "Import Metrics"
5. Navigate to `/health` to see the dashboard
6. Expected results:
   - 10 unique workflows shown (latest period per workflow)
   - RAG badges: mix of Green, Amber, and Red
   - Click any row to see historical detail view
7. Test filters:
   - Period Type: Week vs Month
   - Channel: Email, Push, In-App
   - Date Range: Try 2024-01-22 to 2024-02-05
8. Export report using the "Export Report" button

### Expected Import Results:

- **Total rows**: 25
- **Imported**: 25 (first time)
- **Skipped**: 25 (if you import the same file again - deduplication works!)
- **Errors**: 0

### RAG Status Targets Used:

**Engagement Metrics:**
- Open Rate Target: 20%
- Click Rate Target: 2%

**Deliverability Metrics (New in V1.1):**
- Unsub Rate: 🟢 <0.20%, 🟡 0.20-0.35%, 🔴 >0.35%
- Bounce Rate: 🟢 <1.5%, 🟡 1.5-3.0%, 🔴 >3.0%
- Complaint Rate: 🟢 <0.02%, 🟡 0.02-0.05%, 🔴 >0.05%

Thresholds:
- 🟢 Green: Open rate ≥ 20% AND all deliverability metrics green
- 🟡 Amber: Open rate < 20% but ≥ 14% OR deliverability metrics in amber range
- 🔴 Red: Open rate < 14%, WoW drop ≥ 25%, OR deliverability metrics in red range

### Deliverability Test Scenarios:

#### Critical Red Flags (Deliverability takes priority):
- `wf_re_engagement_007`:
  - Latest: 0.80% unsub rate, 3.09% bounce rate, 0.10% complaint rate
  - Should trigger RED due to high unsub rate and bounce rate
  - Previous period had better metrics showing degradation

- `wf_win_back_010`:
  - Latest: 0.80% unsub rate, 3.09% bounce rate, 0.10% complaint rate
  - Critical deliverability issues despite low engagement

#### Amber Warnings:
- `wf_weekly_digest_003`:
  - Unsub rate spiked from 0.15% to 0.40% (above amber threshold)
  - Bounce rate at 1.52% (just above green threshold)

#### Healthy Deliverability:
- `wf_welcome_email_001`: 0.10% unsub, 1.52% bounce, 0.01% complaint (all green)
- `wf_onboarding_006`: 0.16% unsub, 1.52% bounce, 0.02% complaint (all green)
- `wf_birthday_offer_009`: 0.11% unsub, 1.54% bounce, 0% complaint (all green)

#### Push/In-App (No deliverability data):
- Push and in-app channels typically don't track unsubs/bounces/complaints
- Test data shows empty fields for these channels
