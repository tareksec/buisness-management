import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Drawer } from "vaul";
import {
  Activity, ArrowRight, Landmark, Network, Pencil, ShieldCheck, Truck, Monitor, User,
} from "lucide-react";
import { fundedPercent } from "@/data/mock";
import { useApp, type TKey } from "@/lib/app-state";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import { PreviewFooter } from "@/components/PreviewFooter";
import { BusinessPills } from "@/components/BusinessPills";
import { cn } from "@/lib/utils";
import investmentImg from "@/assets/zones/investment.webp";
import supplyImg from "@/assets/zones/supply.webp";
import websiteImg from "@/assets/zones/website.webp";
import approvalsImg from "@/assets/zones/approvals.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Business Command · Owner workspace" },
      { name: "description", content: "See all four of your businesses at a glance: investment, stock, website and approvals." },
      { property: "og:title", content: "Business Command · Owner workspace" },
      { property: "og:description", content: "See all four of your businesses at a glance." },
    ],
  }),
  component: Home,
});

type ZoneId = "investment" | "supply" | "website" | "approvals";

function useZones() {
  const { t, business: b } = useApp();
  const low = b.supply.lowStock;
  const pending = b.approvals.length;
  const pct = fundedPercent(b);
  return {
    investment: {
      img: investmentImg, icon: Landmark, label: t("investment"),
      tone: (pct >= 60 ? "good" : "warn") as Tone, badge: t("funded", { n: pct }),
    },
    supply: {
      img: supplyImg, icon: Truck, label: t("supply"),
      tone: (low > 0 ? "bad" : "good") as Tone,
      badge: low > 0 ? t("lowStockBadge", { n: low }) : t("inStockBadge"),
    },
    website: {
      img: websiteImg, icon: Monitor, label: t("website"),
      tone: (b.website.online ? "good" : "bad") as Tone,
      badge: b.website.online ? t("online") : t("offline"), edit: true,
    },
    approvals: {
      img: approvalsImg, icon: ShieldCheck, label: t("approvals"),
      tone: (pending > 0 ? "bad" : "good") as Tone,
      badge: pending > 0 ? t("pending", { n: pending }) : t("noPending"),
    },
  };
}

function Home() {
  const { t, lang, setLang, business: b } = useApp();
  const navigate = useNavigate();
  const zones = useZones();
  const [open, setOpen] = useState<ZoneId | null>(null);

  const parts: string[] = [];
  if (b.approvals.length) parts.push(t("sumApprovals", { n: b.approvals.length }));
  if (b.supply.lowStock) parts.push(t("sumLow", { n: b.supply.lowStock }));
  if (!b.website.online) parts.push(t("sumOffline"));
  const healthy = parts.length === 0;

  const positions: Record<ZoneId, string> = {
    investment: "left-0 top-0",
    supply: "right-0 top-0",
    website: "left-0 bottom-0",
    approvals: "right-0 bottom-0",
  };

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground">{t("workspace")}</p>
          <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-tight">{t("title")}</h1>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex rounded-full border bg-card p-0.5 text-xs font-semibold" role="group" aria-label="Language">
            {(["en", "bn"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn("rounded-full px-2.5 py-1 transition-colors", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                {l === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
          <button aria-label="Profile" className="grid size-10 place-items-center rounded-full border bg-card shadow-soft">
            <User className="size-5" />
          </button>
        </div>
      </header>

      <BusinessPills className="mt-5" />

      <div className="mt-6 flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">{t("glance")}</h2>
        <span className="text-xs text-muted-foreground">{t("updated")}</span>
      </div>

      {/* Isometric map */}
      <div className="relative mt-3 h-[430px]">
        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path className="dotted-link" vectorEffect="non-scaling-stroke" d="M50 50 Q30 42 25 26" />
          <path className="dotted-link" vectorEffect="non-scaling-stroke" d="M50 50 Q70 42 75 26" />
          <path className="dotted-link" vectorEffect="non-scaling-stroke" d="M50 50 Q30 58 25 74" />
          <path className="dotted-link" vectorEffect="non-scaling-stroke" d="M50 50 Q70 58 75 74" />
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="grid size-24 rotate-45 place-items-center rounded-2xl border bg-card shadow-soft">
            <div className="-rotate-45 flex flex-col items-center gap-1 text-center">
              <Network className="size-4" />
              <span className="w-20 text-[8.5px] leading-tight font-bold tracking-[0.12em]">{t("center")}</span>
            </div>
          </div>
        </div>

        {(Object.keys(zones) as ZoneId[]).map((id) => {
          const z = zones[id];
          const Icon = z.icon;
          return (
            <button
              key={id}
              onClick={() => setOpen(id)}
              className={cn("absolute flex w-[46%] flex-col items-center rounded-2xl p-1 text-center transition-transform active:scale-95", positions[id])}
            >
              <img src={z.img} alt="" width={140} height={140} className="h-[120px] w-auto object-contain drop-shadow-sm" />
              <span className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold">
                <Icon className="size-3.5" /> {z.label}
              </span>
              <span className="mt-1 flex items-center gap-1">
                <StatusBadge tone={z.tone}>{z.badge}</StatusBadge>
                {"edit" in z && <Pencil className="size-3 text-muted-foreground" aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Health */}
      <section className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-full", healthy ? "bg-good-soft text-good" : "bg-warn-soft text-warn")}>
          <Activity className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("health")}</p>
          <p className="text-xs text-muted-foreground">{healthy ? t("sumAllGood") : parts.join(" · ")}</p>
        </div>
        <StatusBadge tone={healthy ? "good" : "warn"}>{healthy ? t("healthy") : t("attention")}</StatusBadge>
      </section>

      <Link
        to="/dashboard"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-soft transition-opacity active:opacity-90"
      >
        {t("goDashboard")} <ArrowRight className="size-4" />
      </Link>

      <PreviewFooter />

      <ZoneSheet zone={open} onClose={() => setOpen(null)} onOpen={(to) => { setOpen(null); navigate({ to }); }} />
    </div>
  );
}

type Dest = "/vault" | "/supply-chain" | "/website" | "/approvals";

function ZoneSheet({ zone, onClose, onOpen }: { zone: ZoneId | null; onClose: () => void; onOpen: (to: Dest) => void }) {
  const { t, tx, num, money, business: b } = useApp();
  const zones = useZones();
  const [last, setLast] = useState<ZoneId>("investment");
  if (zone && zone !== last) setLast(zone);
  const id = zone ?? last;

  const stats: Record<ZoneId, [TKey, string][]> = {
    investment: [
      ["activeProjects", num(b.investment.activeProjects)],
      ["totalRaised", money(b.investment.raised)],
      ["totalNeeded", money(b.investment.needed)],
      ["currentProfit", money(b.investment.profit)],
    ],
    supply: [
      ["inStock", num(b.supply.inStock)],
      ["onTheWay", num(b.supply.onTheWay)],
      ["deliveredToday", num(b.supply.deliveredToday)],
      ["lowStock", num(b.supply.lowStock)],
    ],
    website: [
      ["siteStatus", b.website.online ? t("online") : t("offline")],
      ["productsLive", num(b.website.productsLive)],
      ["productsHidden", num(b.website.productsHidden)],
    ],
    approvals: [],
  };
  const action: Record<ZoneId, [TKey, Dest]> = {
    investment: ["openVault", "/vault"],
    supply: ["openSupply", "/supply-chain"],
    website: ["openWebsite", "/website"],
    approvals: ["openApprovals", "/approvals"],
  };
  const z = zones[id];
  const Icon = z.icon;

  return (
    <Drawer.Root open={zone !== null} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-3xl bg-card px-5 pt-3 pb-6 outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between gap-3">
            <Drawer.Title className="flex items-center gap-2 text-lg font-bold">
              <Icon className="size-5" /> {z.label}
            </Drawer.Title>
            <StatusBadge tone={z.tone}>{z.badge}</StatusBadge>
          </div>
          <Drawer.Description className="mt-0.5 text-xs text-muted-foreground">{tx(b.name)}</Drawer.Description>

          {id === "approvals" ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{t("topPending")}</p>
              {b.approvals.length === 0 && <p className="rounded-xl bg-muted p-4 text-sm">{t("nothingPending")}</p>}
              {b.approvals.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                  <p className="text-sm font-semibold">{tx(a.title)}</p>
                  <p className="text-xs text-muted-foreground">{tx(a.detail)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats[id].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted-foreground">{t(k)}</p>
                  <p className="mt-1 text-xl font-bold tracking-tight">{v}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("close")}</button>
            <button onClick={() => onOpen(action[id][1])} className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
              {t(action[id][0])}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
