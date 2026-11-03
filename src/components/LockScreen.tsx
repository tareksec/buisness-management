import { useState } from "react";
import { Delete, Fingerprint, Lock } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { DEMO_PIN } from "@/lib/approvals";
import { appInfo } from "@/data/mock";
import { cn } from "@/lib/utils";

export function LockScreen() {
  const { t, tx, num, unlock } = useApp();
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === DEMO_PIN) unlock();
        else {
          setShake(true);
          setTimeout(() => { setShake(false); setPin(""); }, 450);
        }
      }, 120);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-14 pb-8 sm:min-h-[860px]">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
        <Lock className="size-7" />
      </div>
      <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight">{tx(appInfo.name)}</h1>
      <p className="mt-6 text-base font-semibold">{t("enterPin")}</p>
      <div className={cn("mt-4 flex gap-4", shake && "animate-shake")} role="status" aria-label={shake ? t("wrongPin") : t("enterPin")}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("size-4 rounded-full border-2 transition-colors", shake ? "border-bad bg-bad" : i < pin.length ? "border-primary bg-primary" : "border-border")} />
        ))}
      </div>
      <p className={cn("mt-3 h-5 text-sm", shake ? "text-bad" : "text-muted-foreground")}>{shake ? t("wrongPin") : t("demoPin")}</p>

      <div className="mt-6 grid w-full max-w-[300px] grid-cols-3 gap-3">
        {keys.map((k) => (
          <PadKey key={k} onClick={() => press(k)} label={num(Number(k))} />
        ))}
        <span />
        <PadKey onClick={() => press("0")} label={num(0)} />
        <button onClick={() => setPin((p) => p.slice(0, -1))} aria-label={t("deletePin")} className="grid h-16 place-items-center rounded-2xl text-muted-foreground active:bg-muted">
          <Delete className="size-6" />
        </button>
      </div>

      <button onClick={unlock} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl border bg-card px-5 text-sm font-semibold shadow-soft">
        <Fingerprint className="size-5" /> {t("useFingerprint")}
      </button>
    </div>
  );
}

function PadKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-16 rounded-2xl border bg-card text-2xl font-semibold shadow-soft active:bg-muted">
      {label}
    </button>
  );
}
