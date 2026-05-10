import {
  TossAds,
  type TossAdsAttachBannerOptions,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    try {
      if (!TossAds.initialize.isSupported()) {
        console.info("현재 환경에서는 토스 배너 광고가 지원되지 않습니다.");
        setIsSupported(false);
        return;
      }

      setIsSupported(true);
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setIsInitialized(true),
          onInitializationFailed: (error) => {
            console.error("토스 배너 광고 초기화 실패:", error);
            setIsInitialized(false);
          },
        },
      });
    } catch (error) {
      console.info(
        "현재 환경에서는 토스 배너 광고를 초기화할 수 없습니다:",
        error,
      );
      setIsSupported(false);
      setIsInitialized(false);
    }
  }, []);

  const attachBanner = useCallback(
    (
      adGroupId: string,
      element: HTMLElement,
      options?: TossAdsAttachBannerOptions,
    ) => {
      if (!isInitialized) {
        return undefined;
      }

      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized],
  );

  return { attachBanner, isInitialized, isSupported };
}
