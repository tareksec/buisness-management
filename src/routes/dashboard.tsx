import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronRight, Coins, HandCoins, ShoppingBag, Wallet } from "lucide-react";
import { attention, dashboard } from "@/data/mock";
import type { Currency, DashboardMetric } from "@/types";
import { useApp, toLangDigits, type TKey } from "@/lib/app-state";
import { DetailsSheet, SeeDetails, StateSentence } from "@/components/IllustratedScreen";
import { Button } from "@/components/ui/button";
import scene from "@/assets/scenes/business-map.png";
import moneyPicture from "@/assets/scenes/coin-stack.png";
import shopPicture from "@/assets/scenes/shop-front.png";
import deskPicture from "@/assets/zones/approvals.webp";
import vaultPicture from "@/assets/zones/investment.webp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard · Business Command" },
      { name: "description", content: "Money in, profit paid, payouts due and sales for each of your four businesses." },
      { property: "og:title", content: "Dashboard · Business Command" },
      { property: "og:description", content: "Monthly money, profit and sales across your businesses." },
    ],
  }),
  component: Dashboard,
});

const ALL = "all";
const METRICS: [DashboardMetric, TKey][] = [
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
  const [details, setDetails] = useState(false);
  const [all, setAll] = useState(false);
  const fmt = useFormat();
  const selected = all ? ALL : businessId;
  const stats = dashboard[businessId];
  if (!stats) return null;
  const items = attention.filter((a) => all || a.businessId === businessId);
  const nameOf = (id: string) => tx(businesses.find((b) => b.id === id)?.name ?? {en:"",bn:""});

  return (
    <div className="illustrated-screen px-5 pt-6 pb-8">
      <header className="flex items-center gap-3"><Button asChild variant="outline" className="size-12 shrink-0 rounded-full"><Link to="/" aria-label={t("back")}><ArrowLeft /></Link></Button><h1 className="text-2xl font-extrabold">{t("dashboard")}</h1></header>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pt-1 pb-1">
        {[{ id: ALL, label: t("allBusinesses") }, ...businesses.map((b) => ({ id: b.id, label: tx(b.name) }))].map((p) => (
          <Button
            key={p.id}
            variant="outline" aria-pressed={selected === p.id}
            onClick={() => (p.id === ALL ? setAll(true) : (setAll(false), setBusinessId(p.id)))}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
              selected === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card",
            )}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="business-map relative mt-4 aspect-square"><img src={scene} alt="" width={1024} height={1024} className="size-full object-contain" />{businesses.map((b,i)=>{const tone=!b.website.online?"bad":b.supply.lowStock||b.approvals.length?"warn":"good";return <Button key={b.id} variant="outline" aria-pressed={!all&&businessId===b.id} onClick={()=>{setBusinessId(b.id);setAll(false)}} className={cn("map-business absolute h-auto min-h-12 flex-col gap-0 rounded-lg px-2 py-1 text-xs shadow-soft",`map-business-${i}`,!all&&businessId===b.id&&"border-primary")}><span className="font-bold">{tx(b.name)}</span><span className={cn("flex items-center gap-1",tone==="good"?"text-good":tone==="bad"?"text-bad":"text-warn")}><span className="size-2 rounded-full bg-current" />{t(tone==="good"?"healthy":tone==="bad"?"attention":"healthWatch")}</span></Button>})}</div>
      <StateSentence tone={items.length?"warn":"good"}>{t("dashboardSentence",{trend:t(stats.moneyIn>stats.previousMonth.moneyIn?"trendUp":stats.moneyIn<stats.previousMonth.moneyIn?"trendDown":"trendSame"),n:new Set(items.map(a=>a.businessId)).size})}</StateSentence>
      <section className="grid grid-cols-1 gap-4">{METRICS.map(([key,label],i)=>{
        const picture=[moneyPicture,vaultPicture,deskPicture,shopPicture][i];
        return <div key={key} className="relative overflow-hidden rounded-lg border bg-card p-4 shadow-soft"><img src={picture} alt="" width={1024} height={1024} loading="lazy" className="float-right h-20 w-20 object-contain" /><h2 className="min-h-10 text-sm font-bold">{t(label)}</h2>{(all?businesses:businesses.filter(b=>b.id===businessId)).map(b=>{const d=dashboard[b.id];if(!d)return null;const previous=d.previousMonth[key];const change=previous?Math.round((d[key]-previous)/previous*100):0;return <div key={b.id} className="clear-both mt-3 border-t pt-3">{all&&<p className="text-sm font-semibold text-muted-foreground">{tx(b.name)}</p>}<p className="break-words text-[32px] font-extrabold">{fmt(d[key],d.currency)}</p><p className={cn("mt-1 flex items-center gap-1 text-sm",change<0?"text-bad":change>0?"text-good":"text-muted-foreground")}>{change!==0&&(change>0?<ArrowUp className="size-4 shrink-0" />:<ArrowDown className="size-4 shrink-0" />)}{t(change>0?"upMonth":change<0?"downMonth":"sameMonth",{n:Math.abs(change)})}</p></div>})}</div>;
      })}</section>
      <section className="mt-7"><h2 className="text-xl font-bold">{t("needsAttention")}</h2><div className="mt-4 space-y-3">{items.slice(0,3).map(a=><Button key={a.id} asChild variant="outline" className="h-auto min-h-20 w-full justify-between p-4"><Link to={a.to} onClick={()=>setBusinessId(a.businessId)}><span className="flex min-w-0 items-start gap-2"><span className={cn("mt-1 size-3 shrink-0 rounded-full",a.tone==="bad"?"bg-bad":"bg-warn")} /><span className="min-w-0 text-left"><span className="block font-bold">{tx(a.text)}</span>{all&&<span className="block text-xs text-muted-foreground">{nameOf(a.businessId)}</span>}</span></span><ChevronRight className="shrink-0" /></Link></Button>)}{!items.length&&<p>{t("nothingAttention")}</p>}</div></section>
      <SeeDetails onClick={()=>setDetails(true)} />
      <DetailsSheet open={details} onClose={()=>setDetails(false)} title={t("dashboard")}>
      {all && businesses.map(b=>{const d=dashboard[b.id];return d?<div key={b.id}><h2 className="mt-5 font-bold">{tx(b.name)}</h2><ProfitChart data={d.profitByMonth} currency={d.currency} /></div>:null})}
      {all ? (
        <section className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">{t("perBusiness")}</p>
          {METRICS.map(([key, label]) => (
            <div key={key} className="rounded-2xl border bg-card p-4 shadow-soft">
              <p className="text-sm font-semibold">{t(label)}</p>
              <ul className="mt-2 divide-y">
                {businesses.map((b) => {
                  const s = dashboard[b.id];
                  if (!s) return null;
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

      </DetailsSheet>
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
