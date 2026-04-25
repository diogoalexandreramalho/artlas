import { useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';

/** Subtle inline back arrow used at the top of detail pages.
 *
 * Pops the React Router history stack. If the user landed directly on the page
 * (no history), navigates to `/` so the arrow never feels broken. */
export function BackLink() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/');
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm text-ink-2 transition hover:text-ink"
    >
      <Icon.arrowLeft />
      Back
    </button>
  );
}
