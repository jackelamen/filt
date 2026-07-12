import { useEffect, useState } from "react";

// Launch splash: the mother-and-baby illustration full-screen with the
// wordmark, which then zooms out and fades, revealing the app with the
// smaller mark resting on the home card.
export function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hold = reduce ? 400 : 1000;
    const total = reduce ? 700 : 2000;
    const t1 = window.setTimeout(() => setLeaving(true), hold);
    const t2 = window.setTimeout(onDone, total);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`splash${leaving ? " leaving" : ""}`} aria-hidden="true">
      <div className="splashInner">
        <img src={`${import.meta.env.BASE_URL}mother2.svg`} alt="" />
        <h1 className="splashWordmark">Baby Dawn</h1>
      </div>
    </div>
  );
}
