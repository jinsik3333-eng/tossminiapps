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

    let detached: (() => void) | undefined;
    let cancelled = false;

    async function attach() {
      try {
        if (!TossAds?.initialize || !TossAds?.attachBanner) {
          setIsSupported(false);
          return;
        }

        setIsSupported(true);
        await TossAds.initialize();

        if (cancelled) {
          return;
        }

        detached = TossAds.attachBanner({
          adGroupId,
          root: container,
        });
        setIsRendered(true);
      } catch (error) {
        console.info(
          "배너 광고는 토스앱/샌드박스에서 확인할 수 있어요.",
          error,
        );
        setIsSupported(false);
        setIsRendered(false);
      }
    }

    attach();

    return () => {
      cancelled = true;
      try {
        detached?.();
      } catch (error) {
        console.error("배너 광고 정리 중 오류", error);
      }
    };
  }, [adGroupId, container]);

  return { isRendered, isSupported };
}
