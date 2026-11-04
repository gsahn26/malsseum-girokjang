"use client";

export type Tab = "plan" | "stats" | "church" | "share";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "plan", label: "플랜", icon: "📖" },
  { key: "stats", label: "내 통계", icon: "📊" },
  { key: "church", label: "교회 현황", icon: "⛪" },
  { key: "share", label: "공유", icon: "🔗" },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="sticky bottom-0 left-0 right-0 flex border-t border-border bg-card/95 backdrop-blur">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition ${
            active === tab.key ? "text-accent" : "text-muted"
          }`}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span className={active === tab.key ? "font-medium" : ""}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
