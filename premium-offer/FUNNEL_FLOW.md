# CRS365 Dual-Funnel Flow

## Shared destination

Both free funnels lead to:

1. CRS365 AI Automation Blueprint sales page
2. 30-minute Blueprint fit call
3. Fixed-scope $995 Blueprint
4. Separate implementation scope when appropriate

The Fit Score and Audit diagnose different parts of the same problem. They should not compete with each other or require a prospect to complete both.

## Funnel A: AI Fit Score

1. Ad, search, referral, or CRS365 website
2. Free CRS365 AI Fit Score
3. Results and Brevo event `crs_fit_score_completed`
4. Fit Score nurture
5. Blueprint sales page
6. Blueprint fit call

Message bridge:

> Your Fit Score identified the tool categories and readiness gaps that matter. The Blueprint connects that direction to one real workflow, the required data, human controls, ownership, and rollout order.

## Funnel B: 7-Day AI Operations Audit

1. Ad, search, referral, or CRS365 website
2. 7-Day AI Operations Audit opt-in
3. Audit delivery and Brevo entry event
4. Seven-day action sequence
5. Blueprint sales page
6. Blueprint fit call

Message bridge:

> Your Audit identified repeated work, software-stack gaps, and priority bottlenecks. The Blueprint validates the best opportunity and turns those findings into a decision-ready workflow design.

## Blueprint page

The page should recognize both starting points near the top, then use source-neutral language:

- One priority workflow
- One defined business outcome
- Current-state and friction analysis
- Future-state workflow
- Tool, data, and human-control plan
- Sequenced 30-day roadmap

Primary CTA:

> Book Your Blueprint Fit Call

## Tracking

Keep the destination URL consistent and identify the source through UTMs.

- Fit Score email: `utm_source=brevo&utm_medium=email&utm_campaign=crs_fit_score_nurture`
- Audit email: `utm_source=brevo&utm_medium=email&utm_campaign=crs_ai_audit_nurture`
- Fit Score result: `utm_source=fit_score&utm_medium=owned_tool&utm_campaign=ai_automation_blueprint`
- Audit download or workbook: `utm_source=ai_audit&utm_medium=owned_resource&utm_campaign=ai_automation_blueprint`

Track these lifecycle events:

1. `crs_fit_score_completed`
2. `crs_ai_audit_requested`
3. `crs_blueprint_page_viewed`
4. `crs_blueprint_call_booked`
5. `crs_blueprint_paid`
6. `crs_blueprint_delivered`

Exit either nurture when `crs_blueprint_call_booked` or `crs_blueprint_paid` occurs.

## Activation order

1. Publish `https://crs365.com/ai-automation-blueprint/`.
2. Verify the page on desktop and mobile.
3. Change later Fit Score nurture CTAs from direct Calendly links to the Blueprint page.
4. Wire the Audit form to Brevo with its own list or source attribute and event.
5. Build the Audit delivery and seven-day action sequence.
6. Add booked and paid exits to both automations.
7. Create the agreement and $995 payment request.
