/*
  CRS365 Brevo Contact Proxy
  Deploy as a Cloudflare Worker.

  Required Worker environment variables:
  - BREVO_API_KEY: your private Brevo API key
  - BREVO_LIST_ID: the Brevo list ID for CRS365 AI Fit Score leads

  Optional:
  - ALLOWED_ORIGIN: defaults to https://fitscore.crs365.com

  Important:
  Any contact attributes sent to Brevo must exist in your Brevo account before
  they can be stored on the contact. Event properties do not require contact
  attributes and are used for the Brevo automation trigger.
*/

const DEFAULT_ALLOWED_ORIGIN = 'https://fitscore.crs365.com';
const FIT_SCORE_EVENT_NAME = 'crs_fit_score_completed';

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

function joinList(value) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

function numberOrBlank(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
}

async function postFitScoreEvent(env, email, attributes, body) {
  const eventPayload = {
    event_name: FIT_SCORE_EVENT_NAME,
    identifiers: {
      email_id: email
    },
    contact_properties: attributes,
    event_properties: {
      source: 'AI Fit Score',
      top_match: String(body.top_match || ''),
      top_score: numberOrBlank(body.top_score),
      top_category: String(body.top_category || ''),
      top_pricing: String(body.top_pricing || ''),
      top_setup: String(body.top_setup || ''),
      top_best_for: String(body.top_best_for || ''),
      top_matches: String(body.top_matches || ''),
      company_size: String(body.company_size || ''),
      industry: String(body.industry || ''),
      challenges: joinList(body.challenges),
      budget: String(body.budget || ''),
      current_tools: joinList(body.current_tools),
      tech_level: String(body.tech_level || ''),
      submitted_at: String(body.submitted_at || new Date().toISOString()),
      utm_source: String(body.utm_source || ''),
      utm_medium: String(body.utm_medium || ''),
      utm_campaign: String(body.utm_campaign || ''),
      utm_content: String(body.utm_content || ''),
      utm_term: String(body.utm_term || '')
    }
  };

  const brevoEventResponse = await fetch('https://api.brevo.com/v3/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY
    },
    body: JSON.stringify(eventPayload)
  });

  const resultText = await brevoEventResponse.text();
  let result;
  try {
    result = resultText ? JSON.parse(resultText) : {};
  } catch (err) {
    result = { raw: resultText };
  }

  return {
    ok: brevoEventResponse.ok,
    status: brevoEventResponse.status,
    details: result
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
    const attributes = {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      COMPANY: body.company || '',
      CRS_SOURCE: 'AI Fit Score',
      CRS_COMPANY_SIZE: body.company_size || '',
      CRS_INDUSTRY: body.industry || '',
      CRS_CHALLENGES: joinList(body.challenges),
      CRS_BUDGET: body.budget || '',
      CRS_CURRENT_TOOLS: joinList(body.current_tools),
      CRS_TECH_LEVEL: body.tech_level || '',
      CRS_TOP_MATCH: body.top_match || '',
      CRS_TOP_SCORE: body.top_score || '',
      CRS_UTM_SOURCE: body.utm_source || '',
      CRS_UTM_MEDIUM: body.utm_medium || '',
      CRS_UTM_CAMPAIGN: body.utm_campaign || '',
      CRS_UTM_CONTENT: body.utm_content || '',
      CRS_UTM_TERM: body.utm_term || ''
    };

    const payload = {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes
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

    let eventResult;
    try {
      eventResult = await postFitScoreEvent(env, email, attributes, body);
    } catch (err) {
      eventResult = { ok: false, error: err.message || 'Event request failed' };
    }

    return jsonResponse({ ok: true, brevo: result, event: eventResult }, 200, env);
  }
};
