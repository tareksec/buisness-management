import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/en.json";
import bn from "@/i18n/bn.json";
import { businesses, type Business, type Text } from "@/data/mock";

export type Lang = "en" | "bn";
export type TKey = keyof typeof en;
const dicts: Record<Lang, Record<TKey, string>> = { en, bn };

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toLangDigits = (s: string, lang: Lang) =>
  lang === "bn" ? s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d) : s;

/** Lakh grouping: 1250000 -> 12,50,000 */
export const groupLakh = (n: number) => {
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (neg ? "-" : "") + (rest ? `${rest},${last3}` : last3);
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey, vars?: Record<string, number | string>) => string;
  num: (n: number) => string;
  money: (n: number) => string;
  tx: (x: Text) => string;
  business: Business;
  businesses: Business[];
  resolveApproval: (id: string) => void;
  setSiteOnline: (businessId: string, online: boolean) => void;
  businessId: string;
  setBusinessId: (id: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [businessId, setBusinessId] = useState(businesses[0]!.id);
  const [resolved, setResolved] = useState<Set<string>>(() => new Set());
  const [siteOverride, setSiteOverride] = useState<Record<string, boolean>>({});
  const value = useMemo<Ctx>(() => {
    const merged = businesses.map((b) => ({
      ...b,
      approvals: b.approvals.filter((a) => !resolved.has(`${b.id}:${a.id}`)),
      website: { ...b.website, online: siteOverride[b.id] ?? b.website.online },
    }));
    const num = (n: number) => toLangDigits(groupLakh(n), lang);
    return {
      lang,
      setLang,
      num,
      money: (n) => `৳ ${num(n)}`,
      tx: (x) => x[lang],
      t: (k, vars) => {
        let s = dicts[lang][k] ?? k;
        if (vars)
          for (const [vk, vv] of Object.entries(vars))
            s = s.replace(`{${vk}}`, typeof vv === "number" ? num(vv) : vv);
        return s;
      },
      business: merged.find((b) => b.id === businessId) ?? merged[0]!,
      businesses: merged,
      resolveApproval: (id) => setResolved((r) => new Set(r).add(id)),
      setSiteOnline: (bid, online) => setSiteOverride((o) => ({ ...o, [bid]: online })),
      businessId,
      setBusinessId,
    };
  }, [lang, businessId, resolved, siteOverride]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}
