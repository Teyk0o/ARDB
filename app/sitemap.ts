import { MetadataRoute } from 'next';

const languages = ['en', 'fr', 'es', 'de', 'zh-CN'];

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
  ];
}
