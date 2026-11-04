import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import type { Approval, ApprovalKind } from "@/data/mock";
import { useApp, type TKey } from "@/lib/app-state";
import { needsPin } from "@/lib/approvals";
import { useLeaving } from "@/lib/use-leaving";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ApproveSheet, RejectSheet, type ApproveTarget, type RejectTarget } from "@/components/Sheets";
import { DetailsSheet, SeeDetails, StateSentence } from "@/components/IllustratedScreen";
import { Button } from "@/components/ui/button";
import scene from "@/assets/zones/approvals.webp";
import { cn } from "@/lib/utils";
import allClearImg from "@/assets/zones/all-clear.webp";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals · Business Command" },
      { name: "description", content: "Approve or reject vouchers, transfers, investors, bank accounts and dispatches." },
      { property: "og:title", content: "Approvals · Business Command" },
      { property: "og:description", content: "Approve or reject what your staff sent you." },
    ],
  }),
  component: ApprovalsScreen,
});

type Filter = "all" | "money" | ApprovalKind;
const filters: [Filter, TKey][] = [
  ["all", "fAll"], ["money", "fMoney"], ["voucher", "fVoucher"], ["transfer", "fTransfer"],
  ["kyc", "fKyc"], ["bank", "fBank"], ["dispatch", "fDispatch"],
];
const isMoney = (a: Approval) => a.kind === "payout" || a.kind === "transfer" || a.kind === "voucher";

function ApprovalsScreen() {
  const { t, tx, money, business: b, businessId } = useApp();
  const [details, setDetails] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const { leaving, leave } = useLeaving();
  const [approve, setApprove] = useState<ApproveTarget | null>(null);
  const [reject, setReject] = useState<RejectTarget | null>(null);

  const match = (a: Approval) => filter === "all" || (filter === "money" ? isMoney(a) : a.kind === filter);
  const list = b.approvals.filter(match);
  const count = (f: Filter) => b.approvals.filter((a) => f === "all" || (f === "money" ? isMoney(a) : a.kind === f)).length;

  return (
    <div className="illustrated-screen px-5 pt-6 pb-8">
      <ScreenHeader titleKey="approvalsTitle" />

      <Button variant="ghost" className="relative mt-4 h-auto w-full p-0 hover:bg-transparent" aria-label={t("reviewRequests")} onClick={()=>setDetails(true)}><img src={b.approvals.length?scene:allClearImg} alt="" className="aspect-square w-full object-contain" /><span className="absolute right-2 bottom-6 rounded-full border bg-card px-4 py-2 shadow-soft">{t("pending",{n:b.approvals.length})}</span></Button>
      <StateSentence tone={b.approvals.length?"warn":"good"}>{b.approvals.length?t("approvalSentence",{n:b.approvals.length}):t("allClear")}</StateSentence>
      <section><h2 className="text-sm font-semibold text-muted-foreground">{t("approvalsTitle")}</h2><p className="mt-2 text-[32px] font-extrabold">{t("pending",{n:b.approvals.length})}</p><Button className="mt-4 min-h-12 w-full" onClick={()=>setDetails(true)} disabled={!b.approvals.length}>{t("reviewRequests")}</Button></section>
      <SeeDetails onClick={()=>setDetails(true)} />
      <DetailsSheet open={details} onClose={()=>setDetails(false)} title={t("approvalsTitle")}>
      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map(([f, k]) => {
          const n = count(f);
          return (
            <Button
              key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              variant="outline" className={cn("min-h-12 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors", filter === f ? "border-primary bg-secondary text-foreground" : "bg-card text-muted-foreground")}
            >
              {t(k)}{n > 0 && <span className="ml-1 text-bad">· {n}</span>}
            </Button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <div className="animate-screen-in flex flex-col items-center py-10 text-center">
            <img src={allClearImg} alt="" width={180} height={180} loading="lazy" className="h-40 w-auto opacity-90" />
            <p className="mt-4 font-semibold">{t("allClear")}</p>
          </div>
        )}
        {list.map((a) => {
          const key = `${businessId}:${a.id}`;
          const pin = needsPin(a);
          const title = tx(a.title);
          const rows: [string, string][] = [[t("approvalsTitle"), tx(b.name)]];
          if (a.amount) rows.unshift([t("totalAmount"), money(a.amount)]);
          return (
            <div key={a.id} className={cn("rounded-2xl border bg-card p-4 shadow-soft transition-all duration-300", leaving.has(key) && "translate-x-full opacity-0")}>
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                <span>{tx(b.name)}</span>
                {pin && <span className="flex items-center gap-1 normal-case"><Lock className="size-3" /> {t("needsPin")}</span>}
              </div>
              <p className="mt-1.5 font-semibold leading-snug">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{tx(a.detail)}</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => {setDetails(false);setReject({ key, title })}} className="flex-1 min-h-11 rounded-xl bg-bad-soft py-2.5 text-sm font-semibold text-bad">{t("reject")}</Button>
                <Button onClick={() => {setDetails(false);setApprove({ key, title, pin, rows })}} className="flex-1 min-h-11 rounded-xl bg-good py-2.5 text-sm font-semibold text-primary-foreground">{t("approve")}</Button>
              </div>
            </div>
          );
        })}
      </div>

      </DetailsSheet>

      <ApproveSheet target={approve} onClose={() => {setApprove(null);setDetails(true)}} onApproved={(k) => { leave(k); toast.success(t("approvedToast")); }} />
      <RejectSheet target={reject} onClose={() => {setReject(null);setDetails(true)}} onRejected={(k) => { setReject(null); setDetails(true); leave(k); toast(t("rejectedToast")); }} />
    </div>
  );
}
