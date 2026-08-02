import { masterCss } from './styles';

/* Loads the Master tile's own styles, and nothing else's. */
export default function MasterLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: masterCss }} />
      {children}
    </>
  );
}
