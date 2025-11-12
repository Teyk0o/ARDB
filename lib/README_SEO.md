# SEO Optimization for Arc Raiders Database

## Overview
The Arc Raiders Database now has comprehensive SEO optimization for all 18 supported languages.

## Multilingual SEO Features

### 1. **Metadata per Language** (`lib/seoConfig.ts`)
- Unique titles, descriptions, and keywords for each language
- Open Graph tags optimized for social media sharing in each language
- Twitter cards with language-specific content
- 18 fully translated metadata configurations

**Supported Languages:**
- English (en)
- French (fr)
- German (de)
- Spanish (es)
- Portuguese (pt)
- Polish (pl)
- Norwegian (no)
- Danish (da)
- Italian (it)
- Russian (ru)
- Japanese (ja)
- Traditional Chinese (zh-TW)
- Ukrainian (uk)
- Simplified Chinese (zh-CN)
- Korean (kr)
- Turkish (tr)
- Croatian (hr)
- Serbian (sr)

### 2. **Hreflang Tags** (app/layout.tsx)
- Proper language alternates declared in metadata
- Helps search engines understand which version of content to show users
- Covers all 18 languages

### 3. **Structured Data (JSON-LD)**
- Enhanced schema with all 18 languages listed in `inLanguage`
- WebSite schema with search action capability
- VideoGame schema identifying Arc Raiders as the subject

### 4. **Sitemap with Language Alternates** (app/sitemap.xml)
- Declares language alternatives for each page
- Main pages included:
  - Home page (/)
  - Categories page (/categories)
  - Translation guide (/translate)
- Daily updates for home page, weekly for categories, monthly for translation page

### 5. **Robots Configuration** (public/robots.txt)
- Optimized crawl directives for different search engines
- Google-specific rules (Googlebot)
- Bing-specific rules (Bingbot)
- Sitemap location
- Disallows private directories

### 6. **Security Configuration** (public/.well-known/security.txt)
- Security contact information
- Issue reporting guidelines
- Policy information

## Best Practices Implemented

✅ **Language Targeting**
- Proper hreflang tags for all language variants
- Unique, relevant descriptions for each language
- Native-language keywords and phrases

✅ **Content Structure**
- Clear canonical URLs
- Proper language declarations in HTML
- Alternative language links

✅ **Technical SEO**
- XML sitemap with language variants
- Robots.txt with crawl optimization
- JSON-LD schema markup
- Open Graph meta tags
- Twitter cards

✅ **Performance**
- Minimal duplicate content
- Fast load times
- Mobile-friendly design
- Responsive images

## How to Use

### Adding a New Language

1. Add language code to `seoConfig` in `lib/seoConfig.ts`:
```typescript
newLanguage: {
  title: "Localized Title",
  description: "Localized description",
  keywords: [/* array of keywords */],
  ogTitle: "OG Title",
  ogDescription: "OG Description",
  twitterTitle: "Twitter Title",
  twitterDescription: "Twitter Description",
}
```

2. Add to language array in `app/sitemap.ts`
3. Add to alternates.languages in `app/layout.tsx`

### Checking SEO Configuration

The SEO configuration is automatically used in:
- `app/layout.tsx` - Main metadata generation
- `app/sitemap.ts` - XML sitemap generation
- All pages inherit the base metadata

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Hreflang Documentation](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [JSON-LD Schema](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

## Notes

- Language detection is handled client-side via localStorage
- Server-side uses English as default for metadata generation
- All 18 languages have equal SEO weight
- Regular updates to keywords ensure relevance
