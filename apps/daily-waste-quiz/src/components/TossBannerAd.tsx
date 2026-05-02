import { useEffect, useRef, useState } from "react";
import { useTossBanner } from "../hooks/useTossBanner";

type BannerState = "loading" | "rendered" | "fallback";

interface TossBannerAdProps {
  adGroupId: string;
  className?: string;
  label?: string;
}

export function TossBannerAd({
  adGroupId,
  className = "",
  label = "토스 광고",
}: TossBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { attachBanner, isInitialized, isSupported } = useTossBanner();
  const [state, setState] = useState<BannerState>("loading");

  useEffect(() => {
    if (!isSupported) {
      setState("fallback");
      return;
    }

    if (!isInitialized || !containerRef.current) {
      return;
    }

    const attached = attachBanner(adGroupId, containerRef.current, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
      callbacks: {
        onAdRendered: () => setState("rendered"),
        onAdImpression: (payload) => {
          console.info("토스 배너 광고 노출 기록:", payload.slotId);
        },
        onAdClicked: (payload) => {
          console.info("토스 배너 광고 클릭:", payload.slotId);
        },
        onNoFill: () => setState("fallback"),
        onAdFailedToRender: (payload) => {
          console.error("토스 배너 광고 렌더링 실패:", payload.error.message);
          setState("fallback");
        },
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [adGroupId, attachBanner, isInitialized, isSupported]);

  return (
    <aside className={`ad-banner-shell ${className}`} aria-label={label}>
      <div ref={containerRef} className="ad-banner-slot" />
      {state !== "rendered" ? (
        <div className="ad-banner-fallback">
          <span>{label}</span>
          <strong>{state === "loading" ? "광고 준비 중" : "광고 영역"}</strong>
        </div>
      ) : null}
    </aside>
  );
}
