import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp, type TKey } from "@/lib/app-state";
import { BusinessPills } from "./BusinessPills";

export function ScreenHeader({ titleKey }: { titleKey: TKey }) {
  const { t } = useApp();
  return (
    <>
      <header className="flex items-center gap-3">
        <Link to="/" aria-label={t("back")} className="grid size-10 shrink-0 place-items-center rounded-full border bg-card shadow-soft">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">{t(titleKey)}</h1>
      </header>
      <BusinessPills className="mt-5" />
    </>
  );
}
