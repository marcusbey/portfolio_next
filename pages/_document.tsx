import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Character Set */}
        <meta charSet="utf-8" />
        
        {/* PWA Settings */}
        <meta name="application-name" content="Romain BOBOE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Romain BOBOE" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to External Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin" />
        {/* CSP is now configured via next.config.mjs server-side headers */}
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          strategy="afterInteractive"
          data-website-id="671fb5ee22bbce1bee81d68c"
          data-domain="romainboboe.com"
          src="https://datafa.st/js/script.js"
        />
        <Script 
          strategy="afterInteractive"
          type="module" 
          // src="https://widget.nownownow.io/now-widget.js"
          src="http://localhost:5173/dist/now-widget.js"
          now-data-org-id="67tiEuEkC3G"
          now-data-token="Njd0aUV1RWtDM0cuMTc0NjU4MDkyNjYyOS5yb21haW5ib2JvZS5jb20uZGVmYXVsdC13aWRnZXQtc2VjcmV0"
          now-data-theme="dark" 
          now-data-position="left" 
          now-data-button-color="#06b5d4" 
          now-data-button-size="90" 
        />
      </body>
    </Html>
  );
}
