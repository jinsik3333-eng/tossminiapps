import { contactsViral } from "@apps-in-toss/web-framework";

type ContactsRewardEvent =
  | {
      type: "sendViral";
      data: {
        rewardAmount: number;
        rewardUnit: string;
      };
    }
  | {
      type: "close";
      data: {
        closeReason?: string;
        sentRewardAmount?: number;
        sendableRewardsCount?: number;
        sentRewardsCount?: number;
        rewardUnit?: string;
      };
    };

type ContactsViralRewardOptions = {
  moduleId: string;
  onReward?: (data: { rewardAmount: number; rewardUnit: string }) => void;
  onClose?: (data: { sentRewardsCount?: number; rewardUnit?: string }) => void;
  onFallback?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function openContactsViralReward({
  moduleId,
  onReward,
  onClose,
  onFallback,
  onError,
}: ContactsViralRewardOptions) {
  const trimmedModuleId = moduleId.trim();

  if (trimmedModuleId.length === 0) {
    void onFallback?.();
    return false;
  }

  let cleanup: (() => void) | undefined;
  let fallbackCalled = false;

  const runFallbackOnce = (error?: unknown) => {
    if (fallbackCalled) {
      return;
    }

    fallbackCalled = true;
    cleanup?.();
    onError?.(error);
    void onFallback?.();
  };

  try {
    cleanup = contactsViral({
      options: { moduleId: trimmedModuleId },
      onEvent: (event: ContactsRewardEvent) => {
        if (event.type === "sendViral") {
          onReward?.(event.data);
          return;
        }

        if (event.type === "close") {
          cleanup?.();
          onClose?.(event.data);
        }
      },
      onError: runFallbackOnce,
    });

    return true;
  } catch (error) {
    runFallbackOnce(error);
    return false;
  }
}
