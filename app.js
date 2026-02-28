/* =============================================
   CRS365 AI Tool Matcher — Application Logic
   GitHub Pages / Static Version
   ============================================= */

/*
  NOTE — MailerLite Integration:
  MailerLite's API does not support direct browser-side calls (CORS is blocked).
  To add subscribers to MailerLite from a static site, deploy a small serverless
  proxy. Below is a ready-to-use Cloudflare Worker script:

  -----------------------------------------------------------------------
  // Cloudflare Worker — paste into workers.cloudflare.com
  const MAILERLITE_API_KEY = 'YOUR_API_KEY';
  const GROUP_ID = '180616843866670205';

  export default {
    async fetch(request) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
      const body = await request.json();
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`
        },
        body: JSON.stringify({
          email: body.email,
          fields: { name: body.name, company: body.company },
          groups: [GROUP_ID]
        })
      });
      const result = await response.json();
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  };
  // After deploying the Worker, replace the MAILERLITE_PROXY_URL constant
  // below with your Worker's URL (e.g. https://crs-mailerlite.yourname.workers.dev)
  -----------------------------------------------------------------------
*/

// Set this to your deployed Cloudflare Worker URL to enable MailerLite sync.
// Leave empty string to disable (submissions still saved to localStorage).
const MAILERLITE_PROXY_URL = 'https://crs365-tool-matcher-api.crshoop300.workers.dev';

// ============ TOOL DATABASE (embedded) ============
const TOOLS_DB = [
  {"id":1,"name":"Zapier","category":"Workflow Automation","description":"Connect your apps and automate workflows with 6,000+ integrations. No code required.","whyMatch":"Eliminates manual data entry by connecting all your existing tools automatically.","pricing":"$19.99/mo","priceValue":20,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Automating repetitive tasks between apps","pros":["6,000+ app integrations","No-code interface","Multi-step workflows","Excellent documentation"],"cons":["Can get expensive at scale","Task limits on lower plans","Complex logic can be tricky"],"integrations":["Google Workspace","Microsoft 365","Slack","Salesforce","HubSpot"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems","Team collaboration across tools"]},
  {"id":2,"name":"Make (Integromat)","category":"Workflow Automation","description":"Visual automation platform for designing, building, and automating complex workflows.","whyMatch":"Visual workflow builder ideal for complex multi-step automations at a fraction of Zapier's cost.","pricing":"$9/mo","priceValue":9,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Complex multi-step automations with branching logic","pros":["More affordable than Zapier","Visual scenario builder","Advanced logic (routers, filters)","Generous free tier"],"cons":["Steeper learning curve","Fewer native integrations","UI can feel overwhelming"],"integrations":["Google Workspace","Microsoft 365","Slack","Shopify","Airtable"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems"]},
  {"id":3,"name":"n8n","category":"Workflow Automation","description":"Open-source workflow automation tool with self-hosting option and fair-code license.","whyMatch":"Full automation power with self-hosting flexibility — ideal for technical teams wanting total control.","pricing":"$20/mo","priceValue":20,"hasFreeTier":true,"integrationEase":"Advanced","bestFor":"Technical teams wanting self-hosted automation","pros":["Self-hostable","No vendor lock-in","200+ integrations","Custom code nodes"],"cons":["Requires technical setup","Smaller community","Self-hosting needs maintenance"],"integrations":["Google Workspace","Microsoft 365","Slack","PostgreSQL","REST APIs"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems","Team collaboration across tools"]},
  {"id":4,"name":"ChatGPT Team","category":"AI & Custom GPTs","description":"OpenAI's ChatGPT with team features, custom GPTs, and advanced data analysis.","whyMatch":"Create custom AI assistants for content, analysis, and customer-facing tasks — no coding needed.","pricing":"$25/user/mo","priceValue":25,"hasFreeTier":false,"integrationEase":"Easy","bestFor":"Content creation, data analysis, and custom AI assistants","pros":["Custom GPT builders","Advanced data analysis","Team workspace","Constantly improving"],"cons":["Per-user pricing adds up","Outputs need human review","Data privacy considerations"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier"],"challenges":["Content creation at scale","Data analysis & reporting","Customer support efficiency"],"spotlight":true},
  {"id":5,"name":"Claude for Business","category":"AI & Custom GPTs","description":"Anthropic's Claude AI with enterprise features, long-context windows, and safety-focused design.","whyMatch":"Best-in-class for long document analysis and nuanced writing — with enterprise-grade safety.","pricing":"$28/user/mo","priceValue":28,"hasFreeTier":false,"integrationEase":"Easy","bestFor":"Long document analysis, writing, and research","pros":["200K context window","Excellent reasoning","Strong safety features","Great for writing"],"cons":["Fewer integrations than ChatGPT","Per-user pricing","Less multimodal capability"],"integrations":["Google Workspace","Slack","Zapier","REST APIs"],"challenges":["Content creation at scale","Data analysis & reporting"]},
  {"id":6,"name":"HubSpot CRM","category":"CRM & Sales","description":"All-in-one CRM platform with marketing, sales, and service hubs built on a free core.","whyMatch":"Unified CRM that connects marketing, sales, and support — with a genuinely useful free tier.","pricing":"$15/user/mo","priceValue":15,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Growing businesses needing an all-in-one CRM","pros":["Generous free tier","All-in-one platform","Excellent onboarding","1,000+ integrations"],"cons":["Gets expensive at higher tiers","Can be complex to configure","Some features locked behind upgrades"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier","Salesforce"],"challenges":["Lead management & follow-up","Sales pipeline visibility","Customer support efficiency","Disconnected tools/systems"]},
  {"id":7,"name":"Pipedrive","category":"CRM & Sales","description":"Sales-focused CRM built by salespeople, with visual pipeline management and smart automation.","whyMatch":"Visual pipeline management that keeps your sales team focused on deals that matter most.","pricing":"$14/user/mo","priceValue":14,"hasFreeTier":false,"integrationEase":"Easy","bestFor":"Sales teams wanting visual pipeline management","pros":["Intuitive visual pipeline","Sales-focused features","Great mobile app","Affordable per-user pricing"],"cons":["Limited marketing features","Basic reporting on lower plans","Fewer integrations than HubSpot"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier"],"challenges":["Lead management & follow-up","Sales pipeline visibility"]},
  {"id":8,"name":"Salesforce Essentials","category":"CRM & Sales","description":"Enterprise-grade CRM scaled for small businesses with AI-powered insights and automation.","whyMatch":"Enterprise-grade CRM power scaled for your business — with AI insights built in.","pricing":"$25/user/mo","priceValue":25,"hasFreeTier":false,"integrationEase":"Moderate","bestFor":"Businesses planning to scale that need enterprise CRM","pros":["Industry-leading CRM","Einstein AI insights","Massive ecosystem","Highly customizable"],"cons":["Steep learning curve","Implementation costs","Complex pricing structure"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier","REST APIs"],"challenges":["Lead management & follow-up","Sales pipeline visibility","Customer support efficiency","Data analysis & reporting"]},
  {"id":9,"name":"Looker Studio (Google)","category":"Analytics & BI","description":"Free business intelligence and data visualization tool by Google with native GCP integrations.","whyMatch":"Free, powerful dashboards that connect directly to your Google ecosystem.","pricing":"Free","priceValue":0,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Teams already in the Google ecosystem needing dashboards","pros":["Completely free","Native Google integrations","Shareable dashboards","Community connectors"],"cons":["Limited to Google ecosystem","Can be slow with large datasets","Less powerful than paid alternatives"],"integrations":["Google Workspace","REST APIs"],"challenges":["Data analysis & reporting"]},
  {"id":10,"name":"Power BI","category":"Analytics & BI","description":"Microsoft's business analytics platform with rich visualizations and enterprise data modeling.","whyMatch":"Enterprise-grade analytics that integrates seamlessly with your Microsoft stack.","pricing":"$10/user/mo","priceValue":10,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Microsoft-heavy organizations needing advanced analytics","pros":["Deep Microsoft integration","DAX for advanced modeling","Rich visualization library","Free desktop version"],"cons":["Best with Microsoft stack","DAX learning curve","Premium features expensive"],"integrations":["Microsoft 365","REST APIs","SQL databases"],"challenges":["Data analysis & reporting","Sales pipeline visibility"]},
  {"id":11,"name":"Notion AI","category":"AI & Custom GPTs","description":"All-in-one workspace with built-in AI for docs, wikis, projects, and knowledge management.","whyMatch":"Unified workspace where AI helps your team write, organize, and find information faster.","pricing":"$10/user/mo","priceValue":10,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Team knowledge management and project documentation","pros":["All-in-one workspace","Built-in AI assistant","Beautiful templates","Great for documentation"],"cons":["Can be slow with large databases","Offline access limited","Learning curve for advanced features"],"integrations":["Google Workspace","Slack","Zapier","GitHub"],"challenges":["Content creation at scale","Team collaboration across tools","Customer support efficiency"]},
  {"id":12,"name":"Tableau","category":"Analytics & BI","description":"Industry-leading data visualization and analytics platform for exploring and sharing insights.","whyMatch":"Best-in-class data visualization for teams that need to explore data intuitively.","pricing":"$75/user/mo","priceValue":75,"hasFreeTier":false,"integrationEase":"Advanced","bestFor":"Data-driven organizations needing advanced visualization","pros":["Best-in-class visualizations","Powerful data exploration","Active community","Wide data connectivity"],"cons":["Expensive","Requires training","Heavy desktop application"],"integrations":["Google Workspace","Microsoft 365","REST APIs","SQL databases"],"challenges":["Data analysis & reporting"]},
  {"id":13,"name":"Intercom","category":"CRM & Sales","description":"AI-first customer service platform with chat, help desk, and proactive support features.","whyMatch":"AI-powered customer support that resolves issues automatically while keeping the human touch.","pricing":"$39/seat/mo","priceValue":39,"hasFreeTier":false,"integrationEase":"Moderate","bestFor":"SaaS companies needing AI-powered customer support","pros":["Fin AI chatbot","Unified inbox","Product tours","Rich customer data"],"cons":["Can get expensive","Complex pricing","Overwhelming feature set"],"integrations":["Google Workspace","Slack","Zapier","Salesforce"],"challenges":["Customer support efficiency","Lead management & follow-up"]},
  {"id":14,"name":"Airtable","category":"Workflow Automation","description":"Flexible low-code platform combining spreadsheet simplicity with database power and automations.","whyMatch":"Spreadsheet-meets-database flexibility that non-technical teams can build powerful apps on.","pricing":"$20/user/mo","priceValue":20,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Teams needing flexible data management without code","pros":["Intuitive interface","Powerful automations","Rich field types","Great API"],"cons":["Row limits on free plan","Can get expensive","Performance with large datasets"],"integrations":["Google Workspace","Slack","Zapier","Make"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems","Team collaboration across tools","Data analysis & reporting"]},
  {"id":15,"name":"Jasper AI","category":"AI & Custom GPTs","description":"Enterprise AI content platform with brand voice, templates, and team collaboration features.","whyMatch":"Purpose-built for marketing content at scale — with brand voice consistency built in.","pricing":"$49/mo","priceValue":49,"hasFreeTier":false,"integrationEase":"Easy","bestFor":"Marketing teams creating content at scale","pros":["Brand voice training","50+ content templates","Team collaboration","Chrome extension"],"cons":["Expensive for individuals","Outputs still need editing","Limited outside marketing use"],"integrations":["Google Workspace","Zapier","Surfer SEO"],"challenges":["Content creation at scale"]},
  {"id":16,"name":"Monday.com","category":"Workflow Automation","description":"Work OS platform for project management, automations, and team collaboration dashboards.","whyMatch":"Visual project hub that keeps everyone aligned with built-in automations and dashboards.","pricing":"$9/seat/mo","priceValue":9,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Teams needing visual project management with automations","pros":["Beautiful UI","200+ automations","Multiple board views","Dashboards included"],"cons":["Minimum 3-seat purchase","Can get complex quickly","Advanced features cost more"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier"],"challenges":["Team collaboration across tools","Disconnected tools/systems","Manual data entry & repetitive tasks"]},
  {"id":17,"name":"Perplexity Pro","category":"AI & Custom GPTs","description":"AI-powered research and answer engine with real-time web search, citations, and file analysis.","whyMatch":"AI research assistant that searches the web in real-time and cites every source — perfect for data-driven decisions.","pricing":"$20/mo","priceValue":20,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Research-heavy teams needing AI-powered information retrieval","pros":["Real-time web search","Source citations","File analysis","Multiple AI models"],"cons":["Less customizable than ChatGPT","Focused on search/research","Limited content generation templates"],"integrations":["REST APIs","Slack"],"challenges":["Data analysis & reporting","Content creation at scale"]},
  {"id":18,"name":"ActiveCampaign","category":"CRM & Sales","description":"Email marketing and CRM platform with advanced automation, segmentation, and lead scoring.","whyMatch":"Best-in-class email automation with CRM built in — perfect for nurturing leads through complex funnels.","pricing":"$29/mo","priceValue":29,"hasFreeTier":false,"integrationEase":"Moderate","bestFor":"Businesses focused on email marketing and lead nurturing","pros":["Advanced automation builder","Built-in CRM","Lead scoring","900+ integrations"],"cons":["Steeper learning curve","Pricing increases with contacts","Can be overkill for simple needs"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier","Shopify"],"challenges":["Lead management & follow-up","Sales pipeline visibility","Customer support efficiency"]},
  {"id":19,"name":"Microsoft Power Automate","category":"Workflow Automation","description":"Enterprise workflow automation with RPA capabilities, deeply integrated with the Microsoft 365 ecosystem.","whyMatch":"If your team lives in Microsoft 365, this extends every Office app with smart automations and desktop RPA.","pricing":"$15/user/mo","priceValue":15,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Microsoft 365 organizations needing enterprise workflow automation","pros":["Deep Microsoft 365 integration","RPA desktop automation included","AI Builder for intelligent workflows"],"cons":["Best value only with Microsoft 365","Complex licensing model","Less intuitive than Zapier or Make"],"integrations":["Microsoft 365","Slack","REST APIs"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems","Team collaboration across tools"]},
  {"id":20,"name":"Workato","category":"Workflow Automation","description":"Enterprise-grade iPaaS connecting cloud and on-premise apps with AI-assisted recipe building for large organizations.","whyMatch":"Enterprise powerhouse for connecting complex multi-system workflows with governance and compliance built in.","pricing":"$15K–50K/yr","priceValue":1250,"hasFreeTier":false,"integrationEase":"Advanced","bestFor":"Mid-to-large enterprises with complex, multi-system automation needs","pros":["Enterprise governance with RBAC","On-premise connectivity","Workbot for Slack/Teams automation"],"cons":["No public pricing — requires sales","Very expensive for SMBs","Steep learning curve"],"integrations":["Microsoft 365","Slack","REST APIs"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems","Team collaboration across tools"]},
  {"id":21,"name":"Activepieces","category":"Workflow Automation","description":"Open-source automation platform with drag-and-drop builder, self-hosting option, and flat-rate pricing.","whyMatch":"Zapier-like power with open-source flexibility — unlimited runs and predictable pricing for growing teams.","pricing":"$25/mo","priceValue":25,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Startups wanting Zapier functionality with open-source flexibility","pros":["Open-source with MIT license","Flat-rate pricing, unlimited runs","Built-in AI agents and MCP support"],"cons":["Smaller integration library (350+)","Less mature ecosystem","Enterprise features require custom contract"],"integrations":["Google Workspace","Slack","REST APIs","Zapier"],"challenges":["Manual data entry & repetitive tasks","Disconnected tools/systems"]},
  {"id":22,"name":"Google Gemini","category":"AI & Custom GPTs","description":"Google's multimodal AI integrated across Google Workspace for text, image, video, and audio intelligence.","whyMatch":"AI deeply embedded in your Google Workspace — summarize emails, draft docs, and analyze data natively.","pricing":"$19.99/mo","priceValue":20,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Google Workspace users wanting native AI across Gmail, Docs, and Sheets","pros":["Deep Google Workspace integration","Competitive API pricing","Real-time Google Search grounding"],"cons":["Best value within Google ecosystem","Less established developer ecosystem","Advanced features need subscription"],"integrations":["Google Workspace","Zapier"],"challenges":["Content creation at scale","Data analysis & reporting"]},
  {"id":23,"name":"Microsoft Copilot","category":"AI & Custom GPTs","description":"AI assistant embedded across Microsoft 365 apps — Word, Excel, Teams, Outlook — using organizational data.","whyMatch":"AI productivity baked into every Microsoft app your team already uses — summarize meetings, draft emails, analyze data.","pricing":"$30/user/mo","priceValue":30,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"Microsoft 365 organizations wanting AI in Word, Excel, Teams, and Outlook","pros":["Seamless Microsoft 365 integration","Uses org data for context-aware AI","SMB pricing at $21/user/mo"],"cons":["Requires Microsoft 365 subscription","$30/user adds up for large teams","Feature depth varies across apps"],"integrations":["Microsoft 365","Slack"],"challenges":["Content creation at scale","Data analysis & reporting","Team collaboration across tools"]},
  {"id":24,"name":"Custom GPT Builders","category":"AI & Custom GPTs","description":"Build customized, shareable AI assistants with specific instructions and knowledge — no coding required.","whyMatch":"Create branded AI assistants for your team or customers in minutes — no developers needed.","pricing":"$20/mo","priceValue":20,"hasFreeTier":false,"integrationEase":"Easy","bestFor":"Building branded, specialized AI assistants without coding","pros":["No-code builder","Included with ChatGPT Plus","Publishable to GPT Store"],"cons":["Limited to ChatGPT ecosystem","50MB upload limit per GPT","Requires paid ChatGPT plan"],"integrations":["Google Workspace","REST APIs","Zapier"],"challenges":["Content creation at scale","Customer support efficiency"]},
  {"id":25,"name":"Relevance AI","category":"AI & Custom GPTs","description":"No-code platform for building AI agent workforces that automate complex multi-step business processes.","whyMatch":"Build autonomous AI agents that handle sales, support, and ops workflows — agents that work while you sleep.","pricing":"$19/mo","priceValue":19,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Businesses wanting AI agent workflows for sales and process automation","pros":["Multi-agent orchestration","9,000+ tools accessible to agents","No-code agent builder"],"cons":["Credit-based pricing is complex","20% LLM markup without own API key","Limited native integrations"],"integrations":["Google Workspace","Slack","Zapier"],"challenges":["Manual data entry & repetitive tasks","Lead management & follow-up","Customer support efficiency"]},
  {"id":26,"name":"Close CRM","category":"CRM & Sales","description":"Sales-first CRM with built-in calling, SMS, and email for high-velocity inside sales teams.","whyMatch":"Built-in power dialer, SMS, and email in one CRM — designed for teams that sell by phone and outbound.","pricing":"$35/user/mo","priceValue":35,"hasFreeTier":false,"integrationEase":"Moderate","bestFor":"Inside sales and SDR teams doing high-volume outbound","pros":["Built-in power dialer and SMS","Transparent per-user pricing","Purpose-built for outbound sales"],"cons":["Expensive at 15+ reps","Limited marketing automation","Advanced features need Growth plan"],"integrations":["Google Workspace","Slack","Zapier"],"challenges":["Lead management & follow-up","Sales pipeline visibility"]},
  {"id":27,"name":"Freshsales","category":"CRM & Sales","description":"AI-powered CRM with built-in telephony, Freddy AI for lead scoring, and deal insights at affordable pricing.","whyMatch":"Affordable CRM with AI lead scoring and built-in phone — all the power without the Salesforce price tag.","pricing":"$9/user/mo","priceValue":9,"hasFreeTier":true,"integrationEase":"Easy","bestFor":"SMBs wanting AI-assisted CRM with built-in communication","pros":["Very competitive pricing","Freddy AI built-in","Native chat, email, and phone"],"cons":["Fewer integrations than HubSpot","Advanced AI locked to Pro+ plans","Less customizable than Salesforce"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier"],"challenges":["Lead management & follow-up","Sales pipeline visibility","Customer support efficiency"]},
  {"id":28,"name":"Zoho CRM","category":"CRM & Sales","description":"Highly customizable CRM with AI-powered automation, advanced analytics, and a free tier.","whyMatch":"Deep customization at a fraction of Salesforce pricing — with Zia AI assistant for smart predictions.","pricing":"$14/user/mo","priceValue":14,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Cost-conscious SMBs needing deep CRM customization","pros":["Most stable pricing in industry","Free plan for up to 3 users","Zia AI on Enterprise tier"],"cons":["UI less polished than HubSpot","AI features need Enterprise plan","Steeper learning curve"],"integrations":["Google Workspace","Microsoft 365","Slack","Zapier"],"challenges":["Lead management & follow-up","Sales pipeline visibility"]},
  {"id":29,"name":"Looker","category":"Analytics & BI","description":"Google Cloud's enterprise BI platform with LookML semantic layer for consistent data definitions.","whyMatch":"Enterprise-grade BI with governed metrics — ideal for data-mature teams on Google Cloud.","pricing":"$60K+/yr","priceValue":5000,"hasFreeTier":false,"integrationEase":"Advanced","bestFor":"Enterprise data teams on Google Cloud needing governed analytics","pros":["LookML semantic layer","Strong embedded analytics","Native BigQuery integration"],"cons":["$60K+/year minimum","Requires developer expertise","Limited self-service for non-technical users"],"integrations":["Google Workspace","REST APIs"],"challenges":["Data analysis & reporting"]},
  {"id":30,"name":"Mixpanel","category":"Analytics & BI","description":"Product analytics platform for event-based user behavior tracking, funnel analysis, and retention.","whyMatch":"Best-in-class funnel and retention analytics — see exactly where users drop off and why.","pricing":"$0 (1M events)","priceValue":0,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Product teams needing deep user journey and funnel analytics","pros":["Best funnel and retention analysis","Generous free tier (1M events)","Startup program — 1 year free"],"cons":["Pricing scales steeply","Advanced features are add-ons","Free tier reduced from 20M to 1M"],"integrations":["Google Workspace","Slack","REST APIs"],"challenges":["Data analysis & reporting"]},
  {"id":31,"name":"Amplitude","category":"Analytics & BI","description":"Digital analytics platform combining event tracking, behavioral cohorts, A/B testing, and session replay.","whyMatch":"Full product intelligence suite — analytics, experiments, and session replay in one platform.","pricing":"$49/mo","priceValue":49,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Product teams needing advanced behavioral analytics with experimentation","pros":["Analytics + experiments + session replay","Strong behavioral cohort analysis","Dedicated customer success"],"cons":["Expensive at scale ($100K+/yr)","A/B testing priced separately","Complex pricing with add-ons"],"integrations":["Slack","REST APIs"],"challenges":["Data analysis & reporting"]},
  {"id":32,"name":"Metabase","category":"Analytics & BI","description":"Open-source BI tool that lets non-technical users run queries and build dashboards through a simple interface.","whyMatch":"Free, self-hostable BI that your whole team can use — no SQL knowledge required.","pricing":"Free (self-hosted)","priceValue":0,"hasFreeTier":true,"integrationEase":"Moderate","bestFor":"Startups wanting fast, accessible BI for non-technical stakeholders","pros":["Open-source and free to self-host","No SQL needed for basic queries","White-label embeddable analytics"],"cons":["Large price jump to Enterprise","Performance degrades at scale","Limited advanced visualizations"],"integrations":["REST APIs"],"challenges":["Data analysis & reporting"]}
];

// ============ STATE ============
let currentStep = 1;
const totalSteps = 6;
let formData = {
    companySize: '',
    industry: '',
    challenges: [],
    budget: '',
    currentTools: [],
    techLevel: ''
};
let scoredTools = [];
let selectedForCompare = [];
let activeFilter = 'All';
let activeSort = 'score';

// ============ DOM REFS ============
const sections = {
    hero: document.getElementById('hero-section'),
    assessment: document.getElementById('assessment-section'),
    email: document.getElementById('email-section'),
    results: document.getElementById('results-section')
};

// ============ NAVIGATION ============
function showSection(name) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
    showSection('assessment');
    showStep(1);
});

// ============ FORM STEPS ============
function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (activeStep) {
        activeStep.style.display = 'block';
        // Trigger animation
        activeStep.offsetHeight; // force reflow
        activeStep.classList.add('active');
    }

    // Update progress
    const fill = document.getElementById('progress-fill');
    fill.style.width = `${(step / totalSteps) * 100}%`;
    document.getElementById('progress-text').textContent = `Question ${step} of ${totalSteps}`;

    // Back button visibility
    const prevBtn = document.getElementById('prev-btn');
    prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

    // Next button text
    const nextBtn = document.getElementById('next-btn');
    nextBtn.innerHTML = step === totalSteps 
        ? 'Finish <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : 'Continue <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    validateStep();
}

// Next / Prev
document.getElementById('next-btn').addEventListener('click', () => {
    saveStepData();
    if (currentStep < totalSteps) {
        showStep(currentStep + 1);
    } else {
        // Go to email gate
        showSection('email');
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
});

// Save form step data
function saveStepData() {
    switch(currentStep) {
        case 1:
            const sizeRadio = document.querySelector('input[name="companySize"]:checked');
            if (sizeRadio) formData.companySize = sizeRadio.value;
            break;
        case 2:
            const sel = document.getElementById('industry-select');
            if (sel.value === 'Other') {
                formData.industry = document.getElementById('other-industry').value || 'Other';
            } else {
                formData.industry = sel.value;
            }
            break;
        case 3:
            formData.challenges = Array.from(document.querySelectorAll('input[name="challenges"]:checked')).map(c => c.value);
            break;
        case 4:
            const budgetRadio = document.querySelector('input[name="budget"]:checked');
            if (budgetRadio) formData.budget = budgetRadio.value;
            break;
        case 5:
            formData.currentTools = Array.from(document.querySelectorAll('input[name="currentTools"]:checked')).map(c => c.value);
            break;
        case 6:
            const techRadio = document.querySelector('input[name="techLevel"]:checked');
            if (techRadio) formData.techLevel = techRadio.value;
            break;
    }
}

// Validate step
function validateStep() {
    const nextBtn = document.getElementById('next-btn');
    let valid = false;
    switch(currentStep) {
        case 1:
            valid = !!document.querySelector('input[name="companySize"]:checked');
            break;
        case 2:
            const sel = document.getElementById('industry-select');
            valid = sel.value !== '';
            if (sel.value === 'Other') {
                valid = document.getElementById('other-industry').value.trim().length > 0;
            }
            break;
        case 3:
            valid = document.querySelectorAll('input[name="challenges"]:checked').length > 0;
            break;
        case 4:
            valid = !!document.querySelector('input[name="budget"]:checked');
            break;
        case 5:
            valid = document.querySelectorAll('input[name="currentTools"]:checked').length > 0;
            break;
        case 6:
            valid = !!document.querySelector('input[name="techLevel"]:checked');
            break;
    }
    nextBtn.disabled = !valid;
}

// Listen for input changes to validate
document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', validateStep);
});

document.getElementById('industry-select').addEventListener('change', function() {
    const wrapper = document.getElementById('other-industry-wrapper');
    if (this.value === 'Other') {
        wrapper.classList.remove('hidden');
    } else {
        wrapper.classList.add('hidden');
    }
    validateStep();
});

document.getElementById('other-industry').addEventListener('input', validateStep);

// Other tools toggle
document.querySelectorAll('input[name="currentTools"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const otherCb = document.querySelector('input[name="currentTools"][value="Other"]');
        const wrapper = document.getElementById('other-tools-wrapper');
        if (otherCb && otherCb.checked) {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
        validateStep();
    });
});

// ============ EMAIL FORM SUBMISSION ============
document.getElementById('email-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const company = document.getElementById('user-company').value.trim();
    const newsletter = document.getElementById('newsletter-opt').checked;

    if (!name || !email) return;

    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';
    submitBtn.disabled = true;

    // Save to formData
    formData.name = name;
    formData.email = email;
    formData.company = company;
    formData.newsletterOptIn = newsletter;

    // Save submission to localStorage
    // NOTE: localStorage is per-browser/device. For cross-device access,
    // view submissions via the MailerLite dashboard once a proxy is configured.
    try {
        const submissions = JSON.parse(localStorage.getItem('crs_submissions') || '[]');
        const submission = {
            id: Date.now(),
            name: formData.name,
            email: formData.email,
            company: formData.company,
            company_size: formData.companySize,
            industry: formData.industry,
            challenges: formData.challenges,
            budget: formData.budget,
            current_tools: formData.currentTools,
            tech_level: formData.techLevel,
            newsletter_opt_in: formData.newsletterOptIn,
            submitted_at: new Date().toISOString()
        };
        submissions.push(submission);
        localStorage.setItem('crs_submissions', JSON.stringify(submissions));
    } catch (err) {
        console.log('localStorage save failed (non-blocking):', err);
    }

    // Sync to MailerLite via proxy (if configured)
    if (MAILERLITE_PROXY_URL) {
        try {
            await fetch(MAILERLITE_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    company: formData.company
                })
            });
        } catch (err) {
            console.log('MailerLite proxy call failed (non-blocking):', err);
        }
    }

    // Calculate scores and show results
    scoredTools = calculateScores();
    
    // Simulate brief "analyzing" delay for UX
    await new Promise(r => setTimeout(r, 1200));
    
    submitBtn.innerHTML = origHTML;
    submitBtn.disabled = false;

    showSection('results');
    renderResults();
});


// ============ CRS FIT SCORE ALGORITHM ============
function calculateScores() {
    const results = TOOLS_DB.map(tool => {
        let score = 0;

        // 1. Challenge Relevance (30% weight, max 30 points)
        if (formData.challenges.length > 0) {
            const matchedChallenges = formData.challenges.filter(c => tool.challenges.includes(c));
            const challengeRatio = matchedChallenges.length / formData.challenges.length;
            score += challengeRatio * 30;
        } else {
            score += 15; // neutral if no challenges selected
        }

        // 2. Budget Alignment (30% weight, max 30 points)
        const budgetScore = getBudgetScore(tool, formData.budget);
        score += budgetScore;

        // 3. Technical Match (25% weight, max 25 points)
        const techScore = getTechScore(tool.integrationEase, formData.techLevel);
        score += techScore;

        // 4. Ecosystem Fit (15% weight, max 15 points)
        const ecosystemScore = getEcosystemScore(tool, formData.currentTools);
        score += ecosystemScore;

        // Clamp to 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));

        return { ...tool, score };
    });

    // Sort by score desc
    results.sort((a, b) => b.score - a.score);
    return results;
}

function getBudgetScore(tool, budget) {
    const price = tool.priceValue;
    const hasFree = tool.hasFreeTier;
    
    switch(budget) {
        case 'Under $50/mo':
            if (hasFree || price === 0) return 30;
            if (price <= 20) return 25;
            if (price <= 50) return 15;
            return 5;
        case '$50-200/mo':
            if (price <= 30) return 28;
            if (price <= 50) return 25;
            if (price <= 75) return 18;
            return 10;
        case '$200-500/mo':
            return 26; // most tools fit well
        case '$500-1000/mo':
            return 28; // enterprise tools become viable
        case '$1000+/mo':
            return 30; // everything fits
        default:
            return 15;
    }
}

function getTechScore(ease, techLevel) {
    const baseScore = 12.5; // neutral middle
    switch(techLevel) {
        case 'Non-technical':
            if (ease === 'Easy') return 25;
            if (ease === 'Moderate') return 12;
            if (ease === 'Advanced') return 5;
            break;
        case 'Somewhat technical':
            if (ease === 'Easy') return 20;
            if (ease === 'Moderate') return 22;
            if (ease === 'Advanced') return 18;
            break;
        case 'Very technical':
            if (ease === 'Easy') return 18;
            if (ease === 'Moderate') return 22;
            if (ease === 'Advanced') return 25;
            break;
    }
    return baseScore;
}

function getEcosystemScore(tool, userTools) {
    if (!userTools || userTools.length === 0 || userTools.includes('None/Just getting started')) {
        return 8; // neutral
    }
    
    const relevantUserTools = userTools.filter(t => t !== 'Other' && t !== 'None/Just getting started');
    if (relevantUserTools.length === 0) return 8;
    
    const matchCount = relevantUserTools.filter(ut => tool.integrations.includes(ut)).length;
    const ratio = matchCount / relevantUserTools.length;
    return Math.round(ratio * 15);
}

// ============ RENDER RESULTS ============
function renderResults() {
    renderTopMatches();
    renderResultsGrid();
    renderSpotlight();
    renderCTA();
    
    // Animate scores after a brief delay
    setTimeout(animateScores, 300);
}

function getScoreColor(score) {
    if (score >= 80) return 'var(--green)';
    if (score >= 60) return 'var(--yellow)';
    return 'var(--orange)';
}

function getCategoryBadgeClass(category) {
    switch(category) {
        case 'Workflow Automation': return 'badge-automation';
        case 'AI & Custom GPTs': return 'badge-ai';
        case 'CRM & Sales': return 'badge-crm';
        case 'Analytics & BI': return 'badge-analytics';
        default: return 'badge-automation';
    }
}

function getEaseClass(ease) {
    switch(ease) {
        case 'Easy': return 'ease-easy';
        case 'Moderate': return 'ease-moderate';
        case 'Advanced': return 'ease-advanced';
        default: return '';
    }
}

// Top Matches Cards
function renderTopMatches() {
    const container = document.getElementById('top-matches');
    const top = scoredTools.slice(0, 4);
    const rankLabels = ['#1 Pick', '#2 Pick', '#3 Pick', '#4 Pick'];
    
    container.innerHTML = top.map((tool, i) => {
        const circumference = 2 * Math.PI * 33;
        const offset = circumference - (tool.score / 100) * circumference;
        const color = getScoreColor(tool.score);
        
        return `
        <div class="top-match-card rank-${i+1}" style="animation: fadeInUp ${0.4 + i*0.15}s ease-out both;">
            <span class="top-match-rank">${rankLabels[i]}</span>
            <h3 class="top-match-name">${tool.name}</h3>
            <span class="category-badge ${getCategoryBadgeClass(tool.category)}">${tool.category}</span>
            <div class="score-gauge">
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle class="score-gauge-bg" cx="40" cy="40" r="33"/>
                    <circle class="score-gauge-fill" cx="40" cy="40" r="33"
                        stroke="${color}"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${circumference}"
                        data-target-offset="${offset}"/>
                </svg>
                <span class="score-gauge-text" style="color:${color}" data-target="${tool.score}">0</span>
            </div>
            <p class="top-match-why">${tool.whyMatch}</p>
            <span class="top-match-price">Starting at ${tool.pricing}</span>
        </div>`;
    }).join('');
}

// Full Results Grid
function renderResultsGrid() {
    const container = document.getElementById('results-grid');
    let filtered = scoredTools;
    
    if (activeFilter !== 'All') {
        filtered = scoredTools.filter(t => t.category === activeFilter);
    }

    // Sort
    switch(activeSort) {
        case 'score':
            filtered.sort((a, b) => b.score - a.score);
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.priceValue - b.priceValue);
            break;
        case 'ease':
            const easeOrder = { 'Easy': 0, 'Moderate': 1, 'Advanced': 2 };
            filtered.sort((a, b) => easeOrder[a.integrationEase] - easeOrder[b.integrationEase]);
            break;
    }

    container.innerHTML = filtered.map((tool, i) => {
        const color = getScoreColor(tool.score);
        const isSelected = selectedForCompare.includes(tool.id);
        
        return `
        <div class="result-row" data-tool-id="${tool.id}" style="animation: fadeInUp ${0.1 + i*0.05}s ease-out both;">
            <div class="result-row-main" onclick="toggleExpand(this.parentElement)">
                <input type="checkbox" class="result-checkbox" 
                    ${isSelected ? 'checked' : ''} 
                    onclick="event.stopPropagation(); toggleCompare(${tool.id}, this.checked)">
                <div class="result-name-col">
                    <span class="result-name">${tool.name}</span>
                    <span class="result-category">${tool.category}</span>
                </div>
                <div class="result-score-col">
                    <div class="score-bar-container">
                        <div class="score-bar-fill" style="width: 0%; background: ${color};" data-target-width="${tool.score}%"></div>
                    </div>
                    <span class="score-bar-value" style="color: ${color};">${tool.score}</span>
                </div>
                <span class="result-pricing">${tool.pricing}</span>
                <span class="result-ease ${getEaseClass(tool.integrationEase)}">${tool.integrationEase}</span>
                <span class="result-bestfor">${tool.bestFor}</span>
                <span class="expand-icon">&#9660;</span>
            </div>
            <div class="result-expanded">
                <div class="expanded-grid">
                    <div class="expanded-col">
                        <h4>Pros</h4>
                        <ul class="pros-list">${tool.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div class="expanded-col">
                        <h4>Cons</h4>
                        <ul class="cons-list">${tool.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                    <div class="expanded-col">
                        <h4>Integrations</h4>
                        <ul class="integrations-list">${tool.integrations.map(ig => `<li>${ig}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    // Animate score bars
    setTimeout(() => {
        container.querySelectorAll('.score-bar-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target-width');
        });
    }, 200);
}

// Spotlight
function renderSpotlight() {
    const spotlightTool = scoredTools.find(t => t.spotlight) || scoredTools[0];
    const container = document.getElementById('spotlight-section');
    
    container.innerHTML = `
        <span class="spotlight-badge">This Week's Spotlight</span>
        <h3 class="spotlight-title">${spotlightTool.name}</h3>
        <p class="spotlight-desc">${spotlightTool.description}</p>
        <div class="spotlight-details">
            <div class="spotlight-detail">
                <span class="spotlight-detail-label">Your Fit Score</span>
                <span class="spotlight-detail-value" style="color: ${getScoreColor(spotlightTool.score)}">${spotlightTool.score}/100</span>
            </div>
            <div class="spotlight-detail">
                <span class="spotlight-detail-label">Pricing</span>
                <span class="spotlight-detail-value">${spotlightTool.pricing}</span>
            </div>
            <div class="spotlight-detail">
                <span class="spotlight-detail-label">Setup Difficulty</span>
                <span class="spotlight-detail-value">${spotlightTool.integrationEase}</span>
            </div>
            <div class="spotlight-detail">
                <span class="spotlight-detail-label">Best For</span>
                <span class="spotlight-detail-value">${spotlightTool.bestFor}</span>
            </div>
        </div>
        <p class="spotlight-note">Updated weekly with real benchmarks and user insights.</p>
    `;
}

// CTA
function renderCTA() {
    const topTool = scoredTools[0];
    const container = document.getElementById('results-cta');
    
    container.innerHTML = `
        <div class="cta-content">
            <div class="cta-match-label">Your #1 Match</div>
            <h3 class="cta-match-title">${topTool.name} with a <span class="cta-score">${topTool.score}</span> CRS Fit Score</h3>
            <p class="cta-desc">Book a Free 30-Minute Consultation to learn how CRS can implement this stack for your business — and help you avoid the common pitfalls.</p>
            <div class="cta-buttons">
                <a href="https://calendly.com/chadshoop/30-minute-consult" target="_blank" rel="noopener noreferrer" class="btn-cta-primary">
                    Book Free Consultation
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <button class="btn-cta-secondary" onclick="downloadPDF()">
                    Download Your Results as PDF
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3v10m0 0l-3-3m3 3l3-3M4 17h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </div>
        </div>
    `;
}

// ============ SCORE ANIMATIONS ============
function animateScores() {
    // Animate gauge fills
    document.querySelectorAll('.score-gauge-fill').forEach(circle => {
        const targetOffset = circle.getAttribute('data-target-offset');
        setTimeout(() => {
            circle.style.strokeDashoffset = targetOffset;
        }, 100);
    });

    // Animate score numbers
    document.querySelectorAll('.score-gauge-text').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        animateNumber(el, 0, target, 1200);
    });
}

function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(from + (to - from) * eased);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============ EXPAND ROWS ============
function toggleExpand(row) {
    row.classList.toggle('expanded');
}

// ============ COMPARE FEATURE ============
function toggleCompare(toolId, checked) {
    if (checked) {
        if (selectedForCompare.length >= 3) {
            // Uncheck — max 3
            const cb = document.querySelector(`.result-row[data-tool-id="${toolId}"] .result-checkbox`);
            if (cb) cb.checked = false;
            return;
        }
        selectedForCompare.push(toolId);
    } else {
        selectedForCompare = selectedForCompare.filter(id => id !== toolId);
    }
    updateCompareButton();
}

function updateCompareButton() {
    const btn = document.getElementById('compare-btn');
    btn.textContent = `Compare (${selectedForCompare.length})`;
    btn.disabled = selectedForCompare.length < 2;
}

document.getElementById('compare-btn').addEventListener('click', () => {
    if (selectedForCompare.length < 2) return;
    openComparisonModal();
});

function openComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    const body = document.getElementById('comparison-body');
    
    const tools = selectedForCompare.map(id => scoredTools.find(t => t.id === id)).filter(Boolean);
    
    const rows = [
        { label: 'CRS Fit Score', key: 'score', format: (t) => `<span class="comparison-score" style="color:${getScoreColor(t.score)}">${t.score}</span>` },
        { label: 'Category', key: 'category', format: (t) => t.category },
        { label: 'Pricing', key: 'pricing', format: (t) => t.pricing },
        { label: 'Integration Ease', key: 'integrationEase', format: (t) => `<span class="result-ease ${getEaseClass(t.integrationEase)}" style="display:inline-block">${t.integrationEase}</span>` },
        { label: 'Free Tier', key: 'hasFreeTier', format: (t) => t.hasFreeTier ? 'Yes' : 'No' },
        { label: 'Pros', key: 'pros', format: (t) => `<ul class="pros-list" style="margin:0">${t.pros.map(p => `<li>${p}</li>`).join('')}</ul>` },
        { label: 'Cons', key: 'cons', format: (t) => `<ul class="cons-list" style="margin:0">${t.cons.map(c => `<li>${c}</li>`).join('')}</ul>` },
        { label: 'Integrations', key: 'integrations', format: (t) => t.integrations.join(', ') }
    ];
    
    body.innerHTML = `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th></th>
                    ${tools.map(t => `<th class="tool-header">${t.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>
                        <td style="font-weight:600;color:var(--text-muted);font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">${row.label}</td>
                        ${tools.map(t => `<td>${row.format(t)}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    modal.classList.add('active');
}

document.getElementById('close-compare').addEventListener('click', () => {
    document.getElementById('comparison-modal').classList.remove('active');
});

document.querySelector('.comparison-overlay').addEventListener('click', () => {
    document.getElementById('comparison-modal').classList.remove('active');
});

// ============ FILTER & SORT ============
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.getAttribute('data-filter');
        renderResultsGrid();
    });
});

document.getElementById('sort-select').addEventListener('change', function() {
    activeSort = this.value;
    renderResultsGrid();
});

const CRS_LOGO_B64 = 'data:image/png;base64,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7PHjxx64a2jM0tKy5o033ijGXUdDrq6ubd58yZju378/hsfjPfrss8/eMtVtmBcvXqzz3B4Ycjeg3Nxc69TU1GW462ho4MCBabhroJKRI0e+GDRo0HFdHw9D7tSmVCrfxF1DY6NHj/7K2dmZNDPcEUKoa9eu+bhraM7Lly8d169ff2HEiBGHUlJSmLjrMbQJEyYUstnsC7o8FobcDej7778fhbuGxgYOHHgTdw1UM2/evB26PhaG3KkrLy+PVlxcjHVL06ZMnjwZ+50ZG3NzcyvAXUNr0tPT5/L5/GczZ84M++uvv0i5HLEtrKys0IIFC8J1eSwEugElJSVhu19wcwYOHJiHuwaqmTdv3nVdJ6LAkDt1/fHHH51w19AUf39/Be4aGvPy8qLM58iRI0d2czgc9YIFCz78448/SLmKQV9CoTBNl88kfUYMIdBbcPfuXev09PS5uOtobNCgQRrcNVBNjx49an19fXXag7+6upo0yxOBfm7evNkHdw2NjRs3bmvfvn1f4q6jsf79+5NuUlxLampq7A4ePPgVh8N5ERAQsCY5OZmUv7zpqnfv3tVjx45tdeRQnx46fHC14MSJEwNx19BYly5d/ujcuXMd7jqoaNq0ad+lpKQsb+1x0EOnrpSUlEm4a2hs6dKle3HX0JRevXpVOzs755aUlHjirkUfdXV1NJlMtlUmk20dNmzYgSVLlnw2Z86cHAcHve40Sgrh4eFbR4wYca6lx/To0aNc5yesr6+H1kx77733NiGE6snU3njjje9wnxeqtvz8fCtLS8vq1s5xXFxcH9y1NtcmTJiwGfd7UNtWr149Eff5aNgqKiqQo6PjY9znpWHz8vI6WVNTg/3cNNemTJmyHvc5MkRzdna+/dFHH828fv26A+5zirPBkHszXr58iS5evPgB7joa69mz51+4a6AqXYfda2pqoIdOQWlpac6lpaVdcNfRUHh4+FIyLzF96623TGLHyZKSEs//+7//Ozx8+PDSYcOGHdizZ8/QR48emV2+md0L1tWVK1cYz58/7467jsbc3d312gcY/NOMGTP20en04pZaXV0d7OVOQT/++ONU3DU0NHLkyJhZs2aReuLZO++8cwt3DYZ248aN+Z988skNFov1YuLEiZukUqmHWq02j59p3EMEZG1btmx5C5FgKKlx27Vrlw/ucwMNX4Mh96bbixcv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';

// ============ PDF GENERATION ============
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colors
    const navy = [26, 58, 92];
    const teal = [13, 79, 79];
    const white = [255, 255, 255];
    const lightBg = [240, 244, 255];
    
    // Header background
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo image
    try {
        doc.addImage(CRS_LOGO_B64, 'PNG', 14, 10, 20, 20);
    } catch (e) {
        // Fallback to text if image fails
        doc.setFillColor(...teal);
        doc.circle(25, 20, 10, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('CRS', 25, 21.5, { align: 'center' });
    }
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('CRS365', 40, 17);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Personalized Tool Recommendations', 40, 25);
    
    // Date
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 40, 32);
    
    let y = 52;
    
    // Profile Summary
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, y - 4, pageWidth - 28, 42, 3, 3, 'F');
    
    doc.setTextColor(...navy);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Business Profile', 20, y + 4);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 101, 128);
    
    const profileLines = [
        `Company Size: ${formData.companySize}`,
        `Industry: ${formData.industry}`,
        `Budget: ${formData.budget}`,
        `Technical Level: ${formData.techLevel}`,
        `Challenges: ${formData.challenges.join(', ')}`
    ];
    
    y += 12;
    profileLines.forEach(line => {
        const maxWidth = pageWidth - 48;
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        wrappedLines.forEach(wl => {
            doc.text(wl, 20, y);
            y += 5.5;
        });
    });
    
    y += 10;
    
    // Top Matches Table
    doc.setTextColor(...navy);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Recommendations', 14, y);
    y += 8;
    
    const tableData = scoredTools.slice(0, 10).map((tool, i) => [
        `#${i + 1}`,
        tool.name,
        tool.category,
        `${tool.score}/100`,
        tool.pricing,
        tool.integrationEase
    ]);
    
    doc.autoTable({
        startY: y,
        head: [['Rank', 'Tool', 'Category', 'Fit Score', 'Pricing', 'Ease']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: navy,
            textColor: white,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [245, 248, 255]
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            3: { halign: 'center', fontStyle: 'bold' },
            5: { halign: 'center' }
        }
    });
    
    y = doc.lastAutoTable.finalY + 16;
    
    // Check if we need a new page for CTA
    if (y > 240) {
        doc.addPage();
        y = 20;
    }
    
    // CTA Box
    doc.setFillColor(...teal);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ready to implement your stack?', pageWidth / 2, y + 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Book your free 30-minute consultation:', pageWidth / 2, y + 19, { align: 'center' });
    doc.setTextColor(180, 230, 230);
    doc.text('https://calendly.com/chadshoop/30-minute-consult', pageWidth / 2, y + 25, { align: 'center' });
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Generated by CRS365.com — Optimize. Automate. Operate.', pageWidth / 2, footerY, { align: 'center' });
    
    // Generate blob and download
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CRS365-Tool-Recommendations.pdf';
    a.click();
    URL.revokeObjectURL(url);
}

// ============ MAKE FUNCTIONS GLOBAL ============
window.toggleExpand = toggleExpand;
window.toggleCompare = toggleCompare;
window.downloadPDF = downloadPDF;

// ============ ADMIN PANEL ============
const ADMIN_PW = 'crs365admin';
let adminData = [];

function showAdminLogin() {
    document.getElementById('admin-overlay').style.display = 'flex';
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    document.getElementById('admin-error').style.display = 'none';
    document.getElementById('admin-pw').value = '';
    document.getElementById('admin-pw').focus();
}

function closeAdmin() {
    document.getElementById('admin-overlay').style.display = 'none';
}

function adminAuth() {
    const pw = document.getElementById('admin-pw').value;
    if (pw === ADMIN_PW) {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-content').style.display = 'flex';
        refreshAdmin();
    } else {
        document.getElementById('admin-error').style.display = 'block';
    }
}

function refreshAdmin() {
    // Reads submissions from localStorage.
    // NOTE: localStorage is per-browser/device. Submissions made in other
    // browsers or devices will not appear here. For a central database,
    // connect a MailerLite proxy (see top-of-file comment) and use the
    // MailerLite dashboard as your canonical subscriber list.
    try {
        adminData = JSON.parse(localStorage.getItem('crs_submissions') || '[]');
        renderAdminTable(adminData);
    } catch (err) {
        console.error('Failed to read submissions from localStorage:', err);
        adminData = [];
        renderAdminTable(adminData);
    }
}

function renderAdminTable(data) {
    const tbody = document.getElementById('admin-tbody');
    document.getElementById('admin-count').textContent = `${data.length} submission${data.length !== 1 ? 's' : ''}`;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-muted);">No submissions yet.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((s, i) => {
        const challenges = Array.isArray(s.challenges) ? s.challenges.join(', ') : (s.challenges || '');
        const tools = Array.isArray(s.current_tools) ? s.current_tools.join(', ') : (s.current_tools || '');
        const date = s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A';
        const nlBadge = s.newsletter_opt_in ? '<span class="admin-badge-yes">Yes</span>' : '<span class="admin-badge-no">No</span>';

        return `<tr>
            <td>${s.id || i + 1}</td>
            <td>${date}</td>
            <td><strong>${s.name || ''}</strong></td>
            <td>${s.email || ''}</td>
            <td>${s.company || ''}</td>
            <td>${s.company_size || ''}</td>
            <td>${s.industry || ''}</td>
            <td class="challenges-cell">${challenges}</td>
            <td>${s.budget || ''}</td>
            <td class="tools-cell">${tools}</td>
            <td>${s.tech_level || ''}</td>
            <td>${nlBadge}</td>
        </tr>`;
    }).join('');
}

function exportCSV() {
    if (adminData.length === 0) return;

    const headers = ['ID','Date','Name','Email','Company','Company Size','Industry','Challenges','Budget','Current Tools','Tech Level','Newsletter'];
    const rows = adminData.map(s => [
        s.id,
        s.submitted_at || '',
        s.name || '',
        s.email || '',
        s.company || '',
        s.company_size || '',
        s.industry || '',
        Array.isArray(s.challenges) ? s.challenges.join('; ') : (s.challenges || ''),
        s.budget || '',
        Array.isArray(s.current_tools) ? s.current_tools.join('; ') : (s.current_tools || ''),
        s.tech_level || '',
        s.newsletter_opt_in ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRS365-Leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Close admin on overlay click
document.getElementById('admin-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeAdmin();
});

window.showAdminLogin = showAdminLogin;
window.closeAdmin = closeAdmin;
window.adminAuth = adminAuth;
window.refreshAdmin = refreshAdmin;
window.exportCSV = exportCSV;
