# Vercel primary website and AI search setup

Updated: 8 November 2026. This replaces the earlier split-domain plan.

## Primary and mirror

The primary website is **https://hamza-ai-engineer.vercel.app/**. Every indexable
page uses its own Vercel URL as canonical, including the homepage, resume,
gallery, services, research and project pages. GitHub Pages serves a crawlable
copy with the same Vercel canonicals. A project page points to its corresponding
Vercel project URL, not to the homepage.

Navigation, Open Graph URLs, structured-data IDs, author references, README links
and sitemap URLs all use Vercel. Existing ownership-verification tags are retained.
The resume alias `/resume.html` redirects to the primary `/resume/` URL.

The mirror is not blocked or marked `noindex`: crawlers need access to read the
canonical declarations. This is canonical consolidation, not a server-side 301
migration. GitHub Pages does not provide per-path HTTP redirect rules here.
Do not use Search Console's Change of Address unless a later deployment provides
the required old-domain HTTP redirects.

Google may replace previously indexed GitHub results with Vercel results and
rankings may fluctuate while pages are reprocessed. Canonical declarations are
signals, not guarantees of indexing, rankings, or citations by AI assistants.

## Public pages and navigation

The sitemap contains 31 preferred pages:

- Homepage, portfolio, services overview, contact, gallery and resume.
- Fifteen existing project case studies.
- Five focused service pages under `/services/`.
- A research index and four publication summaries under `/research/`.

Each non-alias page has a static navigation header. Project and content pages
have visible attribution, appropriate headings and breadcrumb structured data.
Research summaries distinguish paper results from deployed capabilities and
include dataset limitations and primary DOI sources.

The shared layout and search metadata are maintained by:

```powershell
python scripts/sync_search.py
python scripts/validate_search.py
```

Run the sync script after adding a page or changing `site-config.json`, and commit
its generated HTML/sitemap changes. It preserves the resume's document header
and the home page's section navigation. New pages should use the Vercel person ID
`https://hamza-ai-engineer.vercel.app/#person` and a distinct page-specific URL.

## Search Console and Bing Webmaster Tools

After deployment:

1. Verify the Vercel URL-prefix property in Google Search Console:
   `https://hamza-ai-engineer.vercel.app/`.
2. Submit **https://hamza-ai-engineer.vercel.app/sitemap.xml**. The older
   `sitemap-vercel.xml` remains an identical compatibility copy; submit one sitemap
   for clear reporting rather than both copies.
3. Keep the GitHub property for monitoring old URLs. Inspect its homepage and
   representative project pages; their declared canonical should be Vercel.
4. Under the Vercel property, inspect the homepage, services, resume and research
   index. Run **Test live URL**, then **Request indexing** for important HTML pages.
5. Later check the indexed report's **Google-selected canonical**. The live test
   checks access; it cannot establish Google's final canonical choice.
6. Add or import the Vercel site in Bing Webmaster Tools and submit the same
   primary sitemap. Use its URL Inspection and AI Performance reports.

If Bing supplies an HTML verification value, put it in `bingVerification` inside
`site-config.json`, run the sync script and deploy. No fake token is installed.
Account dashboards and their ownership cannot be configured through public
source alone.

## AI search crawling

`robots.txt` allows public crawling and advertises only the primary Vercel sitemap.
The wildcard permission covers Googlebot, Bingbot, OAI-SearchBot, PerplexityBot and
Claude-SearchBot without redundant named groups. A hosting firewall can still
block requests independently, so investigate actual crawler failures in hosting
logs and use providers' current published verification/IP guidance.

Search crawling and potential model training are distinct controls. This update
preserves the existing permission policy; it does not claim that allowing training
produces search rankings. No special AI schema or `llms.txt` ranking mechanism is
required for Google's AI search features.

## IndexNow

The root TXT file named by `indexNowKey` is a **public verification key**, not an
account credential. The submission helper validates canonical coverage and the
deployed key before notifying participating engines:

```powershell
python scripts/submit_indexnow.py
python scripts/submit_indexnow.py --submit
```

The first command is a dry run. Use `--submit` only after the matching sitemap and
key are live. HTTP 200/202 means notification acceptance, not guaranteed indexing.
IndexNow does not replace Google Search Console sitemap/indexing tools.

## Analytics activation

`ga4MeasurementId` is blank, so analytics is disabled. To activate reporting:

1. Create/select the primary site's GA4 web stream and put its real `G-...`
   Measurement ID in `site-config.json`.
2. Review the stream's enhanced-measurement settings. Disable automatic form,
   outbound-click and download tracking if using this integration's restricted
   event design; those automatic features can send additional URL/form metadata.
3. Meet any applicable disclosure/consent requirements for your chosen analytics
   configuration, then deploy the updated configuration.
4. Register `ai_referral_source` as an event-scoped custom dimension if needed.
   Check DebugView/Realtime using a test visit before relying on reports.

The integration loads a tracker only on the primary origin with a valid real ID.
It respects Do Not Track and Global Privacy Control, removes query strings from
page/referrer parameters, and does not read contact form fields. It records page
views, contact-link clicks and resume downloads. A `#message-sent` hash alone is
not treated as a verified lead. Recognized AI referral labels persist for the
browser tab; missing referrers remain unattributed. Google AI Search traffic
cannot reliably be separated from other Google traffic by referrer alone.

## Measurement

Use Google Search Console (including Generative AI performance when data is
available), Bing AI Performance, referral visits and actual enquiries together.
Google's dedicated Generative AI report measures impressions; it may remain
absent until the site has enough impressions in those features.
Maintain a dated baseline of representative prompts such as:

- Muhammad Hamza AI engineer portfolio
- RAG developer for internal company documents
- LangGraph agent harness developer
- YOLO warehouse safety engineering
- TabNet Transformer adversarial UAV intrusion detection paper

Record the platform, exact prompt, date, cited URL and whether web search was
enabled. A single personalized answer is not a universal ranking measurement.

## Sources

- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Generative AI performance report](https://support.google.com/webmasters/answer/16984139)
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
- [IndexNow documentation](https://www.indexnow.org/documentation)
