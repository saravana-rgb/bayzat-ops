import { offboardingCss } from './styles';

/* Loads the Offboarding tile's own styles, and nothing else's. */
export default function OffboardingLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: offboardingCss }} />
      {children}
    </>
  );
}
