const { writeFileSync } = require('fs');
const prettier = require('prettier');

async function generateSitemap(): Promise<void> {
  const { globby } = await import('globby');
  const prettierConfig = await prettier.resolveConfig('./.prettierrc');
  const pages: string[] = await globby([
    'pages/**/*.tsx',
    'pages/*.tsx',
    '!pages/_*.tsx',
    '!pages/api',
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://romainboboe.com';

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((page: string) => {
          const path = page
            .replace('pages', '')
            .replace('.tsx', '')
            .replace('/index', '');
          const route = path === '/index' ? '' : path;
          return `
            <url>
              <loc>${siteUrl}${route}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>${route === '' ? '1.0' : '0.7'}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  const formatted = await prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  writeFileSync('public/sitemap.xml', formatted);
}

generateSitemap();
