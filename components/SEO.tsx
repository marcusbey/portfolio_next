import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = "Romain BOBOE | Full Stack Developer",
  description = "Full Stack Developer specializing in building exceptional digital experiences. Currently focused on building accessible, human-centered products.",
  image = "/images/og/og-image.jpg",
  url = "https://romainboboe.com",
  type = "website",
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://romainboboe.com";
  const canonicalUrl = url.startsWith("/") ? `${siteUrl}${url}` : url;
  const ogImage = image.startsWith("/") ? `${siteUrl}${image}` : image;
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#ffffff" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/images/og/twitter-card.jpg`} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Romain BOBOE" />
      
      {/* Keywords */}
      <meta name="keywords" content="Romain BOBOE, Full Stack Developer, Web Development, JavaScript, TypeScript, React, Node.js, Next.js, Software Engineer" />
      
      {/* Additional Social Media */}
      <meta name="twitter:creator" content="@romainboboe" />
      <meta property="og:site_name" content="Romain BOBOE" />
    </Head>
  );
}
