import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";

type Reward = {
  unitType: string;
  unitAmount: number;
};

type RewardedAdState = "unconfigured" | "unsupported" | "loading" | "loaded" | "showing" | "failed";

type ShowRewardedAdOptions = {
  onReward: (reward: Reward) => void;
  onUnavailable: () => void;
};

export function useRewardedAd(adGroupId: string) {
  const [state, setState] = useState<RewardedAdState>(adGroupId ? "loading" : "unconfigured");
  const unregisterLoadRef = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    unregisterLoadRef.current?.();
    unregisterLoadRef.current = null;

    if (!adGroupId) {
      setState("unconfigured");
      return;
    }

    try {
      if (!loadFullScreenAd.isSupported()) {
        setState("unsupported");
        return;
      }

      setState("loading");
      unregisterLoadRef.current = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") {
            setState("loaded");
          }
        },
        onError: (error) => {
          console.error("보상형 광고 로드 실패:", error);
          setState("failed");
        },
      });
    } catch (error) {
      console.info("현재 환경에서는 보상형 광고를 로드할 수 없습니다:", error);
      setState("unsupported");
    }
  }, [adGroupId]);

  useEffect(() => {
    load();

    return () => {
      unregisterLoadRef.current?.();
      unregisterLoadRef.current = null;
    };
  }, [load]);

  const showAd = useCallback(
    ({ onReward, onUnavailable }: ShowRewardedAdOptions) => {
      if (!adGroupId || state !== "loaded") {
        onUnavailable();
        return false;
      }

      try {
        setState("showing");
        showFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            switch (event.type) {
              case "userEarnedReward":
                onReward(event.data);
                break;
              case "dismissed":
              case "failedToShow":
                load();
                break;
            }
          },
          onError: (error) => {
            console.error("보상형 광고 표시 실패:", error);
            load();
          },
        });
        return true;
      } catch (error) {
        console.error("보상형 광고 표시 실패:", error);
        load();
        onUnavailable();
        return false;
      }
    },
    [adGroupId, load, state],
  );

  return {
    isLoaded: state === "loaded",
    isReady: Boolean(adGroupId) && state === "loaded",
    state,
    showAd,
  };
}
