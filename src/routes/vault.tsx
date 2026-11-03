import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { ArrowLeft, CheckCircle2, Delete, Info, Minus, Plus, RotateCcw } from "lucide-react";
import { vault, type PayoutBatch, type ProjectStatus, type Split } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { adjustSplit, splitAmounts } from "@/lib/split";
import { BusinessPills } from "@/components/BusinessPills";
import { PreviewFooter } from "@/components/PreviewFooter";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Investment Vault · Business Command" },
      { name: "description", content: "Projects, profit split what-ifs and payouts waiting for approval." },
      { property: "og:title", content: "Investment Vault · Business Command" },
      { property: "og:description", content: "Projects, profit split what-ifs and payouts waiting for approval." },
    ],
  }),
  component: VaultScreen,
});

const statusTone: Record<ProjectStatus, Tone> = { raising: "warn", running: "good", settled: "neutral" };

function VaultScreen() {
  const { t, tx, num, money, businessId } = useApp();
  const data = vault[businessId]!;
  const [selected, setSelected] = useState(0);
  const project = data.projects[selected] ?? data.projects[0]!;
  const [split, setSplit] = useState<Split>(project.contract);
  const [tryProfit, setTryProfit] = useState("");
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [reviewing, setReviewing] = useState<PayoutBatch | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // New business: back to first project
  useEffect(() => {
    setSelected(0);
    scroller.current?.scrollTo({ left: 0 });
  }, [businessId]);
  // New project: restore its contract split
  useEffect(() => setSplit(project.contract), [project]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (el.firstElementChild as HTMLElement).offsetWidth);
    if (i !== selected && data.projects[i]) setSelected(i);
  };

  const parsed = Number(tryProfit.replace(/[^0-9]/g, ""));
  const profit = tryProfit.trim() && parsed > 0 ? parsed : project.profit;
  const amounts = splitAmounts(split, profit);
  const maxInv = 100 - split.partner;
  const isContract = split.investors === project.contract.investors;
  const step = (d: number) => setSplit(adjustSplit(project.contract, split.investors + d));

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label={t("back")} className="grid size-10 place-items-center rounded-full border bg-card shadow-soft">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("vaultTitle")}</h1>
      </header>

      <BusinessPills className="mt-5" />

      {/* Project cards */}
      <div ref={scroller} onScroll={onScroll} className="no-scrollbar -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {data.projects.map((p, i) => {
          const pct = Math.round((p.raised / p.goal) * 100);
          return (
            <button
              key={p.id}
              onClick={() => { setSelected(i); (scroller.current?.children[i] as HTMLElement)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }); }}
              className={cn(
                "w-[85%] shrink-0 snap-start rounded-2xl border bg-card p-4 text-left shadow-soft transition-colors",
                i === selected && "border-primary",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{tx(p.name)} <span className="text-muted-foreground">· {p.code}</span></p>
                <StatusBadge tone={statusTone[p.status]}>{t(p.status)}</StatusBadge>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label={t("goal")} value={money(p.goal)} />
                <Row label={t("raised")} value={`${money(p.raised)} · ${num(pct)}%`} />
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <Row label={t("needed")} value={money(Math.max(0, p.goal - p.raised))} />
              </dl>
              <div className="mt-4 rounded-xl bg-good-soft p-3">
                <p className="text-xs font-medium text-good">{t("currentProfit")}</p>
                <p className="text-2xl font-extrabold tracking-tight">{money(p.profit)}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
        {data.projects.map((p, i) => (
          <span key={p.id} className={cn("h-1.5 rounded-full transition-all", i === selected ? "w-5 bg-primary" : "w-1.5 bg-border")} />
        ))}
      </div>

      {/* Profit split */}
      <section className="mt-6 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-bold">{t("profitSplit")}</h2>
          <span className="text-xs text-muted-foreground">{tx(project.name)}</span>
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-xs font-medium text-warn">
          <Info className="mt-px size-4 shrink-0" /> {t("whatIf")}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => step(-1)} aria-label={t("decrease")} disabled={split.investors <= 0} className="grid size-9 shrink-0 place-items-center rounded-full border disabled:opacity-40">
            <Minus className="size-4" />
          </button>
          <input
            type="range" min={0} max={maxInv} step={1} value={split.investors}
            onChange={(e) => setSplit(adjustSplit(project.contract, Number(e.target.value)))}
            aria-label={t("investors")}
            className="h-2 flex-1 cursor-pointer accent-primary"
          />
          <button onClick={() => step(1)} aria-label={t("increase")} disabled={split.investors >= maxInv} className="grid size-9 shrink-0 place-items-center rounded-full border disabled:opacity-40">
            <Plus className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex h-3 overflow-hidden rounded-full" aria-hidden>
          <div className="bg-primary transition-all" style={{ width: `${split.investors}%` }} />
          <div className="bg-warn transition-all" style={{ width: `${split.partner}%` }} />
          <div className="bg-muted-foreground/40 transition-all" style={{ width: `${split.company}%` }} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Share label={t("investors")} pct={num(split.investors)} amt={money(amounts.investors)} dot="bg-primary" />
          <Share label={t("partner")} pct={num(split.partner)} amt={money(amounts.partner)} dot="bg-warn" />
          <Share label={t("company")} pct={num(split.company)} amt={money(amounts.company)} dot="bg-muted-foreground/40" />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {t("contractLabel", { a: project.contract.investors, b: project.contract.partner, c: project.contract.company })}
          </span>
          <button onClick={() => setSplit(project.contract)} disabled={isContract} className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline disabled:opacity-40">
            <RotateCcw className="size-3" /> {t("resetContract")}
          </button>
        </div>
      </section>

      {/* Quick estimate */}
      <section className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
        <h2 className="font-bold">{t("quickEstimate")}</h2>
        <label className="mt-3 block text-xs font-medium text-muted-foreground" htmlFor="try-profit">{t("tryProfit")}</label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:border-primary">
          <span className="font-semibold">৳</span>
          <input
            id="try-profit" inputMode="numeric" value={tryProfit}
            onChange={(e) => setTryProfit(e.target.value.replace(/[^0-9০-৯]/g, "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))))}
            placeholder={num(project.profit)}
            className="w-full bg-transparent py-3 text-lg font-semibold outline-none"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("tryHint")}</p>
      </section>

      {/* Payouts */}
      <section className="mt-6">
        <h2 className="font-bold">{t("payoutsWaiting")}</h2>
        <div className="mt-3 space-y-2">
          {data.payouts.length === 0 && <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("noPayouts")}</p>}
          {data.payouts.map((pb) => (
            <div key={pb.id} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{t("batch")} {pb.batch}</p>
                  <p className="text-xs text-muted-foreground">{t("investorCount", { n: pb.investors })} · {t("preparedBy", { name: tx(pb.preparedBy) })}</p>
                </div>
                <StatusBadge tone={approved[pb.id] ? "good" : "warn"}>{approved[pb.id] ? t("approved") : t("waiting")}</StatusBadge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xl font-extrabold tracking-tight">{money(pb.total)}</p>
                {!approved[pb.id] && (
                  <button onClick={() => setReviewing(pb)} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                    {t("reviewApprove")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <PreviewFooter />

      <ApproveSheet
        batch={reviewing}
        onClose={() => setReviewing(null)}
        onApproved={(id) => setApproved((a) => ({ ...a, [id]: true }))}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Share({ label, pct, amt, dot }: { label: string; pct: string; amt: string; dot: string }) {
  return (
    <div className="rounded-xl bg-muted p-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><span className={cn("size-2 rounded-full", dot)} />{label}</p>
      <p className="mt-0.5 text-lg font-bold">{pct}%</p>
      <p className="text-xs font-semibold">{amt}</p>
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
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-3xl bg-card px-5 pt-3 pb-6 outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          {b && stage === "done" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-good-soft text-good"><CheckCircle2 className="size-8" /></div>
              <Drawer.Title className="mt-4 text-xl font-bold">{t("payoutApproved")}</Drawer.Title>
              <Drawer.Description className="mt-1 text-sm text-muted-foreground">{t("payoutApprovedNote", { batch: b.batch })}</Drawer.Description>
              <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("done")}</button>
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
                <button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</button>
                {stage === "summary" && (
                  <button onClick={() => setStage("pin")} className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("continue")}</button>
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
    <button onClick={onClick} aria-label={label} className="h-12 rounded-xl bg-muted text-lg font-semibold transition-colors active:bg-border">
      {children}
    </button>
  );
}
