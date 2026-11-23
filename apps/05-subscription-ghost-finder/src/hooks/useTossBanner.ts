import { TossAds } from "@apps-in-toss/web-framework";
import { useEffect, useState } from "react";

interface UseTossBannerOptions {
  adGroupId: string;
  container: HTMLDivElement | null;
}

export function useTossBanner({ adGroupId, container }: UseTossBannerOptions) {
  const [isRendered, setIsRendered] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (container == null) {
      return;
    }

    const target = container;
    let destroy: (() => void) | undefined;
    let cancelled = false;

    function onFailure(error: unknown) {
      if (cancelled) {
        return;
      }
      console.info("배너 광고는 토스앱/샌드박스에서 확인할 수 있어요.", error);
      setIsSupported(false);
      setIsRendered(false);
    }

    function attach() {
      try {
        if (!TossAds.initialize.isSupported()) {
          setIsSupported(false);
          return;
        }

        setIsSupported(true);
        TossAds.initialize({
          callbacks: {
            onInitialized: () => {
              if (cancelled) {
                return;
              }
              try {
                const banner = TossAds.attachBanner(adGroupId, target);
                destroy = () => banner.destroy();
                setIsRendered(true);
              } catch (error) {
                onFailure(error);
              }
            },
            onInitializationFailed: onFailure,
          },
        });
      } catch (error) {
        onFailure(error);
      }
    }

    attach();

    return () => {
      cancelled = true;
      try {
        destroy?.();
      } catch (error) {
        console.error("배너 광고 정리 중 오류", error);
      }
    };
  }, [adGroupId, container]);

  return { isRendered, isSupported };
}
