# CRS365 AI Fit Score Nurture

These five HTML emails are ready for Brevo's HTML custom code editor.

## Automation timing

| Step | Delay from prior email | File |
| --- | --- | --- |
| 1 | Send immediately | email-01-fit-score-ready.html |
| 2 | Wait 1 day | email-02-tool-is-not-the-strategy.html |
| 3 | Wait 2 days | email-03-where-ai-projects-stall.html |
| 4 | Wait 2 days | email-04-first-automation-should-be-boring.html |
| 5 | Wait 3 days | email-05-thirty-day-plan.html |

## Message settings

### Email 1

- Message name: CRS Fit Score 01 - Results Ready
- Subject: Your CRS365 AI Fit Score is ready
- Preview text: Your top match is only the beginning. Here is what to do next.

### Email 2

- Message name: CRS Fit Score 02 - Tool vs Strategy
- Subject: The tool is not the strategy
- Preview text: Four questions to answer before you automate anything.

### Email 3

- Message name: CRS Fit Score 03 - Implementation Gaps
- Subject: Where AI projects stall inside a business
- Preview text: Most failures start before the technology is switched on.

### Email 4

- Message name: CRS Fit Score 04 - First Automation
- Subject: Your first automation should be boring
- Preview text: The best first win is usually repetitive, visible, and easy to measure.

### Email 5

- Message name: CRS Fit Score 05 - 30 Day Plan
- Subject: Turn your Fit Score into a 30-day plan
- Preview text: A practical path from recommendation to rollout.

## Brevo settings

1. Use sender name CRS365 Team.
2. Use the verified CRS365 sender address in the Brevo account.
3. Set replies to the inbox Chad monitors.
4. Keep open and click tracking enabled.
5. Exclude unsubscribed and blocklisted contacts.
6. If Calendly is connected to Brevo, exit contacts from this sequence after they book the consultation.

The HTML uses Brevo's live contact variables for first name, top match, and top score. Each variable includes fallback text, so a missing value will not leave a blank sentence. Each message also includes Brevo's unsubscribe, update profile, and mirror links.

Each template identifies itself as a commercial email and includes an unsubscribe link. Before activation, confirm Brevo's account-level footer also adds the verified business mailing address required for marketing email compliance. The templates do not invent or hard-code an address.

## Import

In each Brevo automation email, choose Start from scratch and then HTML custom code. Open the matching file, copy all of its HTML, paste it into Brevo, and send a test to a contact whose FIRSTNAME, CRS_TOP_MATCH, and CRS_TOP_SCORE fields are populated.