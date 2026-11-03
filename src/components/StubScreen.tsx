import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp, type TKey } from "@/lib/app-state";
import { PreviewFooter } from "./PreviewFooter";

export function StubScreen({ titleKey }: { titleKey: TKey }) {
  const { t, tx, business } = useApp();
  return (
    <div className="flex min-h-full flex-col px-5 pt-6">
      <Link to="/" className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-soft">
        <ArrowLeft className="size-4" /> {t("back")}
      </Link>
      <p className="mt-6 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{tx(business.name)}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{t(titleKey)}</h1>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
        {t("comingSoon")}
      </div>
      <PreviewFooter />
    </div>
  );
}
