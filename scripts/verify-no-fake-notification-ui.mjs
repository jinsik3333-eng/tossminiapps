import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const apps = [
  "apps/01-money-leak-test",
  "apps/02-daily-waste-quiz",
  "apps/03-salary-thief-finder",
  "apps/04-spending-defense-roulette",
  "apps/05-subscription-ghost-finder",
  "apps/06-receipt-monster-catcher",
];

const fileExtensions = new Set([".ts", ".tsx", ".css"]);
const forbiddenPatterns = [
  [/NotificationRewardSheet/g, "fake notification sheet component"],
  [/onOpenNotification/g, "fake notification action prop"],
  [/isRewardNotifyOpen|setIsRewardNotifyOpen/g, "fake notification state"],
  [/reward-hub__bell|reward-notify/g, "fake notification styles"],
  [/utility-nudge|utility-bell/g, "notification/login nudge styles"],
  [/UtilityNudge/g, "notification/login nudge component"],
  [/notifyCopy|loginCopy/g, "notification/login nudge copy props"],
  [/알림을 켜면/g, "copy promises notification behavior"],
  [/로그인하면/g, "copy promises login-backed retention"],
  [/내일도 이어보기|내일도 몬스터 등장/g, "retention nudge heading"],
  [/🔔 알림/g, "notification button label"],
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return walk(path);
    }

    const extension = path.slice(path.lastIndexOf("."));
    return fileExtensions.has(extension) ? [path] : [];
  });
}

const violations = [];

for (const app of apps) {
  for (const file of walk(join(app, "src"))) {
    const source = readFileSync(file, "utf8");

    for (const [pattern, reason] of forbiddenPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(source)) !== null) {
        const before = source.slice(0, match.index);
        const line = before.split("\n").length;
        violations.push(`${relative(process.cwd(), file)}:${line} ${reason}: ${match[0]}`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Fake notification UI still exists:");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("No fake notification UI found in launched app sources.");
