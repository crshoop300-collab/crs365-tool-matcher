# Brevo Setup for CRS365 AI Fit Score

## Required Values

Send these values to the Worker as environment variables:

- `BREVO_API_KEY`: private API key from Brevo.
- `BREVO_LIST_ID`: `17` for the `CRS AI Fit Score` list.
- `ALLOWED_ORIGIN`: optional. Use `https://fitscore.crs365.com`.

Do not put the Brevo API key in `app.js`, `index.html`, GitHub Pages, or any browser-visible file.

## Recommended Brevo List

Create a list named:

`CRS AI Fit Score`

Use list ID `17` as `BREVO_LIST_ID`.

## Recommended Custom Contact Attributes

Create these contact attributes in Brevo before enabling the full Worker payload:

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

The Worker also sends `FIRSTNAME`, `LASTNAME`, and `COMPANY`. Confirm those attributes exist in the Brevo account, or adjust the names to match your account.

## Automation Trigger

Recommended Brevo automation trigger:

When contact is added to list `CRS AI Fit Score`, start the CRS365 AI Ops Briefing / AI Automation Blueprint nurture sequence.

