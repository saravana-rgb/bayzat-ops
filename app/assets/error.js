'use client';

/* Next.js renders this in place of the page whenever something inside
 * /assets throws during render. Without it, an uncaught error bubbles up
 * to Next's own internal recovery path — which is what was producing the
 * "reading 'shell'" message: not our bug, but Next's fallback failing
 * while trying to handle our bug. This shows the real one instead. */
export default function AssetsError({ error, reset }) {
  return (
    <div className="wrap">
      <div className="err" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                                      fontSize: 12, lineHeight: 1.6 }}>
        {error?.message || 'Unknown error'}
        {error?.stack ? '\n\n' + error.stack : ''}
      </div>
      <button className="btn" style={{ marginTop: 16 }} onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
