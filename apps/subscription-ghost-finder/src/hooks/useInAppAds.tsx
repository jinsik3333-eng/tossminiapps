import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useToast } from "@toss/tds-mobile";
import { useCallback, useEffect, useRef, useState } from "react";

interface Reward {
  unitType: string;
  unitAmount: number;
}

interface UseInAppAdsReturn {
  isAdLoaded: boolean;
  isSupported: boolean;
  showAd: () => void;
  lastReward: Reward | null;
  rewardCount: number;
}

export function useInAppAds(adGroupId: string): UseInAppAdsReturn {
  const toast = useToast();

  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [lastReward, setLastReward] = useState<Reward | null>(null);
  const [rewardCount, setRewardCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    setIsAdLoaded(false);

    try {
      unregisterRef.current = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") {
            setIsAdLoaded(true);
          }
        },
        onError: (error) => {
          console.error("광고 로드 실패:", error);
        },
      });
    } catch (error) {
      console.info(
        "보상형 광고는 토스앱/샌드박스에서 확인할 수 있어요.",
        error,
      );
      setIsAdLoaded(false);
    }
  }, [adGroupId]);

  useEffect(() => {
    try {
      const supported = loadFullScreenAd.isSupported();
      setIsSupported(supported);

      if (supported) {
        load();
      }
    } catch (error) {
      console.info("광고 지원 여부 확인 실패", error);
      setIsSupported(false);
    }

    return () => {
      try {
        unregisterRef.current?.();
      } catch (error) {
        console.error("광고 정리 중 오류", error);
      }
    };
  }, [load]);

  const showAd = useCallback(() => {
    if (!isSupported || !isAdLoaded) {
      console.info("현재 환경에서는 보상형 광고가 아직 준비되지 않았습니다.");
      return;
    }

    try {
      showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          switch (event.type) {
            case "userEarnedReward":
              toast.openToast("구독 정리 루틴이 열렸어요");
              setLastReward(event.data);
              setRewardCount((count) => count + 1);
              break;
            case "dismissed":
            case "failedToShow":
              setIsAdLoaded(false);
              load();
              break;
          }
        },
        onError: (error) => {
          console.error("광고 표시 실패:", error);
          setIsAdLoaded(false);
          load();
        },
      });
    } catch (error) {
      console.error("광고 표시 실패:", error);
      setIsAdLoaded(false);
      load();
    }
  }, [adGroupId, isAdLoaded, isSupported, load, toast]);

  return { isAdLoaded, isSupported, showAd, lastReward, rewardCount };
}
