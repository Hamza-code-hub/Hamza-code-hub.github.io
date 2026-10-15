# GitHub Pages sitemap investigation

Investigation date: 2026-10-15 (Asia/Karachi).

## Finding

The initial public GitHub Pages sitemap response served correctly. The browser extension script described in the earlier guidance was absent from the raw response. No available evidence establishes why Google Search Console (GSC) has not processed this sitemap, or proves that the fetch issue is fixed.

The user reports that the GitHub submission has **Type: Unknown** and no **Last read** date, while a Vercel submission shows **Type: Sitemap / Success**. The confirmed Vercel endpoint is `https://hamza-ai-engineer.vercel.app/sitemap.xml` (singular). At the initial check, its body was byte-identical to GitHub's sitemap and listed the same 21 GitHub page URLs. This rules out different XML bodies or XML media types at that time as the explanation for the different outcomes; it does not establish what Google received during an earlier attempt.

## Pre-deployment public-response baseline

| Check | Result |
| --- | --- |
| `https://hamza-code-hub.github.io/sitemap.xml` | HTTP 200, `Content-Type: application/xml`, no redirect; well-formed XML |
| Raw sitemap body | No `chrome-extension://` or `frame_ant.js` injection |
| Browser and Googlebot-spoofed user agents | Identical SHA-256 body hashes |
| `https://hamza-code-hub.github.io/robots.txt` | HTTP 200; allows `/`; references the correct GitHub sitemap |
| All 21 sitemap page URLs | HTTP 200; local canonical declarations match their GitHub URLs |
| `/sitemap.xml/` | HTTP 404; the trailing slash is incorrect |
| HTTP sitemap URL | Redirects to HTTPS; submit the HTTPS URL directly |
| `https://hamza-ai-engineer.vercel.app/sitemap.xml` | HTTP 200, `Content-Type: application/xml`; initial 13,974-byte body identical to GitHub's baseline body |
| `https://hamza-ai-engineer.vercel.app/sitemaps.xml` | HTTP 404; the plural filename is incorrect |
| Vercel homepage | Canonical URL points to the GitHub homepage |

The identical initial sitemap bodies had SHA-256 `519ee66898f6b0a65f9e039bdc2da47fb3405d9537a923d84a05135f65f21483`. This records the baseline, not the expected hash after the source cleanup is deployed.

Spoofing a user agent does not reproduce Google's network, IP reputation, crawler scheduling, or account-specific GSC state. These checks establish public availability from the test environment, not the outcome of an actual Googlebot request.

## Repository cleanup

The sitemap source cleanup percent-encodes image URL paths, resolves 10 entries containing raw spaces, and removes four duplicate image entries. The resulting sitemap has 21 page URLs and 81 image entries. All 102 referenced page/image paths exist with matching filename case.

This improves URL correctness. It does not establish that those image entries caused Google's reported fetch failure. The public-response baseline above and source cleanup are separate findings.

The `robots.txt` source change adds `Sitemap: https://hamza-ai-engineer.vercel.app/sitemap.xml` while retaining the GitHub sitemap directive. This implements Google's supported discovery of an externally hosted sitemap for the GitHub URLs. At the initial pre-deployment check, both hosts referenced only the GitHub sitemap. The new directive and cleaned XML should be verified after deployment. This workaround does not guarantee that the original GitHub GSC row will change to Success.

## What the earlier advice does not establish

- Chrome extensions can alter a browser's displayed DOM. An injected script visible there does not prove it exists in the server response. See [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
- A shared Google throttle across every `github.io` account is unproven. Google documents crawl-rate reduction at the hostname level; GitHub documents its own rate limiting as HTTP 429. No such response was observed here. See [Google crawl rate](https://developers.google.com/crawling/docs/crawlers-fetchers/reduce-crawl-rate) and [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
- Changing deployment workflows is not justified as a MIME fix: the initial public sitemap already had an XML content type. GitHub's documented Actions workflow packages and deploys static files; it does not document a response-header setting. See [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- Renaming a sitemap has no documented guarantee of an immediate retry or cache bypass. Google states that submission does not guarantee download or use. See [Google sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#submit-your-sitemap-to-google).

## Required GSC verification

1. Select the exact URL-prefix property **`https://hamza-code-hub.github.io/`**.
2. Open the failed sitemap row and expand its error details. Record the exact submitted URL, error, submission date, and Last read value.
3. Inspect **`https://hamza-code-hub.github.io/sitemap.xml`** using **URL Inspection → Test live URL**. In Page availability, confirm **Crawl allowed? Yes** and **Page fetch: Successful**. Do not request indexing for the XML file.
4. After deployment, verify the public cleaned XML and both sitemap directives in GitHub's `robots.txt`, then submit **`sitemap.xml`** under that GitHub property, with no trailing slash. Compare Google's live fetch results for the GitHub and Vercel sitemap URLs to isolate any remaining host-specific failure.
5. Separately inspect **`https://hamza-code-hub.github.io/`** and request indexing for the HTML homepage if needed.

Google lists robots restrictions, manual actions, wrong URLs, server availability, and low crawl demand among possible fetch causes. It retries failures for several days and may then stop. The expanded error and live test are needed to narrow the diagnosis; a clean browser fetch cannot choose between those causes. See [Google's sitemap report and fetch troubleshooting](https://support.google.com/webmasters/answer/7451001?hl=en).

If API access is available, `isPending`, `lastDownloaded`, and `errors` provide additional evidence. `isPending: true` means unprocessed; it does not by itself prove Google never requested the URL. See [Search Console Sitemaps API](https://developers.google.com/webmaster-tools/v1/sitemaps).

## Interpreting the Vercel result

The working Vercel sitemap lists GitHub URLs, so it can help discovery of the GitHub pages. Its success is evidence that the same XML can be processed from another host; it does not prove shared `github.io` throttling or identify the original fetch cause. A sitemap listing only Vercel page URLs would cover Vercel instead.

Google supports cross-site submission by verifying ownership of all relevant sites in Search Console, or by referencing the externally hosted GitHub sitemap from the GitHub site's `robots.txt`. This change uses the latter route. Merely adding a Vercel property is insufficient. See [Google cross-site sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#how-to-cross-submit-sitemaps-for-multiple-sites).

Keep sitemap URLs and canonical tags consistent with the preferred host. Google recommends avoiding conflicting canonical signals. See [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
