import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ChevronRight, Ship, Truck, Warehouse } from "lucide-react";
import { supply, type Stage } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { useLeaving } from "@/lib/use-leaving";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PreviewFooter } from "@/components/PreviewFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { ApproveSheet, RejectSheet, type ApproveTarget, type RejectTarget } from "@/components/Sheets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supply-chain")({
  head: () => ({
    meta: [
      { title: "Supply Chain · Business Command" },
      { name: "description", content: "Stock, deliveries, low stock, dispatch requests and import shipments." },
      { property: "og:title", content: "Supply Chain · Business Command" },
      { property: "og:description", content: "Stock, deliveries, low stock, dispatch requests and import shipments." },
    ],
  }),
  component: SupplyScreen,
});

const steps: { id: Stage; key: "stageStock" | "stageTransit" | "stageDelivered"; icon: typeof Warehouse; field: "inStock" | "onTheWay" | "deliveredToday" }[] = [
  { id: "stock", key: "stageStock", icon: Warehouse, field: "inStock" },
  { id: "transit", key: "stageTransit", icon: Truck, field: "onTheWay" },
  { id: "delivered", key: "stageDelivered", icon: CheckCircle2, field: "deliveredToday" },
];

function SupplyScreen() {
  const { t, tx, num, money, business: b, businessId } = useApp();
  const data = supply[businessId]!;
  const [stage, setStage] = useState<Stage>("stock");
  const { leaving, leave } = useLeaving();
  const [approve, setApprove] = useState<ApproveTarget | null>(null);
  const [reject, setReject] = useState<RejectTarget | null>(null);
  useEffect(() => setStage("stock"), [businessId]);

  const dispatches = b.approvals.filter((a) => a.kind === "dispatch");
  const items = data.items.filter((i) => i.stage === stage);

  return (
    <div className="px-5 pt-6">
      <ScreenHeader titleKey="supplyTitle" />

      {/* Steps */}
      <section className="mt-5 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex items-start">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = s.id === stage;
            return (
              <div key={s.id} className="flex flex-1 items-start">
                <button onClick={() => setStage(s.id)} aria-pressed={active} className="flex flex-1 flex-col items-center text-center">
                  <span className={cn("grid size-14 place-items-center rounded-2xl border-2 transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    <Icon className="size-6" />
                  </span>
                  <span className="mt-2 text-2xl font-extrabold tracking-tight">{num(b.supply[s.field])}</span>
                  <span className={cn("text-xs", active ? "font-semibold" : "text-muted-foreground")}>{t(s.key)}</span>
                </button>
                {i < steps.length - 1 && (
                  <span className="mt-6 flex w-6 shrink-0 items-center text-muted-foreground" aria-hidden>
                    <span className="h-px flex-1 bg-muted-foreground/50" /><ChevronRight className="-ml-1 size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">{t("tapStep")}</p>
      </section>

      <div key={stage + businessId} className="animate-screen-in mt-3 space-y-2">
        {items.length === 0 && <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("noItems")}</p>}
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-semibold">{tx(it.product)}</p>
              <p className="text-lg font-bold">{t("pcs", { n: it.qty })}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{tx(it.party)} · {tx(it.date)}</p>
          </div>
        ))}
      </div>

      {/* Low stock */}
      <section className="mt-6">
        <h2 className="font-bold">{t("lowStockTitle")}</h2>
        <div className="mt-3 space-y-2">
          {data.low.length === 0 && <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("allStocked")}</p>}
          {data.low.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
              <AlertTriangle className="size-5 shrink-0 text-bad" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{tx(l.product)}</p>
                <p className="text-xs text-muted-foreground">{t("leftOf", { n: l.left, m: l.min })}</p>
              </div>
              <StatusBadge tone="bad">{t("lowBadge")}</StatusBadge>
            </div>
          ))}
        </div>
      </section>

      {/* Dispatch */}
      <section className="mt-6">
        <h2 className="font-bold">{t("dispatchTitle")}</h2>
        <div className="mt-3 space-y-2">
          {dispatches.length === 0 && <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("noDispatch")}</p>}
          {dispatches.map((a) => {
            const key = `${businessId}:${a.id}`;
            const d = a.dispatch!;
            const title = `${d.order} · ${tx(d.customer)}`;
            return (
              <div key={a.id} className={cn("rounded-2xl border bg-card p-4 shadow-soft transition-all duration-300", leaving.has(key) && "translate-x-full opacity-0")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{d.order}</p>
                    <p className="text-xs text-muted-foreground">{tx(d.customer)} · {t("items", { n: d.items })}</p>
                  </div>
                  <p className="text-lg font-extrabold">{money(a.amount ?? 0)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setReject({ key, title })} className="flex-1 rounded-xl bg-bad-soft py-2.5 text-sm font-semibold text-bad">{t("reject")}</button>
                  <button
                    onClick={() => setApprove({ key, title, pin: false, rows: [[t("totalAmount"), money(a.amount ?? 0)], [t("fDispatch"), t("items", { n: d.items })]] })}
                    className="flex-[1.4] rounded-xl bg-good py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {t("approveDispatch")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Imports */}
      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-soft">
        <h2 className="flex items-center gap-2 text-sm font-bold"><Ship className="size-4" /> {t("importsTitle")}</h2>
        <div className="mt-2 divide-y">
          {data.imports.length === 0 && <p className="py-2 text-sm text-muted-foreground">{t("noImports")}</p>}
          {data.imports.map((im) => (
            <div key={im.id} className="flex items-center justify-between gap-2 py-2.5">
              <div>
                <p className="text-sm font-semibold">{im.container}</p>
                <p className="text-xs text-muted-foreground">{tx(im.from)} → {tx(im.eta)}</p>
              </div>
              <StatusBadge tone="neutral">{tx(im.status)}</StatusBadge>
            </div>
          ))}
        </div>
      </section>

      <PreviewFooter />

      <ApproveSheet target={approve} onClose={() => setApprove(null)} onApproved={(k) => { leave(k); toast.success(t("approvedToast")); }} />
      <RejectSheet target={reject} onClose={() => setReject(null)} onRejected={(k) => { setReject(null); leave(k); toast(t("rejectedToast")); }} />
    </div>
  );
}
