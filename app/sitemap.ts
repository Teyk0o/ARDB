import { MetadataRoute } from 'next';

const languages = ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.arcraidersdatabase.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: languages.reduce((acc, lang) => {
          acc[lang] = `${baseUrl}`;
          return acc;
        }, {} as Record<string, string>),
      },
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: languages.reduce((acc, lang) => {
          acc[lang] = `${baseUrl}/categories`;
          return acc;
        }, {} as Record<string, string>),
      },
    },
    {
      url: `${baseUrl}/translate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: languages.reduce((acc, lang) => {
          acc[lang] = `${baseUrl}/translate`;
          return acc;
        }, {} as Record<string, string>),
      },
    },
  ];
}
