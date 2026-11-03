import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Globe, ImagePlus, Search, Settings2, Tag } from "lucide-react";
import { products, type Product, type ProductImage } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PreviewFooter } from "@/components/PreviewFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { Sheet, SheetDescription, SheetTitle } from "@/components/Sheets";
import { cn } from "@/lib/utils";
import tote from "@/assets/products/tote.webp";
import saree from "@/assets/products/saree.webp";
import honey from "@/assets/products/honey.webp";
import teacup from "@/assets/products/teacup.webp";
import oil from "@/assets/products/oil.webp";
import wallet from "@/assets/products/wallet.webp";

const images: Record<ProductImage, string> = { tote, saree, honey, teacup, oil, wallet };

export const Route = createFileRoute("/website")({
  head: () => ({
    meta: [
      { title: "Website Control · Business Command" },
      { name: "description", content: "Open or close your shop website, show or hide products and change prices." },
      { property: "og:title", content: "Website Control · Business Command" },
      { property: "og:description", content: "Open or close your shop website, show or hide products and change prices." },
    ],
  }),
  component: WebsiteScreen,
});

type Edits = Record<string, { live?: boolean; price?: number; photo?: string }>;

function WebsiteScreen() {
  const { t, tx, business: b, businessId, setSiteOnline } = useApp();
  const [query, setQuery] = useState("");
  const [edits, setEdits] = useState<Edits>({});
  const [manage, setManage] = useState(false);
  const [photoFor, setPhotoFor] = useState<Product | null>(null);

  const patch = (id: string, p: Edits[string]) => setEdits((e) => ({ ...e, [`${businessId}:${id}`]: { ...e[`${businessId}:${id}`], ...p } }));
  const view = (p: Product) => {
    const e = edits[`${businessId}:${p.id}`] ?? {};
    return { ...p, live: e.live ?? p.live, price: e.price ?? p.price, photo: e.photo ?? images[p.image] };
  };
  const q = query.trim().toLowerCase();
  const list = (products[businessId] ?? []).map(view).filter((p) => !q || p.name.en.toLowerCase().includes(q) || p.name.bn.includes(q));

  const toggle = (p: ReturnType<typeof view>) => {
    const next = !p.live;
    patch(p.id, { live: next });
    toast(t(next ? "nowLive" : "nowHidden", { name: tx(p.name) }), {
      duration: 5000,
      action: { label: t("undo"), onClick: () => patch(p.id, { live: !next }) },
    });
  };

  return (
    <div className="px-5 pt-6">
      <ScreenHeader titleKey="websiteTitle" />

      <section className="mt-5 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted"><Globe className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{tx(b.website.siteName)}</p>
          <p className="truncate text-xs text-muted-foreground">{b.website.domain}</p>
          <StatusBadge tone={b.website.online ? "good" : "bad"} className="mt-1.5">{b.website.online ? t("online") : t("offline")}</StatusBadge>
        </div>
        <button onClick={() => setManage(true)} className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold">
          <Settings2 className="size-4" /> {t("manage")}
        </button>
      </section>

      <label className="mt-4 flex items-center gap-2 rounded-xl border bg-card px-3 focus-within:border-primary">
        <Search className="size-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} aria-label={t("search")} className="w-full bg-transparent py-3 text-sm outline-none" />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {list.map((p) => <ProductCard key={`${businessId}:${p.id}`} p={p} onToggle={() => toggle(p)} onPhoto={() => setPhotoFor(p)} onPrice={(price) => patch(p.id, { price })} />)}
      </div>
      {list.length === 0 && <p className="mt-4 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("noResults")}</p>}

      <PreviewFooter />

      <ManageSheet open={manage} online={b.website.online} onClose={() => setManage(false)} onChange={(v) => { setSiteOnline(businessId, v); setManage(false); toast.success(v ? t("online") : t("offline")); }} />
      <PhotoSheet product={photoFor} onClose={() => setPhotoFor(null)} onUse={(url) => { if (photoFor) patch(photoFor.id, { photo: url }); setPhotoFor(null); }} />
    </div>
  );
}

function ProductCard({ p, onToggle, onPhoto, onPrice }: { p: Product & { photo: string }; onToggle: () => void; onPhoto: () => void; onPrice: (n: number) => void }) {
  const { t, tx, money, num } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) input.current?.focus(); }, [editing]);
  const save = () => {
    const n = Number(draft);
    if (n > 0) { onPrice(n); toast.success(t("priceSaved")); }
    setEditing(false);
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-soft transition-opacity", !p.live && "opacity-75")}>
      <button onClick={onPhoto} className="relative block aspect-square w-full bg-muted" aria-label={t("photoTitle")}>
        <img src={p.photo} alt={tx(p.name)} width={360} height={360} loading="lazy" className="size-full object-cover" />
        <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-card/90"><Camera className="size-3.5" /></span>
      </button>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.5em] text-sm leading-tight font-semibold">{tx(p.name)}</p>
        {editing ? (
          <div className="mt-2">
            <div className="flex items-center gap-1 rounded-lg border px-2 focus-within:border-primary">
              <span className="text-sm font-semibold">৳</span>
              <input ref={input} inputMode="numeric" pattern="[0-9]*" value={draft} onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && save()} aria-label={t("editPrice")} className="w-full bg-transparent py-1.5 text-sm font-semibold outline-none" />
            </div>
            <div className="mt-2 flex gap-1.5">
              <button onClick={() => setEditing(false)} className="flex-1 rounded-lg border py-1.5 text-xs font-semibold">{t("cancel")}</button>
              <button onClick={save} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground">{t("save")}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setDraft(String(p.price)); setEditing(true); }} aria-label={t("editPrice")} className="mt-1 text-lg font-extrabold tracking-tight underline decoration-border decoration-dashed underline-offset-4">
            {money(p.price)}
          </button>
        )}
        {p.deal && (
          <p className="mt-1.5 flex gap-1 rounded-lg bg-warn-soft p-1.5 text-[10.5px] leading-snug font-medium text-warn">
            <Tag className="mt-px size-3 shrink-0" /> {t("dealLive", { p: `৳ ${num(p.deal)}` })}
          </p>
        )}
        <button onClick={onToggle} role="switch" aria-checked={p.live} className="mt-2.5 flex w-full items-center justify-between">
          <span className={cn("text-xs font-semibold", p.live ? "text-good" : "text-muted-foreground")}>{p.live ? t("live") : t("hidden")}</span>
          <span className={cn("relative h-6 w-10 rounded-full transition-colors", p.live ? "bg-good" : "bg-border")}>
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-card shadow transition-all", p.live ? "left-[18px]" : "left-0.5")} />
          </span>
        </button>
      </div>
    </div>
  );
}

function ManageSheet({ open, online, onClose, onChange }: { open: boolean; online: boolean; onClose: () => void; onChange: (v: boolean) => void }) {
  const { t } = useApp();
  const [pending, setPending] = useState<boolean | null>(null);
  useEffect(() => { if (open) setPending(null); }, [open]);
  const shown = pending ?? online;
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle className="text-lg font-bold">{t("siteSheetTitle")}</SheetTitle>
      <SheetDescription className="sr-only">{t("siteSwitch")}</SheetDescription>
      <button role="switch" aria-checked={shown} onClick={() => setPending(!shown)} className="mt-4 flex w-full items-center justify-between rounded-xl bg-muted p-4">
        <span className="text-sm font-semibold">{t("siteSwitch")}</span>
        <span className={cn("relative h-7 w-12 rounded-full transition-colors", shown ? "bg-good" : "bg-border")}>
          <span className={cn("absolute top-0.5 size-6 rounded-full bg-card shadow transition-all", shown ? "left-[22px]" : "left-0.5")} />
        </span>
      </button>
      {pending !== null && pending !== online && (
        <p className={cn("mt-3 rounded-xl p-3 text-sm font-medium", pending ? "bg-good-soft text-good" : "bg-bad-soft text-bad")}>
          {pending ? t("confirmOnline") : t("confirmOffline")}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</button>
        {pending !== null && pending !== online && (
          <button onClick={() => onChange(pending)} className={cn("flex-[2] rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground", pending ? "bg-good" : "bg-bad")}>
            {pending ? t("yesOnline") : t("yesOffline")}
          </button>
        )}
      </div>
    </Sheet>
  );
}

function PhotoSheet({ product, onClose, onUse }: { product: Product | null; onClose: () => void; onUse: (url: string) => void }) {
  const { t, tx } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => { if (product) setPreview(null); }, [product]);
  return (
    <Sheet open={product !== null} onClose={onClose}>
      <SheetTitle className="text-lg font-bold">{t("photoTitle")}</SheetTitle>
      <SheetDescription className="text-sm text-muted-foreground">{product ? tx(product.name) : ""}</SheetDescription>
      {preview && <img src={preview} alt="" className="mt-4 aspect-square w-full rounded-2xl object-cover" />}
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-semibold">
        <ImagePlus className="size-5" /> {t("chooseGallery")}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
      </label>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t("photoNote")}</p>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</button>
        {preview && <button onClick={() => onUse(preview)} className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("usePhoto")}</button>}
      </div>
    </Sheet>
  );
}
