import { documentsCss } from './styles';

/* Loads the Documents tile's own styles, and nothing else's. */
export default function DocumentsLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: documentsCss }} />
      {children}
    </>
  );
}
