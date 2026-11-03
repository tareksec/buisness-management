import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { CheckCircle2, Delete } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { DEMO_PIN } from "@/lib/approvals";
import { cn } from "@/lib/utils";

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] max-w-[430px] overflow-y-auto rounded-t-3xl bg-card px-5 pt-3 pb-6 outline-none">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
export const SheetTitle = Drawer.Title;
export const SheetDescription = Drawer.Description;

export function SummaryRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-4 space-y-2 rounded-xl bg-muted p-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export type ApproveTarget = { key: string; title: string; subtitle?: string; rows: [string, string][]; pin: boolean };

/** Summary → (PIN) → success. Cancel always sits beside the main action. */
export function ApproveSheet({ target, onClose, onApproved }: { target: ApproveTarget | null; onClose: () => void; onApproved: (key: string) => void }) {
  const { t, num } = useApp();
  const [stage, setStage] = useState<"summary" | "pin" | "done">("summary");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [last, setLast] = useState<ApproveTarget | null>(null);
  if (target && target !== last) { setLast(target); setStage("summary"); setPin(""); setError(false); }
  const x = target ?? last;

  const finish = () => { if (x) { onApproved(x.key); setStage("done"); } };
  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setError(false);
    setPin(next);
    if (next.length === 4)
      setTimeout(() => (next === DEMO_PIN ? finish() : (setError(true), setPin(""))), 150);
  };

  return (
    <Sheet open={target !== null} onClose={onClose}>
      {x && stage === "done" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-good-soft text-good"><CheckCircle2 className="size-8" /></div>
          <SheetTitle className="mt-4 text-xl font-bold">{t("approvedDone")}</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-muted-foreground">{t("approvedDoneNote")}</SheetDescription>
          <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("done")}</button>
        </div>
      ) : x ? (
        <>
          <SheetTitle className="text-lg font-bold">{t("confirmApprove")}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{x.title}</SheetDescription>
          <SummaryRows rows={x.rows} />
          {stage === "pin" && (
            <div className="mt-5">
              <p className="text-center text-sm font-semibold">{t("enterPin")}</p>
              <div className="mt-3 flex justify-center gap-3" aria-live="polite">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn("size-3.5 rounded-full border-2 border-primary transition-colors", i < pin.length && "bg-primary", error && "border-bad")} />
                ))}
              </div>
              <p className={cn("mt-2 text-center text-xs", error ? "font-semibold text-bad" : "text-muted-foreground")}>{error ? t("wrongPin") : t("demoPin")}</p>
              <div className="mx-auto mt-3 grid max-w-[260px] grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <PinKey key={d} label={d} onClick={() => press(d)}>{num(Number(d))}</PinKey>
                ))}
                <span />
                <PinKey label="0" onClick={() => press("0")}>{num(0)}</PinKey>
                <PinKey label={t("deleteDigit")} onClick={() => setPin((p) => p.slice(0, -1))}><Delete className="mx-auto size-5" /></PinKey>
              </div>
            </div>
          )}
          <div className="mt-5 flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</button>
            {stage === "summary" && (
              <button onClick={() => (x.pin ? setStage("pin") : finish())} className="flex-[2] rounded-2xl bg-good py-3.5 text-sm font-semibold text-primary-foreground">
                {x.pin ? t("continue") : t("approve")}
              </button>
            )}
          </div>
        </>
      ) : null}
    </Sheet>
  );
}

function PinKey({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="h-12 rounded-xl bg-muted text-lg font-semibold transition-colors active:bg-border">
      {children}
    </button>
  );
}

export type RejectTarget = { key: string; title: string };

export function RejectSheet({ target, onClose, onRejected }: { target: RejectTarget | null; onClose: () => void; onRejected: (key: string, reason: string) => void }) {
  const { t } = useApp();
  const [reason, setReason] = useState("");
  const [last, setLast] = useState<RejectTarget | null>(null);
  if (target && target !== last) { setLast(target); setReason(""); }
  const x = target ?? last;
  const ok = reason.trim().length > 0;
  return (
    <Sheet open={target !== null} onClose={onClose}>
      {x && (
        <form onSubmit={(e) => { e.preventDefault(); if (ok) onRejected(x.key, reason.trim()); }}>
          <SheetTitle className="text-lg font-bold">{t("rejectTitle")}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{x.title}</SheetDescription>
          <label htmlFor="reject-reason" className="mt-4 block text-xs font-medium text-muted-foreground">{t("reasonLabel")}</label>
          <input
            id="reject-reason" autoFocus required maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={t("reasonPh")}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-3 outline-none focus:border-primary"
          />
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</button>
            <button type="submit" disabled={!ok} className="flex-[2] rounded-2xl bg-bad py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">{t("confirmReject")}</button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
