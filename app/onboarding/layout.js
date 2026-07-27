import { onboardingCss } from './styles';

/* Loads the Onboarding tile's own styles, and nothing else's. */
export default function OnboardingLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: onboardingCss }} />
      {children}
    </>
  );
}
