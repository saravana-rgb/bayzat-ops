'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../common/shared';

/* Nobody reaching this page is logged into anything -- it exists
 * specifically for someone who is not a Bayzat Ops user at all. No
 * AuthGate, no Bar, no navigation back into the tool. Styled inline on
 * purpose, so this page has no dependency on any tile's own styleshee
 * and cannot be affected by changes made there. */

export default function AcknowledgePage() {
  const params = useParams();
  const token = params?.token;

  const [info, setInfo] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase.rpc('ack_lookup', { p_token: token }).then(({ data, error }) => {
      if (error) { setErr('Something went wrong loading this.'); return; }
      if (!data || data.length === 0) { setErr('This link is not valid.'); return; }
      setInfo(data[0]);
    });
  }, [token]);

  async function confirm() {
    setBusy(true);
    const { data, error } = await supabase.rpc('ack_confirm', { p_token: token });
    setBusy(false);
    if (error) { setErr('Something went wrong confirming this.'); return; }
    if (data && data.ok === false) { setErr('This link is not valid.'); return; }
    setDone(true);
  }

  const alreadyDone = done || (info && info.acknowledged);

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.mark}>B</div>

        {err ? (
          <>
            <h1 style={S.h1}>Link not valid</h1>
            <p style={S.p}>{err}</p>
          </>
        ) : !info ? (
          <p style={S.p}>Loading...</p>
        ) : alreadyDone ? (
          <>
            <h1 style={S.h1}>Thanks - confirmed</h1>
            <p style={S.p}>
              You have confirmed receipt of your {String(info.category_label || 'device').toLowerCase()}.
              Nothing further is needed.
            </p>
          </>
        ) : (
          <>
            <h1 style={S.h1}>Confirm you received this</h1>
            <div style={S.box}>
              <div style={S.row}><span style={S.lbl}>Device</span><span>{info.category_label}</span></div>
              {info.tag && (
                <div style={S.row}><span style={S.lbl}>Tag</span><span>{info.tag}</span></div>
              )}
              {info.serial && (
                <div style={S.row}><span style={S.lbl}>Serial</span><span>{info.serial}</span></div>
              )}
            </div>
            <button style={{ ...S.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={confirm}>
              {busy ? 'Confirming...' : 'I acknowledge receiving this'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  wrap: {
    minHeight: '100vh', background: '#FBF9F5', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 24,
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
  },
  card: {
    background: '#FFFFFF', border: '1px solid #E6DFD3', borderRadius: 10,
    padding: '36px 32px', maxWidth: 420, width: '100%'
  },
  mark: {
    width: 34, height: 34, borderRadius: 6, background: '#B14A2E', color: '#fff',
    display: 'grid', placeItems: 'center', fontWeight: 600, marginBottom: 20
  },
  h1: { fontSize: 20, fontWeight: 600, color: '#1F1B16', margin: 0 },
  p: { fontSize: 14, color: '#5A5348', marginTop: 10, lineHeight: 1.6 },
  box: {
    background: '#F7F3EC', border: '1px solid #E6DFD3', borderRadius: 8,
    padding: '14px 16px', margin: '18px 0'
  },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '4px 0' },
  lbl: { color: '#8F8779' },
  btn: {
    width: '100%', padding: '12px 18px', background: '#B14A2E', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer'
  }
};
