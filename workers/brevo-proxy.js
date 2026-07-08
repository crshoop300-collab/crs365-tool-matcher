/*
  CRS365 Brevo Contact Proxy
  Deploy as a Cloudflare Worker.

  Required Worker environment variables:
  - BREVO_API_KEY: your private Brevo API key
  - BREVO_LIST_ID: the Brevo list ID for CRS365 AI Fit Score leads

  Optional:
  - ALLOWED_ORIGIN: defaults to https://fitscore.crs365.com

  Important:
  Any attributes sent to Brevo must exist in your Brevo account before they
  can be stored on the contact. Create the custom attributes listed in
  workers/brevo-setup.md, or simplify the attributes object below.
*/

const DEFAULT_ALLOWED_ORIGIN = 'https://fitscore.crs365.com';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function jsonResponse(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(env),
      'Content-Type': 'application/json'
    }
  });
}

function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' ')
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, env);
    }

    if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
      return jsonResponse({ error: 'Brevo proxy is not configured' }, 500, env);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, env);
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return jsonResponse({ error: 'Valid email is required' }, 400, env);
    }

    if (body.email_consent !== true) {
      return jsonResponse({ error: 'Email consent is required' }, 400, env);
    }

    const { firstName, lastName } = splitName(body.name);
    const listId = Number(env.BREVO_LIST_ID);

    const payload = {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        COMPANY: body.company || '',
        CRS_SOURCE: 'AI Fit Score',
        CRS_COMPANY_SIZE: body.company_size || '',
        CRS_INDUSTRY: body.industry || '',
        CRS_CHALLENGES: Array.isArray(body.challenges) ? body.challenges.join(', ') : '',
        CRS_BUDGET: body.budget || '',
        CRS_CURRENT_TOOLS: Array.isArray(body.current_tools) ? body.current_tools.join(', ') : '',
        CRS_TECH_LEVEL: body.tech_level || '',
        CRS_TOP_MATCH: body.top_match || '',
        CRS_TOP_SCORE: body.top_score || '',
        CRS_UTM_SOURCE: body.utm_source || '',
        CRS_UTM_MEDIUM: body.utm_medium || '',
        CRS_UTM_CAMPAIGN: body.utm_campaign || '',
        CRS_UTM_CONTENT: body.utm_content || '',
        CRS_UTM_TERM: body.utm_term || ''
      }
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const resultText = await brevoResponse.text();
    let result;
    try {
      result = resultText ? JSON.parse(resultText) : {};
    } catch (err) {
      result = { raw: resultText };
    }

    if (!brevoResponse.ok) {
      return jsonResponse({ error: 'Brevo request failed', details: result }, brevoResponse.status, env);
    }

    return jsonResponse({ ok: true, brevo: result }, 200, env);
  }
};
