import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { CheckCircle2, Delete, Minus, Plus, RotateCcw } from "lucide-react";
import { vault } from "@/data/mock";
import type { PayoutBatch, Split } from "@/types";
import { useApp } from "@/lib/app-state";
import { adjustSplit, splitAmounts } from "@/lib/split";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailsSheet, SeeDetails, StateSentence, FundedJar, CoinStack } from "@/components/IllustratedScreen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import room from "@/assets/scenes/vault-room.png";
import coins from "@/assets/scenes/coin-stack.png";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [
    { title: "Investment Vault · Business Command" },
    { name: "description", content: "Your projects, profit shares and payouts in an illustrated investment vault." },
    { property: "og:title", content: "Investment Vault · Business Command" },
    { property: "og:description", content: "Your projects, profit shares and payouts in an illustrated investment vault." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: VaultScreen,
});

function VaultScreen() {
  const { businessId } = useApp();
  const data = vault[businessId];
  if (!data || !data.projects[0]) return null;
  return <VaultBody key={businessId} data={data} />;
}
function VaultBody({ data }: { data: (typeof vault)[string] }) {
  const { t, tx, money, num } = useApp();
  const [selected, setSelected] = useState(data.projects[0]?.id);
  const project = data.projects.find(p => p.id === selected) ?? data.projects[0];
  const [split, setSplit] = useState<Split>(project?.contract ?? { investors: 0, partner: 0, company: 100 });
  const [tryProfit, setTryProfit] = useState("");
  const [details, setDetails] = useState(false);
  const [payouts, setPayouts] = useState(false);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [reviewing, setReviewing] = useState<PayoutBatch | null>(null);
  useEffect(() => { if (project) { setSplit(project.contract); setTryProfit(""); } }, [project]);
  if (!project) return null;
  const parsed = Number(tryProfit);
  const profit = parsed > 0 ? parsed : project.profit;
  const amounts = splitAmounts(split, profit);
  const waiting = data.payouts.filter(p => !approved[p.id]);
  const total = waiting.reduce((sum,p) => sum + p.total, 0);
  const active = data.projects.filter(p => p.status !== "settled");
  const step = (d: number) => setSplit(adjustSplit(project.contract, split.investors + d));
  return <div className="illustrated-screen px-5 pt-6 pb-8">
    <ScreenHeader titleKey="vaultTitle" />
    <div className="relative -mx-3 mt-4 aspect-square">
      <img src={room} alt="" className="size-full object-contain" />
      <div className="absolute inset-x-[15%] top-[42%] flex justify-between gap-3">
        {active.map(p => <Button key={p.id} variant="ghost" aria-pressed={project.id === p.id} onClick={() => setSelected(p.id)} className="project-jar flex h-auto min-w-0 flex-1 flex-col gap-0 p-0 hover:bg-transparent">
          <span className="rounded-full border bg-card px-2 py-1 text-[11px] shadow-soft">{t("funded", { n: Math.round(p.raised/p.goal*100) })}</span>
          <span className="h-28 w-24"><FundedJar percent={p.raised/p.goal*100} /></span>
          <span className="rounded-lg border bg-card px-2 py-1 text-xs font-bold shadow-soft">{tx(p.name)}</span>
        </Button>)}
      </div>
    </div>
    <StateSentence tone={project.status === "raising" ? "warn" : "good"}>{t("vaultSentence", { name: tx(project.name), raised: money(project.raised), needed: money(Math.max(0, project.goal-project.raised)) })}</StateSentence>
    <section className="flex items-center justify-between gap-3 border-b pb-7">
      <div className="min-w-0"><h2 className="text-sm font-semibold text-muted-foreground">{t("profitSoFar")}</h2><p className="mt-2 text-[32px] leading-tight font-extrabold break-words">{money(profit)}</p></div>
      <img src={coins} alt="" className="size-20 shrink-0 object-contain" />
    </section>
    <section className="mt-7 border-b pb-7">
      <h2 className="text-xl font-bold">{t("whoGetsWhat")}</h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {([['investors',split.investors,amounts.investors],['partner',split.partner,amounts.partner],['company',split.company,amounts.company]] as const).map(([label,pct,amt]) => <div key={label} className="min-w-0 text-center"><CoinStack share={pct} /><p className="min-h-10 text-xs font-semibold">{t(label)}</p><p className="text-[13px] font-bold break-words">{money(amt)}</p><p className="mt-1 text-xs text-muted-foreground">{t("profitShare", {n:pct})}</p></div>)}
      </div>
      <div className="mt-4 flex items-center gap-3"><Button variant="outline" size="icon" className="size-12 shrink-0 rounded-full" aria-label={t("decrease")} disabled={split.investors<=0} onClick={()=>step(-1)}><Minus /></Button><input type="range" className="min-w-0 flex-1 accent-primary" aria-label={t("investors")} min={0} max={100-split.partner} value={split.investors} onChange={e=>setSplit(adjustSplit(project.contract,Number(e.target.value)))} /><Button variant="outline" size="icon" className="size-12 shrink-0 rounded-full" aria-label={t("increase")} disabled={split.investors>=100-split.partner} onClick={()=>step(1)}><Plus /></Button></div>
      <p className="mt-3 text-sm text-warn">{t("whatIf")}</p><Button variant="link" className="mt-2 h-auto p-0" onClick={()=>setSplit(project.contract)} disabled={split.investors===project.contract.investors}><RotateCcw />{t("resetContract")}</Button>
    </section>
    <section className="mt-7"><h2 className="text-sm font-semibold text-muted-foreground">{t("payoutsWaiting")}</h2><div className="mt-3 rounded-2xl border bg-card p-5"><p className="text-lg font-semibold">{waiting.length ? t("payoutSummary",{n:waiting.length}):t("noPayouts")}</p><p className="mt-2 text-[32px] font-extrabold">{money(total)}</p><Button className="mt-4 min-h-12 w-full rounded-xl" onClick={()=>setPayouts(true)} disabled={!waiting.length}>{t("review")}</Button></div></section>
    <SeeDetails onClick={()=>setDetails(true)} />
    <DetailsSheet open={details} onClose={()=>setDetails(false)} title={t("vaultTitle")}>
      <label htmlFor="try-profit" className="text-sm font-semibold">{t("tryProfit")}</label><input id="try-profit" className="mt-2 w-full rounded-xl border p-3" inputMode="numeric" value={tryProfit} placeholder={num(project.profit)} onChange={e=>setTryProfit(e.target.value.replace(/[০-৯]/g,d=>String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g,""))} /><p className="mt-2 text-xs text-muted-foreground">{t("tryHint")}</p>
      {data.projects.map(p=><div key={p.id} className="mt-5 rounded-xl border p-4"><Button variant="ghost" className="h-auto w-full justify-between p-0" onClick={()=>{setSelected(p.id);setDetails(false)}}>{tx(p.name)}<StatusBadge tone={p.status==='running'?'good':p.status==='raising'?'warn':'neutral'}>{t(p.status)}</StatusBadge></Button><dl className="mt-3 space-y-2 text-sm"><Row label={t("projectCode")} value={p.code} /><Row label={t("goal")} value={money(p.goal)} /><Row label={t("raised")} value={money(p.raised)} /><Row label={t("needed")} value={money(Math.max(0,p.goal-p.raised))} /></dl></div>)}
    </DetailsSheet>
    <DetailsSheet open={payouts} onClose={()=>setPayouts(false)} title={t("payoutsWaiting")}>
      {waiting.length ? waiting.map(pb=><div key={pb.id} className="mb-3 rounded-xl border p-4"><p className="font-bold">{t("batch")} {pb.batch}</p><p className="mt-1 text-sm text-muted-foreground">{t("investorCount",{n:pb.investors})} · {t("preparedBy",{name:tx(pb.preparedBy)})}</p><p className="mt-3 text-3xl font-bold">{money(pb.total)}</p><Button className="mt-4 min-h-12 w-full" onClick={()=>{setPayouts(false);setReviewing(pb)}}>{t("reviewApprove")}</Button></div>):<p>{t("noPayouts")}</p>}
    </DetailsSheet>
    <ApproveSheet batch={reviewing} onClose={()=>setReviewing(null)} onApproved={id=>setApproved(a=>({...a,[id]:true}))} />
  </div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

const DEMO_PIN = "1234";

function ApproveSheet({ batch, onClose, onApproved }: { batch: PayoutBatch | null; onClose: () => void; onApproved: (id: string) => void }) {
  const { t, tx, num, money } = useApp();
  const [stage, setStage] = useState<"summary" | "pin" | "done">("summary");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [last, setLast] = useState<PayoutBatch | null>(null);
  if (batch && batch !== last) { setLast(batch); setStage("summary"); setPin(""); setError(false); }
  const b = batch ?? last;

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setError(false);
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === DEMO_PIN && b) { onApproved(b.id); setStage("done"); }
        else { setError(true); setPin(""); }
      }, 150);
    }
  };

  return (
    <Drawer.Root open={batch !== null} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-3xl bg-card px-5 pt-3 pb-6 outline-none illustrated-details">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          {b && stage === "done" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-good-soft text-good"><CheckCircle2 className="size-8" /></div>
              <Drawer.Title className="mt-4 text-xl font-bold">{t("payoutApproved")}</Drawer.Title>
              <Drawer.Description className="mt-1 text-sm text-muted-foreground">{t("payoutApprovedNote", { batch: b.batch })}</Drawer.Description>
              <Button onClick={onClose} className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("done")}</Button>
            </div>
          ) : b ? (
            <>
              <Drawer.Title className="text-lg font-bold">{t("confirmPayout")}</Drawer.Title>
              <Drawer.Description className="text-xs text-muted-foreground">{t("batch")} {b.batch}</Drawer.Description>
              <div className="mt-4 space-y-2 rounded-xl bg-muted p-3 text-sm">
                <Row label={t("totalAmount")} value={money(b.total)} />
                <Row label={t("investors")} value={num(b.investors)} />
                <Row label={t("preparedBy", { name: "" }).trim()} value={tx(b.preparedBy)} />
              </div>

              {stage === "pin" && (
                <div className="mt-5">
                  <p className="text-center text-sm font-semibold">{t("enterPin")}</p>
                  <div className="mt-3 flex justify-center gap-3" aria-live="polite">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={cn("size-3.5 rounded-full border-2 border-primary transition-colors", i < pin.length && "bg-primary", error && "border-bad")} />
                    ))}
                  </div>
                  <p className={cn("mt-2 text-center text-xs", error ? "font-semibold text-bad" : "text-muted-foreground")}>
                    {error ? t("wrongPin") : t("demoPin")}
                  </p>
                  <div className="mx-auto mt-3 grid max-w-[260px] grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                      <PinKey key={d} onClick={() => press(d)}>{num(Number(d))}</PinKey>
                    ))}
                    <span />
                    <PinKey onClick={() => press("0")}>{num(0)}</PinKey>
                    <PinKey onClick={() => setPin((p) => p.slice(0, -1))} label={t("deleteDigit")}><Delete className="mx-auto size-5" /></PinKey>
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</Button>
                {stage === "summary" && (
                  <Button onClick={() => setStage("pin")} className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("continue")}</Button>
                )}
              </div>
            </>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function PinKey({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) {
  return (
    <Button onClick={onClick} aria-label={label} variant="secondary" className="h-12 rounded-xl bg-muted text-lg font-semibold transition-colors active:bg-border">
      {children}
    </Button>
  );
}
