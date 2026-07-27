import { commonCss } from './common/styles';

/* The root layout. It owns nothing but the shell — the page frame, the type,
   the colours and the components every tile shares.

   Each tile brings its own styles through its own layout.js, so nothing here
   needs to change when a tile is added or restyled. */

export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People teams'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: commonCss }} /></head>
      <body>{children}</body>
    </html>
  );
}
