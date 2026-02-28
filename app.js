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
    
    // Logo circle
    doc.setFillColor(...teal);
    doc.circle(25, 20, 10, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CRS', 25, 21.5, { align: 'center' });
    
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
