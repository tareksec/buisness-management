import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function BusinessPills({ className }: { className?: string }) {
  const { t, tx, businessId, setBusinessId, businesses } = useApp();
  return (
    <div className={cn("no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pt-1 pb-1", className)}>
      {businesses.map((biz) => {
        const active = biz.id === businessId;
        return (
          <button
            key={biz.id}
            onClick={() => setBusinessId(biz.id)}
            aria-pressed={active}
            className={cn(
              "relative shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground",
            )}
          >
            {tx(biz.name)}
            {biz.approvals.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-bad" aria-label={t("pendingDot")} />
            )}
          </button>
        );
      })}
    </div>
  );
}
