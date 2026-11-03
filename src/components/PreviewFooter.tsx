import { useApp } from "@/lib/app-state";

export function PreviewFooter() {
  const { t } = useApp();
  return <p className="py-5 text-center text-[11px] tracking-wide text-muted-foreground">{t("footer")}</p>;
}
