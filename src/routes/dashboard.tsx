import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { attention, dashboard } from "@/data/mock";
import type { Currency, DashboardStats } from "@/types";
import { useApp, toLangDigits, type TKey } from "@/lib/app-state";
import { PreviewFooter } from "@/components/PreviewFooter";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Business Command" },
      { name: "description", content: "Money in, profit paid, payouts due and sales for each of your four businesses." },
      { property: "og:title", content: "Dashboard · Business Command" },
      { property: "og:description", content: "Monthly money, profit and sales across your businesses." },
    ],
  }),
  component: Dashboard,
});

const ALL = "all";
const METRICS: [keyof Omit<DashboardStats, "currency" | "profitByMonth">, TKey][] = [
  ["moneyIn", "moneyIn"],
  ["profitPaid", "profitPaid"],
  ["payoutsDue", "payoutsDue"],
  ["sales", "salesMonth"],
];

function useFormat() {
  const { money, lang } = useApp();
  return (n: number, c: Currency) =>
    c === "BDT" ? money(n) : `$ ${toLangDigits(n.toLocaleString("en-US"), lang)}`;
}

function Dashboard() {
  const { t, tx, businesses, businessId, setBusinessId } = useApp();
  const [all, setAll] = useState(false);
  const fmt = useFormat();
  const selected = all ? ALL : businessId;
  const stats = dashboard[businessId]!;
  const items = attention.filter((a) => all || a.businessId === businessId);
  const nameOf = (id: string) => tx(businesses.find((b) => b.id === id)!.name);

  return (
    <div className="px-5 pt-6">
      <Link to="/" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium shadow-soft">
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{t("dashboard")}</h1>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pt-1 pb-1">
        {[{ id: ALL, label: t("allBusinesses") }, ...businesses.map((b) => ({ id: b.id, label: tx(b.name) }))].map((p) => (
          <button
            key={p.id}
            aria-pressed={selected === p.id}
            onClick={() => (p.id === ALL ? setAll(true) : (setAll(false), setBusinessId(p.id)))}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
              selected === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {all ? (
        <section className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">{t("perBusiness")}</p>
          {METRICS.map(([key, label]) => (
            <div key={key} className="rounded-2xl border bg-card p-4 shadow-soft">
              <p className="text-sm font-semibold">{t(label)}</p>
              <ul className="mt-2 divide-y">
                {businesses.map((b) => {
                  const s = dashboard[b.id]!;
                  return (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-muted-foreground">{tx(b.name)}</span>
                      <span className="shrink-0 font-bold tabular-nums">{fmt(s[key], s.currency)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <>
          <section className="mt-5 grid grid-cols-2 gap-3">
            {METRICS.map(([key, label]) => (
              <div key={key} className="min-w-0 rounded-2xl border bg-card p-4 shadow-soft">
                <p className="text-xs leading-snug text-muted-foreground">{t(label)}</p>
                <p className="mt-2 text-lg font-extrabold tracking-tight break-words tabular-nums">{fmt(stats[key], stats.currency)}</p>
              </div>
            ))}
          </section>
          <ProfitChart data={stats.profitByMonth} currency={stats.currency} />
        </>
      )}

      <section className="mt-6">
        <h2 className="text-[15px] font-semibold">{t("needsAttention")}</h2>
        <div className="mt-2 space-y-2">
          {items.length === 0 && <p className="rounded-2xl bg-muted p-4 text-sm">{t("nothingAttention")}</p>}
          {items.map((a) => (
            <Link key={a.id} to={a.to} onClick={() => setBusinessId(a.businessId)}
              className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft">
              <span className={cn("size-2.5 shrink-0 rounded-full", a.tone === "bad" ? "bg-bad" : "bg-warn")} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{tx(a.text)}</span>
                {all && <span className="block text-xs text-muted-foreground">{nameOf(a.businessId)}</span>}
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <PreviewFooter />
    </div>
  );
}

function ProfitChart({ data, currency }: { data: number[]; currency: Currency }) {
  const { t } = useApp();
  const fmt = useFormat();
  const months = t("months").split(",");
  // Last bar = current month (November in the demo).
  const endMonth = 10;
  const labels = data.map((_, i) => months[(endMonth - (data.length - 1 - i) + 120) % 12]);
  const max = Math.max(...data, 1);
  const W = 320, H = 150, gap = 6, barW = (W - gap * (data.length - 1)) / data.length;

  return (
    <section className="mt-5 rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="min-w-0 text-sm font-semibold">{t("profitChart")}</h2>
        <span className="shrink-0 text-xs font-bold tabular-nums">{fmt(data.at(-1) ?? 0, currency)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="mt-3 w-full" role="img" aria-label={t("profitChart")}>
        {data.map((v, i) => {
          const h = Math.max(2, (v / max) * H);
          const x = i * (barW + gap);
          return (
            <g key={i}>
              <title>{`${labels[i]}: ${fmt(v, currency)}`}</title>
              <rect x={x} y={H - h} width={barW} height={h} rx={4}
                className={i === data.length - 1 ? "fill-primary" : "fill-primary/30"} />
              {i % 2 === 1 && (
                <text x={x + barW / 2} y={H + 15} textAnchor="middle" className="fill-muted-foreground text-[10px]">{labels[i]}</text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
