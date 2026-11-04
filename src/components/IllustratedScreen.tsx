import { useState, type ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle, SheetDescription } from "@/components/Sheets";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import { useApp, type TKey } from "@/lib/app-state";

export function DetailsSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { t } = useApp();
  return <Sheet open={open} onClose={onClose}>
    <div className="flex items-center justify-between gap-3"><SheetTitle className="text-xl font-bold">{title}</SheetTitle><Button variant="ghost" className="size-12 shrink-0" aria-label={t("close")} onClick={onClose}><X /></Button></div>
    <SheetDescription className="sr-only">{title}</SheetDescription>
    <div className="illustrated-details mt-4">{children}</div>
  </Sheet>;
}

export function StateSentence({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { t } = useApp();
  return <div className="my-6 space-y-2"><StatusBadge tone={tone}>{t(tone === "good" ? "noPending" : "attention")}</StatusBadge><p className="text-base leading-relaxed font-medium">{children}</p></div>;
}

export function SeeDetails({ onClick }: { onClick: () => void }) {
  const { t } = useApp();
  return <Button variant="outline" className="mt-5 min-h-12 w-full whitespace-normal rounded-xl" onClick={onClick}>{t("seeDetails")}<ChevronRight /></Button>;
}

export function IllustratedScreen({ titleKey, image, bubble, tone, sentence, blocks, children, header }: { titleKey: TKey; image: string; bubble: string; tone: Tone; sentence: string; blocks: ReactNode; children: ReactNode; header?: ReactNode }) {
  const { t } = useApp();
  const [details, setDetails] = useState(false);
  return <div className="illustrated-screen px-5 pt-6 pb-8">
    {header ?? <ScreenHeader titleKey={titleKey} />}
    <div className="relative mt-4">
      <Button variant="ghost" className="scene-button relative h-auto w-full p-0 hover:bg-transparent" onClick={() => setDetails(true)} aria-label={t("seeDetails")}>
        <img src={image} alt="" className="aspect-square w-full object-contain" />
        <span className="absolute right-2 bottom-6 rounded-full border bg-card px-4 py-2 text-sm font-bold shadow-soft">{bubble}</span>
      </Button>
    </div>
    <StateSentence tone={tone}>{sentence}</StateSentence>
    <div className="space-y-7">{blocks}</div>
    <SeeDetails onClick={() => setDetails(true)} />
    <DetailsSheet open={details} onClose={() => setDetails(false)} title={t(titleKey)}>{children}</DetailsSheet>
  </div>;
}

export function CoinStack({ share }: { share: number }) {
  const levels = Math.max(1, Math.round(share / 8));
  return <svg viewBox="0 0 90 110" className="h-28 w-full" aria-hidden>
    {Array.from({ length: levels }, (_, i) => <g key={i} transform={`translate(0, ${94 - i * 9})`}>
      <path d="M15 0v8c0 17 60 17 60 0V0" className="fill-gold-deep stroke-gold-edge" />
      <ellipse cx="45" cy="0" rx="30" ry="12" className="fill-gold stroke-gold-edge" />
      <ellipse cx="45" cy="0" rx="23" ry="8" className="fill-gold-light stroke-gold-edge" />
    </g>)}
  </svg>;
}

export function FundedJar({ percent }: { percent: number }) {
  const level = Math.max(0, Math.min(100, percent));
  const top = 108 - level * .67;
  return <svg viewBox="0 0 100 135" className="h-full w-full" aria-hidden>
    <path d="M22 30Q50 14 78 30L84 103Q85 125 50 126Q15 125 16 103Z" className="fill-jar-glass stroke-jar-edge" strokeWidth="2" />
    <path d={`M20 ${top}Q50 ${top + 18} 80 ${top}L80 104Q80 121 50 121Q20 121 20 104Z`} className="fill-gold-deep" />
    <ellipse cx="50" cy={top} rx="30" ry="11" className="fill-gold stroke-gold-edge" />
    <path d="M23 38L21 95" className="stroke-card" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    <ellipse cx="50" cy="28" rx="29" ry="11" className="fill-gold-light stroke-gold-edge" strokeWidth="2" />
    <ellipse cx="50" cy="28" rx="22" ry="6" className="fill-jar-glass stroke-jar-edge" />
  </svg>;
}