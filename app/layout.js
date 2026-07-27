import { commonCss } from './common/styles';

/* The root layout owns the shell only — the page frame, the type, the colours
   and the components every tile shares. Each tile brings its own styles in
   through its own layout.js.

   The font is loaded with a real <link>. An @import inside an injected <style>
   is unreliable and silently falls back to a system serif, which is what was
   happening before. */

export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People teams'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" />
        <style dangerouslySetInnerHTML={{ __html: commonCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
