import { useEffect, useRef, useState } from "react";

import { useTossBanner } from "../hooks/useTossBanner";

type BannerState = "loading" | "rendered" | "hidden";

type TossBannerAdProps = {
  adGroupId: string;
  className?: string;
  label?: string;
};

export function TossBannerAd({
  adGroupId,
  className = "",
  label = "토스 광고",
}: TossBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { attachBanner, isInitialized, isSupported } = useTossBanner();
  const [state, setState] = useState<BannerState>(adGroupId ? "loading" : "hidden");

  useEffect(() => {
    if (!adGroupId || isSupported === false) {
      setState("hidden");
      return;
    }

    if (isSupported !== true || !isInitialized || !containerRef.current) return;

    const attached = attachBanner(adGroupId, containerRef.current, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
      callbacks: {
        onAdRendered: () => setState("rendered"),
        onAdImpression: (payload) => {
          console.info("토스 배너 광고 노출:", payload.slotId);
        },
        onAdClicked: (payload) => {
          console.info("토스 배너 광고 클릭:", payload.slotId);
        },
        onNoFill: () => setState("hidden"),
        onAdFailedToRender: (payload) => {
          console.error("토스 배너 광고 렌더링 실패:", payload.error.message);
          setState("hidden");
        },
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [adGroupId, attachBanner, isInitialized, isSupported]);

  if (!adGroupId || state === "hidden") return null;

  return (
    <aside className={`ad-banner-shell ${className}`} aria-label={label}>
      <div ref={containerRef} className="ad-banner-slot" />
    </aside>
  );
}
