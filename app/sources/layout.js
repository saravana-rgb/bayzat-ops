import { sourcesCss } from './styles';

/* Loads the Sources tile's own styles, and nothing else's. */
export default function SourcesLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sourcesCss }} />
      {children}
    </>
  );
}
