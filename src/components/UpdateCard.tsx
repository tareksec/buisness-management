import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-state";
import { appInfo } from "@/data/mock";

export function UpdateCard() {
  const { t, showUpdate, dismissUpdate } = useApp();
  if (!showUpdate) return null;
  return (
    <div className="mt-4 flex items-center gap-1 rounded-2xl border bg-card shadow-soft">
      <button onClick={() => toast(t("updateToast"))} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 p-3 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Download className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{t("updateTitle", { v: appInfo.latestVersion })}</span>
          <span className="block text-xs text-muted-foreground">{t("updateTap")}</span>
        </span>
      </button>
      <button onClick={dismissUpdate} aria-label={t("dismiss")} className="grid size-11 shrink-0 place-items-center text-muted-foreground">
        <X className="size-5" />
      </button>
    </div>
  );
}
