import { assetsCss } from './styles';

/* Loads the Assets tile's own styles, and nothing else's. */
export default function AssetsLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: assetsCss }} />
      {children}
    </>
  );
}
