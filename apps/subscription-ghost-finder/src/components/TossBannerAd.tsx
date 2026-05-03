import { useRef } from "react";
import { useTossBanner } from "../hooks/useTossBanner";

interface TossBannerAdProps {
  adGroupId: string;
  className?: string;
  label?: string;
}

export function TossBannerAd({
  adGroupId,
  className = "",
  label = "AD",
}: TossBannerAdProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isRendered, isSupported } = useTossBanner({
    adGroupId,
    container: ref.current,
  });

  return (
    <section className={`ad-banner-shell ${className}`} aria-label="광고 영역">
      <div className="ad-banner-label">{label}</div>
      <div ref={ref} className="ad-banner-slot">
        {!isRendered && (
          <div className="ad-banner-fallback">
            {isSupported
              ? "광고를 불러오는 중이에요"
              : "토스앱에서 배너 광고가 노출돼요"}
          </div>
        )}
      </div>
    </section>
  );
}
