import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Globe, ImagePlus, Search, Settings2, Tag } from "lucide-react";
import { products, type Product, type ProductImage } from "@/data/mock";
import { useApp } from "@/lib/app-state";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Sheet, SheetDescription, SheetTitle } from "@/components/Sheets";
import { DetailsSheet, SeeDetails, StateSentence } from "@/components/IllustratedScreen";
import { Button } from "@/components/ui/button";
import scene from "@/assets/scenes/shop-front.png";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [details, setDetails] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [edits, setEdits] = useState<Edits>({});
  const [undo, setUndo] = useState<{ businessId: string; id: string; live: boolean } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(timer);
  }, [undo]);
  const [manage, setManage] = useState(false);
  const [photoFor, setPhotoFor] = useState<Product | null>(null);

  const patch = (id: string, p: Edits[string]) => setEdits((e) => ({ ...e, [`${businessId}:${id}`]: { ...e[`${businessId}:${id}`], ...p } }));
  const view = (p: Product) => {
    const e = edits[`${businessId}:${p.id}`] ?? {};
    return { ...p, live: e.live ?? p.live, price: e.price ?? p.price, photo: e.photo ?? images[p.image] };
  };
  const q = query.trim().toLowerCase();
  const allProducts = (products[businessId] ?? []).map(view);
  const shownCount = allProducts.filter(p => p.live).length;
  const hiddenCount = allProducts.length - shownCount;
  const list = allProducts.filter((p) => !q || p.name.en.toLowerCase().includes(q) || p.name.bn.includes(q));

  const toggle = (p: ReturnType<typeof view>) => {
    const next = !p.live;
    patch(p.id, { live: next });
    setUndo({ businessId, id: p.id, live: p.live });
    toast(t(next ? "nowLive" : "nowHidden", { name: tx(p.name) }), {
      duration: 5000,
      action: { label: t("undo"), onClick: () => { setEdits(e => ({ ...e, [`${businessId}:${p.id}`]: { ...e[`${businessId}:${p.id}`], live: p.live } })); setUndo(null); } },
    });
  };

  return (
    <div className="illustrated-screen px-5 pt-6 pb-8">
      <ScreenHeader titleKey="websiteTitle" action={<Button variant="ghost" size="icon" className="size-12 shrink-0" aria-label={t("search")} title={t("search")} onClick={()=>setSearchOpen(true)}><Search className="size-5" /></Button>} />
      <div className="relative mt-4 aspect-square">
        <img src={scene} alt="" width={1024} height={1024} className="size-full object-contain" />
        <Button variant="outline" className={cn("shop-sign absolute text-sm font-extrabold shadow-soft",b.website.online?"bg-good-soft text-good":"bg-bad-soft text-bad")} aria-label={t("manage")} onClick={()=>setManage(true)}>{t(b.website.online?"shopOpen":"shopClosed")}</Button>
      </div>
      <StateSentence tone={b.website.online?"good":"bad"}>{t(b.website.online?"shopSentenceOpen":"shopSentenceClosed",{n:shownCount,m:hiddenCount})}</StateSentence>
      <section className="border-b pb-5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="font-bold">{tx(b.website.siteName)}</h2><p className="break-all text-sm text-muted-foreground">{b.website.domain}</p></div><Button variant="outline" onClick={()=>setManage(true)}><Settings2 className="size-4" />{t("manage")}</Button></div></section>
      <section className="mt-6"><h2 className="text-xl font-bold">{t("productsTitle")}</h2><div className="mt-4 space-y-5">{allProducts.filter(p=>p.live).map(p=><ProductCard key={`${businessId}:${p.id}`} p={p} onToggle={()=>toggle(p)} onPhoto={()=>setPhotoFor(p)} onPrice={price=>patch(p.id,{price})} />)}</div><SeeDetails onClick={()=>{setHiddenOnly(false);setDetails(true)}} /></section>
      <section className="mt-6"><Button variant="outline" className="h-auto min-h-20 w-full justify-between text-lg font-bold" onClick={()=>{setHiddenOnly(true);setDetails(true)}}><span>{t("hiddenProductsCount",{n:hiddenCount})}</span><Tag /></Button></section>
      <DetailsSheet open={details || searchOpen} onClose={()=>{setDetails(false);setSearchOpen(false)}} title={hiddenOnly && !searchOpen?t("hiddenProductsCount",{n:hiddenCount}):t("productsTitle")}>
      <label className="mt-4 flex items-center gap-2 rounded-xl border bg-card px-3 focus-within:border-primary">
        <Search className="size-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} aria-label={t("search")} className="w-full bg-transparent py-3 text-sm outline-none" />
      </label>

      {undo && undo.businessId === businessId && <Button variant="outline" className="mt-3 min-h-12 w-full" onClick={() => { patch(undo.id, { live: undo.live }); setUndo(null); }}>{t("undo")}</Button>}

      <div className="mt-4 space-y-5">
        {list.filter(p=>!hiddenOnly || searchOpen || !p.live).map((p) => <ProductCard key={`${businessId}:${p.id}`} p={p} onToggle={() => toggle(p)} onPhoto={() => {setDetails(false);setSearchOpen(false);setPhotoFor(p)}} onPrice={(price) => patch(p.id, { price })} />)}
      </div>
      {list.length === 0 && <p className="mt-4 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">{t("noResults")}</p>}

      </DetailsSheet>

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
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-soft transition-opacity", !p.live && "border-muted-foreground")}>
      <Button onClick={onPhoto} variant="ghost" className="relative block h-auto aspect-square w-full bg-muted p-0" aria-label={t("photoTitle")}>
        <img src={p.photo} alt={tx(p.name)} width={360} height={360} loading="lazy" className="size-full object-cover" />
        <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-card/90"><Camera className="size-3.5" /></span>
      </Button>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.5em] text-lg leading-snug font-bold">{tx(p.name)}</p>
        {editing ? (
          <div className="mt-2">
            <div className="flex items-center gap-1 rounded-lg border px-2 focus-within:border-primary">
              <span className="text-sm font-semibold">৳</span>
              <input ref={input} inputMode="numeric" pattern="[0-9]*" value={draft} onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && save()} aria-label={t("editPrice")} className="w-full bg-transparent py-1.5 text-sm font-semibold outline-none" />
            </div>
            <div className="mt-2 flex gap-1.5">
              <Button onClick={() => setEditing(false)} className="flex-1 rounded-lg border py-1.5 text-xs font-semibold">{t("cancel")}</Button>
              <Button onClick={save} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground">{t("save")}</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => { setDraft(String(p.price)); setEditing(true); }} aria-label={t("editPrice")} variant="ghost" className="mt-1 h-auto min-h-12 min-w-12 p-0 rounded-lg bg-gold-light px-4 text-left text-[32px] font-extrabold text-foreground">
            {money(p.price)}
          </Button>
        )}
        {p.deal && (
          <p className="mt-1.5 flex gap-1 rounded-lg bg-warn-soft p-1.5 text-sm leading-snug font-medium text-warn">
            <Tag className="mt-px size-3 shrink-0" /> {t("dealLive", { p: `৳ ${num(p.deal)}` })}
          </p>
        )}
        <Button onClick={onToggle} role="switch" aria-checked={p.live} variant="ghost" className="mt-1 h-auto flex min-h-12 w-full items-center justify-between">
          <span className={cn("text-xs font-semibold", p.live ? "text-good" : "text-muted-foreground")}>{p.live ? t("onShow") : t("hidden")}</span>
          <span className={cn("relative h-9 w-12 rounded-md border-2 transition-colors", p.live ? "bg-good" : "bg-border")}>
            <span className={cn("absolute left-1 right-1 h-4 rounded-sm bg-card shadow transition-all", p.live ? "top-0.5" : "top-[15px]")} />
          </span>
        </Button>
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
      <Button role="switch" aria-checked={shown} onClick={() => setPending(!shown)} variant="ghost" className="mt-4 h-auto flex w-full items-center justify-between rounded-xl bg-muted p-4">
        <span className="text-sm font-semibold">{t("siteSwitch")}</span>
        <span className={cn("relative h-7 w-12 rounded-full transition-colors", shown ? "bg-good" : "bg-border")}>
          <span className={cn("absolute top-0.5 size-6 rounded-full bg-card shadow transition-all", shown ? "left-[22px]" : "left-0.5")} />
        </span>
      </Button>
      {pending !== null && pending !== online && (
        <p className={cn("mt-3 rounded-xl p-3 text-sm font-medium", pending ? "bg-good-soft text-good" : "bg-bad-soft text-bad")}>
          {pending ? t("confirmOnline") : t("confirmOffline")}
        </p>
      )}
      <div className="mt-5 flex gap-2">
        <Button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</Button>
        {pending !== null && pending !== online && (
          <Button onClick={() => onChange(pending)} className={cn("flex-[2] rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground", pending ? "bg-good" : "bg-bad")}>
            {pending ? t("yesOnline") : t("yesOffline")}
          </Button>
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
        <Button onClick={onClose} className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold">{t("cancel")}</Button>
        {preview && <Button onClick={() => onUse(preview)} className="flex-[2] rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground">{t("usePhoto")}</Button>}
      </div>
    </Sheet>
  );
}
