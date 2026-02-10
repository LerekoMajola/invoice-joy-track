

# Fix Link Preview (OG Image) When Sharing

## Problem

When sharing the link to `orionlabslesotho.com`, social platforms show the old logo because:

1. The `og:image` meta tag uses a relative path (`/og-image.png`) -- social media crawlers require a full absolute URL to fetch the image correctly.
2. The `og-image.png` file itself in the `public/` folder may still contain the old branding.

## Fix

### 1. Update `index.html` -- Use absolute URL for OG image

Change the `og:image` and `twitter:image` meta tags from relative to absolute paths using the custom domain:

| Tag | Current | Updated |
|-----|---------|---------|
| `og:image` | `/og-image.png` | `https://orionlabslesotho.com/og-image.png` |
| `twitter:image` | `/og-image.png` | `https://orionlabslesotho.com/og-image.png` |

Also add the missing `og:url` tag:
```
og:url = https://orionlabslesotho.com
```

### 2. Replace `public/og-image.png`

The current `og-image.png` file needs to be replaced with an updated image featuring the current Orion Labs branding. You will need to provide the new OG image (recommended size: 1200 x 630 px).

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Update `og:image` and `twitter:image` to absolute URLs, add `og:url` |
| `public/og-image.png` | Replace with updated branding image (user to provide) |

## Note

After publishing, social platforms cache old previews. You may need to clear the cache:
- **Facebook**: Use the [Sharing Debugger](https://developers.facebook.com/tools/debug/) to scrape new info
- **Twitter/X**: Use the [Card Validator](https://cards-dev.twitter.com/validator)
- **WhatsApp**: Clear chat cache or wait for it to refresh (can take hours)
- **LinkedIn**: Use the [Post Inspector](https://www.linkedin.com/post-inspector/)
