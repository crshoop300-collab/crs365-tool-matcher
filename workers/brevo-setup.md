# Brevo Setup for CRS365 AI Fit Score

## Required Values

Send these values to the Worker as environment variables:

- `BREVO_API_KEY`: private API key from Brevo.
- `BREVO_LIST_ID`: `17` for the `CRS AI Fit Score` list.
- `BREVO_TRACKER_KEY`: Brevo Tracker `client_key` / `ma-key`, used by Brevo automation custom-event triggers.
- `ALLOWED_ORIGIN`: optional. Use `https://fitscore.crs365.com`.

Do not put the Brevo API key or Tracker key in `app.js`, `index.html`, GitHub Pages, or any browser-visible file.

## Brevo List

Use the list named:

`CRS AI Fit Score`

Use list ID `17` as `BREVO_LIST_ID`.

## Contact Attributes Used By The Worker

These contact attributes must exist in Brevo because the Worker stores them on each contact:

- `CRS_SOURCE` - Text
- `CRS_COMPANY_SIZE` - Text
- `CRS_INDUSTRY` - Text
- `CRS_CHALLENGES` - Text
- `CRS_BUDGET` - Text
- `CRS_CURRENT_TOOLS` - Text
- `CRS_TECH_LEVEL` - Text
- `CRS_TOP_MATCH` - Text
- `CRS_TOP_SCORE` - Number or Text
- `CRS_UTM_SOURCE` - Text
- `CRS_UTM_MEDIUM` - Text
- `CRS_UTM_CAMPAIGN` - Text
- `CRS_UTM_CONTENT` - Text
- `CRS_UTM_TERM` - Text

The Worker also sends `FIRSTNAME`, `LASTNAME`, and `COMPANY`. Confirm those standard attributes exist in the Brevo account.

## Automation Event

The Worker posts this Brevo custom event after the contact is created or updated:

`crs_fit_score_completed`

Brevo has two event systems. The automation builder's `Custom event` trigger listens for Brevo Tracker events, so the Worker sends the event to:

`https://in-automate.brevo.com/api/v2/trackEvent`

The Worker also sends the same data to the newer Brevo Events API for event history, but the Tracker event is the one to use for this workflow trigger.

The event includes properties for branching and personalization without needing extra contact attributes:

- `top_match`
- `top_score`
- `top_category`
- `top_pricing`
- `top_setup`
- `top_best_for`
- `top_matches`
- `company_size`
- `industry`
- `challenges`
- `budget`
- `current_tools`
- `tech_level`
- `submitted_at`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`

## Getting The Tracker Key

In Brevo, open the Brevo Tracker / website tracking setup. The tracker snippet contains a value like this:

```html
Brevo.push([
  "init",
  {
    client_key: "YOUR_CLIENT_KEY"
  }
]);
```

Use that `client_key` value as the Cloudflare Worker secret named `BREVO_TRACKER_KEY`.

## Recommended Brevo Workflow

Workflow name:

`CRS365 AI Fit Score Nurture`

Entry trigger:

`Custom event occurs` -> `crs_fit_score_completed`

Recommended guardrails:

- Contact is in list `CRS AI Fit Score`.
- Contact is not unsubscribed or blocklisted.
- Optional: exclude contacts who have already entered this workflow in the last 30 days.

Recommended branch:

Use `top_category` to split the message angle:

- `Workflow Automation`: manual work, disconnected systems, process cleanup.
- `AI & Custom GPTs`: AI usage policy, prompts, internal assistants, knowledge workflows.
- `CRM & Sales`: lead follow-up, pipeline visibility, sales handoffs.
- `Analytics & BI`: reporting, dashboard hygiene, executive visibility.

Fallback branch:

If `top_category` is empty, send the general AI Automation Blueprint sequence.

## Recommended Email Timing

- Email 1: immediately after `crs_fit_score_completed`.
- Email 2: wait 1 day.
- Email 3: wait 2 more days.
- Email 4: wait 2 more days.
- Email 5: wait 3 more days.

Primary CTA across the sequence:

`Book a CRS365 AI Automation Blueprint call`

CTA URL:

`https://calendly.com/chadshoop/30-minute-consult`

## Suggested Email Sequence

1. `Your CRS365 AI Fit Score is ready`
   - Confirm their top match and explain what the score means.
   - CTA: book a review call.

2. `The tool is not the strategy`
   - Explain why the real win is mapping the workflow before buying more software.
   - CTA: review the AI Automation Blueprint.

3. `Where AI usually breaks inside a business`
   - Cover bad inputs, scattered SOPs, disconnected apps, and unclear ownership.
   - CTA: book a workflow audit.

4. `Your first automation should be boring`
   - Position CRS365 around practical operational improvements, not hype.
   - CTA: pick one workflow to blueprint.

5. `Turn your Fit Score into a 30-day rollout plan`
   - Offer the next step: a paid Blueprint, implementation sprint, or advisory retainer.
   - CTA: book the call.

## Testing

Use a fresh test email address on `https://fitscore.crs365.com` and complete the quiz. Confirm in Brevo:

1. The contact is on list `CRS AI Fit Score`.
2. The contact has the `CRS_*` attributes populated.
3. The Worker response includes `tracker.status: 204`.
4. The event `crs_fit_score_completed` appears for the contact or is caught by the automation `Test` screen.
5. The workflow starts from that event.

If the custom event trigger still refuses to detect the event, use this fallback entry trigger while troubleshooting:

`Contact added to list` -> `CRS AI Fit Score`
