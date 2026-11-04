import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp, type TKey } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { BusinessPills } from "./BusinessPills";

export function ScreenHeader({ titleKey, action }: { titleKey: TKey; action?: ReactNode }) {
  const { t } = useApp();
  return (
    <>
      <header className="flex items-center gap-3">
        <Button asChild variant="outline" className="size-12 shrink-0 rounded-full"><Link to="/" aria-label={t("back")}>
          <ArrowLeft className="size-5" />
        </Link></Button>
        <h1 className="min-w-0 flex-1 text-2xl font-extrabold ">{t(titleKey)}</h1>
        {action}
      </header>
      <BusinessPills className="mt-5" />
    </>
  );
}
