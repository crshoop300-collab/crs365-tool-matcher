# CRS365 AI Fit Score Roadmap

## Current State

The CRS365 tool matcher is a static GitHub Pages app hosted at `fitscore.crs365.com`. It asks six qualification questions, collects contact details, shows ranked AI and automation tool recommendations, and offers a PDF download plus a free consultation CTA.

## Integration Priority

1. Remove legacy email-platform language and route lead capture through Brevo.
2. Send full lead context to Brevo: contact info, quiz answers, top recommendation, score, consent, and UTM parameters.
3. Store the Brevo API key only in the serverless proxy, never in front-end code.
4. Brevo list confirmed: `CRS AI Fit Score`, list ID `17`. Custom attributes confirmed as created.

## Product/Funnel Priority

1. Reposition from "AI Tool Matcher" to "CRS365 AI Fit Score."
2. Make the output a business diagnosis, not only a tool list.
3. Add score categories:
   - Overall AI Fit Score
   - Automation Opportunity
   - Data and Systems Readiness
   - Sales and Follow-Up Readiness
   - Reporting and Visibility Gap
   - Implementation Complexity
4. Lead users toward the CRS365 AI Automation Blueprint as the core paid offer.
5. Use the email sequence to nurture toward the Blueprint, then into an implementation sprint or retainer.

## Compliance and Trust Priority

1. Add explicit email consent language near the form.
2. Add privacy/terms links near the email gate.
3. Remove or substantiate customer-count and performance claims.
4. Keep ad copy focused on business workflow, AI readiness, and operational improvement.

## Email Nurture Status

1. Brevo entry event crs_fit_score_completed is active and tested.
2. Five branded HTML nurture emails are complete in the brevo-emails folder.
3. The sequence runs immediately, then after waits of 1, 2, 2, and 3 days.
4. Each message includes tracked consultation links and Brevo unsubscribe, preference, and browser-view links.
5. Next optimization: collect baseline open, click, reply, and booking data before splitting the sequence by recommendation category.

## Premium Offer Status

1. The CRS365 AI Automation Blueprint is productized at a $995 fixed fee.
2. Scope is limited to one priority workflow and up to five core applications.
3. The sales page, WordPress block, report visuals, intake, call guide, fulfillment checklist, and editable Word deliverable are complete in the premium-offer folder.
4. Turnaround is five business days after kickoff and receipt of required materials.
5. Implementation remains a separate scope and quote.
6. Next activation steps are publishing the WordPress page, creating the agreement and payment request, and adding booked, paid, and delivered conversion events.