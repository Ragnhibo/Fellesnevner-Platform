import { useEffect, useRef } from "react";

// Renders a Google AdSense unit. Safe to leave in place before approval —
// it simply won't show anything until index.html has a real publisher ID
// and this slot's data-ad-slot is replaced with a real ad unit ID.
export default function AdSlot() {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense script not loaded yet (e.g. no publisher ID set) — ignore.
    }
  }, []);
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: 280, minHeight: 250 }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="YOUR_AD_SLOT_ID"
      data-ad-format="auto"
      data-full-width-responsive="false"
    />
  );
}
