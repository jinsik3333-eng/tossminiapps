export type RewardHubLink = {
  label: string;
  description: string;
  href: string;
  visual: string;
};

type RewardHubProps = {
  appLabel: string;
  pointsLabel: string;
  primaryLabel: string;
  questLabel: string;
  questProgress: number;
  questTotal: number;
  links: RewardHubLink[];
  onPrimaryReward: () => void;
  onOpenNotification: () => void;
};

type NotificationRewardSheetProps = {
  open: boolean;
  appLabel: string;
  onClose: () => void;
};

type StickyRewardCTAProps = {
  label: string;
  onClick: () => void;
};

export function RewardHub({
  appLabel,
  pointsLabel,
  primaryLabel,
  questLabel,
  questProgress,
  questTotal,
  links,
  onPrimaryReward,
  onOpenNotification,
}: RewardHubProps) {
  const safeTotal = Math.max(questTotal, 1);
  const percent = Math.min(100, Math.round((questProgress / safeTotal) * 100));

  const openLink = (href: string) => {
    window.location.href = href;
  };

  return (
    <section className="reward-hub" aria-label={`${appLabel} 리워드 허브`}>
      <div className="reward-hub__topline">
        <div>
          <p className="reward-hub__eyebrow">내 기록</p>
          <h2>{pointsLabel}</h2>
          <span>보상과 다른 서비스를 한 화면에서 바로 실행해요</span>
        </div>
        <button className="reward-hub__bell" type="button" onClick={onOpenNotification}>
          🔔 알림
        </button>
      </div>

      <button className="reward-hub__primary" type="button" onClick={onPrimaryReward}>
        {primaryLabel}
      </button>

      <div className="reward-hub__quest">
        <div>
          <strong>{questLabel}</strong>
          <span>
            {questProgress}/{questTotal}개 완료
          </span>
        </div>
        <div className="reward-hub__track" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="reward-hub__links" aria-label="다른 서비스 이용하기">
        {links.slice(0, 4).map((link) => (
          <button key={link.href} type="button" onClick={() => openLink(link.href)}>
            <span className="reward-hub__link-visual" aria-hidden="true">
              {link.visual.startsWith("/") ? <img src={link.visual} alt="" /> : link.visual}
            </span>
            <strong>{link.label}</strong>
            <span>{link.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function NotificationRewardSheet({
  open,
  appLabel,
  onClose,
}: NotificationRewardSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="reward-notify-backdrop" role="presentation" onClick={onClose}>
      <section
        className="reward-notify-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${appLabel} 알림 설정`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="reward-notify-sheet__handle" />
        <h2>알림 설정</h2>
        <div className="reward-notify-sheet__icon" aria-hidden="true">
          🔔
        </div>
        <div className="reward-notify-row">
          <div>
            <strong>보상 도착 알림</strong>
            <span>새로운 광고 보상이 열리면 알려드려요</span>
          </div>
          <span className="reward-toggle" aria-hidden="true" />
        </div>
        <div className="reward-notify-row">
          <div>
            <strong>오늘 퀘스트 알림</strong>
            <span>다시 받을 수 있는 혜택을 놓치지 않게 알려드려요</span>
          </div>
          <span className="reward-toggle" aria-hidden="true" />
        </div>
        <button className="reward-notify-close" type="button" onClick={onClose}>
          닫기
        </button>
      </section>
    </div>
  );
}

export function StickyRewardCTA({ label, onClick }: StickyRewardCTAProps) {
  return (
    <button className="sticky-reward-cta" type="button" onClick={onClick}>
      {label}
    </button>
  );
}
