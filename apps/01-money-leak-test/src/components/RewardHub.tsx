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

export function StickyRewardCTA({ label, onClick }: StickyRewardCTAProps) {
  return (
    <button className="sticky-reward-cta" type="button" onClick={onClick}>
      {label}
    </button>
  );
}
