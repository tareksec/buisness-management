import { useState } from "react";
import { Info, Lock, ShieldCheck, Smartphone, User } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { appInfo } from "@/data/mock";
import { Sheet } from "@/components/Sheets";
import { cn } from "@/lib/utils";

export function AvatarMenu() {
  const { t, tx, lang, setLang, lock } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={t("profile")} className="grid size-11 shrink-0 place-items-center rounded-full border bg-card shadow-soft">
        <User className="size-5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-bold">{t("profile")}</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border p-3">
            <p className="text-xs font-semibold text-muted-foreground">{t("language")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={t("language")}>
              {(["en", "bn"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                  className={cn("min-h-11 rounded-xl border text-sm font-semibold", lang === l ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
                  {l === "en" ? "English" : "বাংলা"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border p-3">
            <Smartphone className="size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{t("thisDevice")}</p>
              <p className="text-sm font-semibold">{t("deviceApproved", { name: tx(appInfo.deviceName) })}</p>
            </div>
            <ShieldCheck className="size-5 shrink-0 text-good" />
          </div>
          <button onClick={() => { setOpen(false); lock(); }} className="flex min-h-12 w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm font-semibold">
            <Lock className="size-5 shrink-0" /> {t("lockNow")}
          </button>
          <div className="flex items-center gap-3 px-3 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0" /> {t("appVersion")}: v{appInfo.version}
          </div>
        </div>
      </Sheet>
    </>
  );
}
