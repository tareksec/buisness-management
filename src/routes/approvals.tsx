import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import type { Approval, ApprovalKind } from "@/data/mock";
import { useApp, type TKey } from "@/lib/app-state";
import { needsPin } from "@/lib/approvals";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { t, tx, money, business: b, businessId, resolveApproval } = useApp();
  const [details, setDetails] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [cursor, setCursor] = useState<Record<string, number>>({});
  const [stamp, setStamp] = useState<string | null>(null);
  const [approve, setApprove] = useState<ApproveTarget | null>(null);
  const [reject, setReject] = useState<RejectTarget | null>(null);
  const index = Math.min(cursor[businessId] ?? 0, Math.max(0,b.approvals.length-1));
  const current = b.approvals[index];
  const list = b.approvals.filter(a => filter === "all" || (filter === "money" ? isMoney(a) : a.kind === filter));
  const choose = (n:number) => setCursor(c=>({...c,[businessId]:n}));
  const review = (a:Approval, yes:boolean) => {
    const key = `${businessId}:${a.id}`, title=tx(a.title);
    setDetails(false);
    if (yes) setApprove({key,title,pin:needsPin(a),rows:[[t("approvalsTitle"),tx(b.name)],...(a.amount?[[t("totalAmount"),money(a.amount)] as [string,string]]:[])]});
    else setReject({key,title});
  };
  const paper = (a:Approval, main=false) => <article key={`${businessId}:${a.id}`} className={cn("relative rounded-lg border bg-card p-5 shadow-soft",main&&"animate-paper-in")}>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{tx(b.name)}</span>{needsPin(a)&&<span className="flex items-center gap-1"><Lock className="size-4" />{t("needsPin")}</span>}</div>
    <h2 className="mt-4 text-lg font-bold leading-relaxed">{tx(a.title)}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{tx(a.detail)}</p>
    <p className="mt-5 text-xs font-semibold text-muted-foreground">{t(a.amount?"totalAmount":"amountNotApplicable")}</p>
    {a.amount!==undefined&&<p className="mt-1 break-words text-[32px] font-extrabold">{money(a.amount)}</p>}
    <div className="mt-5 grid grid-cols-2 gap-2"><Button onClick={()=>review(a,true)} className="min-h-12 bg-good text-primary-foreground">{t("approve")}</Button><Button onClick={()=>review(a,false)} className="min-h-12 bg-bad-soft text-bad">{t("reject")}</Button></div>
    {stamp===`${businessId}:${a.id}`&&<div role="status" className="approval-stamp pointer-events-none absolute inset-0 grid place-items-center bg-card/85"><span className="rounded-lg border-4 border-good px-4 py-3 text-2xl font-extrabold text-good">{t("approvalStamp")}</span></div>}
  </article>;
  return <div className="illustrated-screen px-5 pt-6 pb-8">
    <ScreenHeader titleKey="approvalsTitle" />
    <Button variant="ghost" className="relative mt-4 h-auto w-full p-0 hover:bg-transparent" aria-label={t("seeAll")} onClick={()=>setDetails(true)}>
      <img src={b.approvals.length?scene:allClearImg} alt="" width={360} height={360} className="aspect-square w-full object-contain" />
      {b.approvals.length>0&&<svg viewBox="0 0 100 100" className="paper-tray absolute h-24 w-28" aria-hidden>{Array.from({length:b.approvals.length},(_,i)=><path key={i} d={`M10 ${66-i*4}L55 ${42-i*4}L92 ${57-i*4}L47 ${82-i*4}Z`} className="fill-card stroke-border" strokeWidth="1.5" />)}</svg>}
      <span className={cn("absolute right-1 bottom-4 rounded-full px-4 py-2 font-bold",b.approvals.length?"bg-bad-soft text-bad":"bg-good-soft text-good")}>{t("waitingCount",{n:b.approvals.length})}</span>
    </Button>
    <StateSentence tone={current?"warn":"good"}>{current?t("approvalQueueSentence",{n:b.approvals.length,m:b.approvals.filter(isMoney).length}):t("allClear")}</StateSentence>
    <section>{current&&paper(current,true)}</section>
    {current&&<div className="mt-4 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1"><Button size="icon" variant="ghost" className="size-12" disabled={index===0} aria-label={t("previousRequest")} onClick={()=>choose(index-1)}><ChevronLeft /></Button><span className="text-sm font-semibold">{t("paperPosition",{n:index+1,m:b.approvals.length})}</span><Button size="icon" variant="ghost" className="size-12" disabled={index>=b.approvals.length-1} aria-label={t("nextRequest")} onClick={()=>choose(index+1)}><ChevronRight /></Button></div><Button variant="link" onClick={()=>setDetails(true)}>{t("seeAll")}</Button></div>}
    <DetailsSheet open={details} onClose={()=>setDetails(false)} title={t("approvalsTitle")}>
      <div className="flex flex-wrap gap-2">{filters.map(([f,k])=><Button key={f} variant="outline" aria-pressed={f===filter} onClick={()=>setFilter(f)} className={cn("rounded-full",f===filter&&"bg-primary text-primary-foreground")}>{t(k)}</Button>)}</div>
      <div className="mt-5 space-y-4">{list.map(a=>paper(a))}{!list.length&&<p className="py-6 text-center">{t("allClear")}</p>}</div>
    </DetailsSheet>
    <ApproveSheet target={approve} onClose={()=>setApprove(null)} onApproved={key=>{setApprove(null);setStamp(key);setTimeout(()=>{resolveApproval(key);setStamp(null)},850);toast.success(t("approvedToast"))}} />
    <RejectSheet target={reject} onClose={()=>setReject(null)} onRejected={key=>{setReject(null);resolveApproval(key);toast(t("rejectedToast"))}} />
  </div>;
}
