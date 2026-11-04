import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Ship } from "lucide-react";
import { supply } from "@/data/mock";
import type { Stage } from "@/types";
import { useApp } from "@/lib/app-state";
import { useLeaving } from "@/lib/use-leaving";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ApproveSheet, RejectSheet, type ApproveTarget, type RejectTarget } from "@/components/Sheets";
import { DetailsSheet, StateSentence, SeeDetails } from "@/components/IllustratedScreen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import road from "@/assets/scenes/supply-road.png";
import stockImage from "@/assets/zones/supply.webp";
import shipImage from "@/assets/scenes/import-ship.png";
export const Route = createFileRoute("/supply-chain")({ head: () => ({ meta: [
  { title: "Supply Chain · Business Command" }, { name: "description", content: "Your stock, deliveries and dispatch requests on an illustrated supply road." },
  { property: "og:title", content: "Supply Chain · Business Command" }, { property: "og:description", content: "Your stock, deliveries and dispatch requests on an illustrated supply road." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
]}), component: SupplyScreen });
function SupplyScreen() {
  const { businessId } = useApp();
  return <SupplyBody key={businessId} />;
}
function SupplyBody() {
  const { t, tx, money, business: b, businessId } = useApp();
  const data = supply[businessId];
  const [group, setGroup] = useState<Stage | "low" | "imports" | null>(null);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [approve, setApprove] = useState<ApproveTarget | null>(null);
  const [reject, setReject] = useState<RejectTarget | null>(null);
  const { leaving, leave } = useLeaving();
  if (!data) return null;
  const dispatches = b.approvals.filter(a=>a.kind==='dispatch');
  const title = group === 'low' ? t('lowStockTitle') : group === 'imports' ? t('importsTitle') : group === 'transit' ? t('stageTransit') : group === 'delivered' ? t('stageDelivered') : t('stageStock');
  return <div className="illustrated-screen px-5 pt-6 pb-8">
    <ScreenHeader titleKey="supplyTitle" />
    <div className="scene-supply -mx-3 mt-5">
      <img src={road} alt="" />
      <Button variant="ghost" className="scene-hit stock" onClick={()=>setGroup('stock')}><span>{t('stockBubble',{n:b.supply.inStock})}</span></Button>
      <Button variant="ghost" className="scene-hit transit" onClick={()=>setGroup('transit')}><span>{t('transitBubble',{n:b.supply.onTheWay})}</span></Button>
      <Button variant="ghost" className="scene-hit delivered" onClick={()=>setGroup('delivered')}><span>{t('deliveredBubble',{n:b.supply.deliveredToday})}</span></Button>
      <Button variant="ghost" className="scene-hit low" onClick={()=>setGroup('low')}><span>{data.low.length ? t('almostOut',{n:data.low.length}) : t('allStocked')}</span></Button>
    </div>
    <StateSentence tone={data.low.length || dispatches.length ? 'warn':'good'}>{data.low.length || dispatches.length ? t('supplySentence',{n:data.low.length,m:dispatches.length}):t('sumAllGood')}</StateSentence>
    <section className="border-b pb-7"><h2 className="text-sm font-semibold text-muted-foreground">{t('dispatchTitle')}</h2><div className="mt-3 rounded-2xl border bg-card p-5"><p className="text-[32px] leading-tight font-extrabold">{t('ordersWaiting',{n:dispatches.length})}</p><Button className="mt-4 min-h-12 w-full rounded-xl" disabled={!dispatches.length} onClick={()=>setDispatchOpen(true)}>{t('review')}</Button></div></section>
    <section className="mt-7"><h2 className="text-xl font-bold">{t('shipsAbroad')}</h2><Button variant="ghost" className="mt-3 h-auto w-full justify-start gap-4 p-0 text-left" onClick={()=>setGroup('imports')}><img src={shipImage} alt="" className="size-24 shrink-0 object-contain" /><span className="text-lg font-semibold">{data.imports.length ? t('containerArrival',{n:data.imports.length,date:tx(data.imports[0]?.eta ?? {en:'',bn:''})}):t('noImports')}</span></Button></section>
    <SeeDetails onClick={()=>setGroup('stock')} />
    <DetailsSheet open={group!==null} onClose={()=>setGroup(null)} title={title}>
      {group==='low' ? (data.low.length ? data.low.map(l=><div key={l.id} className="mb-3 flex items-center gap-3 rounded-xl border p-4"><img src={stockImage} alt="" className="size-16 object-contain" /><div className="min-w-0 flex-1"><p className="font-bold">{tx(l.product)}</p><p className="mt-1 text-sm">{t('leftOf',{n:l.left,m:l.min})}</p><StatusBadge tone="bad">{t('lowBadge')}</StatusBadge></div></div>):<p>{t('allStocked')}</p>) : group==='imports' ? (data.imports.length ? data.imports.map(im=><div key={im.id} className="mb-3 rounded-xl border p-4"><Ship className="size-12 text-good" /><p className="mt-3 font-bold">{im.container}</p><p className="text-sm">{tx(im.from)} → {tx(im.eta)}</p><StatusBadge tone="neutral">{tx(im.status)}</StatusBadge></div>):<p>{t('noImports')}</p>) : <>
      {data.items.filter(i=>i.stage===group).map(it=><div key={it.id} className="mb-3 flex items-center gap-3 rounded-xl border p-4"><img src={stockImage} alt="" className="size-20 shrink-0 object-contain" /><div className="min-w-0"><p className="font-bold">{tx(it.product)}</p><p className="mt-1 text-xl font-bold">{t('pcs',{n:it.qty})}</p><p className="mt-1 text-xs text-muted-foreground">{tx(it.party)} · {tx(it.date)}</p></div></div>)}
      {!data.items.some(i=>i.stage===group)&&<p>{t('noItems')}</p>}
      </>}
    </DetailsSheet>
    <DetailsSheet open={dispatchOpen} onClose={()=>setDispatchOpen(false)} title={t('dispatchTitle')}><div className="space-y-3">
          {dispatches.map((a) => {
            const key = `${businessId}:${a.id}`;
            const d = a.dispatch;
            if (!d) return null;
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
                  <Button onClick={() => (setDispatchOpen(false), setReject({ key, title }))} className="flex-1 min-h-11 rounded-xl bg-bad-soft py-2.5 text-sm font-semibold text-bad">{t("reject")}</Button>
                  <Button
                    onClick={() => (setDispatchOpen(false), setApprove({ key, title, pin: false, rows: [[t("totalAmount"), money(a.amount ?? 0)], [t("fDispatch"), t("items", { n: d.items })]] }))}
                    className="flex-[1.4] min-h-11 rounded-xl bg-good py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {t("approveDispatch")}
                  </Button>
                </div>
              </div>
            );
          })}
</div></DetailsSheet>
    <ApproveSheet target={approve} onClose={()=>{setApprove(null);setDispatchOpen(true)}} onApproved={k=>{leave(k);toast.success(t('approvedToast'))}} />
    <RejectSheet target={reject} onClose={()=>{setReject(null);setDispatchOpen(true)}} onRejected={k=>{setReject(null);leave(k);setDispatchOpen(true);toast(t('rejectedToast'))}} />
  </div>;
}
