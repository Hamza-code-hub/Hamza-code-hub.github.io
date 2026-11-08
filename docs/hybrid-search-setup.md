# Search visibility across GitHub Pages and Vercel

Configured on 8 November 2026. These source changes take effect only after the
same revision is deployed to both existing hosts.

## Preferred URLs

Each page has one preferred URL, shared by both deployed copies:

| Host | Preferred pages | Sitemap to submit |
| --- | --- | --- |
| `https://hamza-code-hub.github.io` | Homepage `/`, résumé `/resume/`, gallery `/gallery.html` | `https://hamza-code-hub.github.io/sitemap.xml` |
| `https://hamza-ai-engineer.vercel.app` | `/portfolio.html`, `/services.html`, `/contact.html`, all 15 `/projects/*.html` case studies | `https://hamza-ai-engineer.vercel.app/sitemap-vercel.xml` |

This keeps the established GitHub homepage identity and assigns the services and
project collection to Vercel. For example, **both** copies of
`projects/visionguard-ai.html` declare
`https://hamza-ai-engineer.vercel.app/projects/visionguard-ai.html` as canonical.
Both copies of the homepage continue to declare the GitHub homepage as canonical.
The Vercel homepage is therefore a mirror, while the selected Vercel pages are
intended to appear in search independently of the GitHub homepage.

Canonical tags, `og:url`, page and project IDs in JSON-LD, static page links, and
shared sidebar destinations follow this allocation. The shared person ID stays
`https://hamza-code-hub.github.io/#person` so both collections identify the same
author. Existing image URLs can stay on GitHub; an image host does not determine
the preferred address of its containing page.

## Sitemap behavior

`sitemap.xml` contains the three GitHub URLs. `sitemap-vercel.xml` contains the 18
Vercel URLs. Both static deployments include both files. The common `robots.txt`
advertises the absolute URL of each sitemap on its corresponding canonical host.
No host-specific build or redirects are required.

**On Vercel, submit `sitemap-vercel.xml`, not `sitemap.xml`.** The shared file
named `sitemap.xml` still describes GitHub's three preferred pages even when
downloaded from Vercel. An old successful Vercel submission of `sitemap.xml` does
not submit the 18 Vercel URLs.

## After deployment

1. Verify ownership of both exact URL-prefix properties in Google Search Console:
   `https://hamza-code-hub.github.io/` and
   `https://hamza-ai-engineer.vercel.app/`.
2. Submit `sitemap.xml` under GitHub's property and `sitemap-vercel.xml` under
   Vercel's property. Remove the old GitHub-only `sitemap.xml` submission from the
   Vercel property to keep its reports clear.
3. Inspect the GitHub homepage and important Vercel pages such as
   `/portfolio.html` and `/services.html`. Use **Test live URL** to confirm fetch
   access, then request indexing for those HTML pages.
4. After Google reprocesses the pages, check **Google-selected canonical** in the
   indexed URL Inspection report. The live test verifies availability; it cannot
   establish Google's final canonical choice. Follow impressions and positions
   separately in each property's Performance report.

Existing GitHub project URLs may transition to Vercel in search as Google
reprocesses the preferred URLs. Canonical tags are signals, and neither indexing
nor rankings on both hosts are guaranteed. Google has no setting here that
certifies both domains as an “official site.” Consistent author identity and
cross-links make the relationship clear.

## Navigation and future changes

Ordinary navigation links to the preferred URLs. Narrated tours retain their
same-origin routes because their continuation state uses browser session storage.
Those mirror pages remain crawlable with the same canonical declarations.
Language and theme preferences are stored separately on each host.

For a new page, choose its preferred host once. Use that URL in both copies'
canonical tags, `og:url`, page/project structured data, incoming navigation links,
and the matching host's sitemap. Keep the other sitemap free of that duplicate.
Keep `/index.html` represented as `/` and résumé aliases represented as `/resume/`.

References:

- [Google: canonical URL signals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: building and submitting sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonical troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting)
