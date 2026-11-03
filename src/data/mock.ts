// All sample data for the preview. Swap with real data later.
export type Text = { en: string; bn: string };

export type ApprovalKind = "payout" | "voucher" | "transfer" | "kyc" | "bank" | "dispatch";
export type Approval = {
  id: string;
  kind: ApprovalKind;
  amount?: number;
  title: Text;
  detail: Text;
  dispatch?: { order: string; customer: Text; items: number };
};

export type Business = {
  id: string;
  name: Text;
  updatedMinutesAgo: number;
  investment: { activeProjects: number; raised: number; needed: number; profit: number };
  supply: { inStock: number; onTheWay: number; deliveredToday: number; lowStock: number };
  website: { online: boolean; productsLive: number; productsHidden: number; siteName: Text; domain: string };
  approvals: Approval[];
};

const by = (en: string, bn: string, h: number): Text => ({
  en: `Sent by ${en} · ${h} hour${h === 1 ? "" : "s"} ago`,
  bn: `পাঠিয়েছেন ${bn} · ${"০১২৩৪৫৬৭৮৯"[h] ?? h} ঘণ্টা আগে`,
});

export const businesses: Business[] = [
  {
    id: "b1",
    name: { en: "Business 1", bn: "ব্যবসা ১" },
    updatedMinutesAgo: 0,
    investment: { activeProjects: 4, raised: 1250000, needed: 1785000, profit: 182500 },
    supply: { inStock: 1240, onTheWay: 320, deliveredToday: 86, lowStock: 3 },
    website: { online: true, productsLive: 148, productsHidden: 12, siteName: { en: "Nakshi Home", bn: "নকশী হোম" }, domain: "nakshihome.com.bd" },
    approvals: [
      { id: "a1", kind: "voucher", amount: 240000, title: { en: "Voucher ৳ 2,40,000 — office rent, October", bn: "ভাউচার ৳ ২,৪০,০০০ — অফিস ভাড়া, অক্টোবর" }, detail: by("Rahim", "রহিম", 2) },
      { id: "a2", kind: "payout", amount: 372000, title: { en: "Investor payout ৳ 3,72,000 — 24 investors", bn: "বিনিয়োগকারী পেআউট ৳ ৩,৭২,০০০ — ২৪ জন" }, detail: by("Nusrat", "নুসরাত", 3) },
      { id: "a3", kind: "dispatch", amount: 312000, title: { en: "Release order ORD-5521 · ৳ 3,12,000", bn: "অর্ডার ছাড় ORD-5521 · ৳ ৩,১২,০০০" }, detail: by("Sohel", "সোহেল", 1), dispatch: { order: "ORD-5521", customer: { en: "Agora Retail", bn: "আগোরা রিটেইল" }, items: 120 } },
      { id: "a4", kind: "transfer", amount: 500000, title: { en: "Move ৳ 5,00,000 to Business 2", bn: "ব্যবসা ২-এ ৳ ৫,০০,০০০ পাঠানো" }, detail: by("Karim", "করিম", 5) },
      { id: "a5", kind: "kyc", title: { en: "New investor — Farhana Akter", bn: "নতুন বিনিয়োগকারী — ফারহানা আক্তার" }, detail: by("Nusrat", "নুসরাত", 6) },
      { id: "a6", kind: "voucher", amount: 18500, title: { en: "Voucher ৳ 18,500 — office supplies", bn: "ভাউচার ৳ ১৮,৫০০ — অফিস সামগ্রী" }, detail: by("Rahim", "রহিম", 7) },
      { id: "a7", kind: "dispatch", amount: 145000, title: { en: "Release order ORD-5524 · ৳ 1,45,000", bn: "অর্ডার ছাড় ORD-5524 · ৳ ১,৪৫,০০০" }, detail: by("Sohel", "সোহেল", 8), dispatch: { order: "ORD-5524", customer: { en: "Shwapno Gulshan", bn: "স্বপ্ন গুলশান" }, items: 64 } },
    ],
  },
  {
    id: "b2",
    name: { en: "Business 2", bn: "ব্যবসা ২" },
    updatedMinutesAgo: 0,
    investment: { activeProjects: 2, raised: 900000, needed: 1000000, profit: 96000 },
    supply: { inStock: 860, onTheWay: 140, deliveredToday: 42, lowStock: 0 },
    website: { online: true, productsLive: 64, productsHidden: 3, siteName: { en: "Modhu Bazar", bn: "মধু বাজার" }, domain: "modhubazar.com" },
    approvals: [],
  },
  {
    id: "b3",
    name: { en: "Business 3", bn: "ব্যবসা ৩" },
    updatedMinutesAgo: 0,
    investment: { activeProjects: 3, raised: 420000, needed: 1200000, profit: 31000 },
    supply: { inStock: 310, onTheWay: 75, deliveredToday: 9, lowStock: 5 },
    website: { online: false, productsLive: 0, productsHidden: 38, siteName: { en: "Tanti Weaves", bn: "তাঁতি উইভস" }, domain: "tantiweaves.com.bd" },
    approvals: [
      { id: "c1", kind: "transfer", amount: 120000, title: { en: "Loan instalment ৳ 1,20,000 — City Bank", bn: "ঋণের কিস্তি ৳ ১,২০,০০০ — সিটি ব্যাংক" }, detail: by("Karim", "করিম", 4) },
      { id: "c2", kind: "bank", title: { en: "Add bank account — BRAC Bank ••4410", bn: "ব্যাংক হিসাব যোগ — ব্র্যাক ব্যাংক ••৪৪১০" }, detail: by("Karim", "করিম", 9) },
      { id: "c3", kind: "dispatch", amount: 86000, title: { en: "Release order ORD-3107 · ৳ 86,000", bn: "অর্ডার ছাড় ORD-3107 · ৳ ৮৬,০০০" }, detail: by("Mitu", "মিতু", 2), dispatch: { order: "ORD-3107", customer: { en: "Aarong Uttara", bn: "আড়ং উত্তরা" }, items: 40 } },
    ],
  },
  {
    id: "b4",
    name: { en: "Business 4", bn: "ব্যবসা ৪" },
    updatedMinutesAgo: 0,
    investment: { activeProjects: 1, raised: 300000, needed: 300000, profit: 54000 },
    supply: { inStock: 520, onTheWay: 0, deliveredToday: 18, lowStock: 1 },
    website: { online: true, productsLive: 41, productsHidden: 0, siteName: { en: "Chamra Leather", bn: "চামড়া লেদার" }, domain: "chamra.shop" },
    approvals: [
      { id: "d1", kind: "voucher", amount: 4500, title: { en: "Voucher ৳ 4,500 — customer refund #2291", bn: "ভাউচার ৳ ৪,৫০০ — গ্রাহক ফেরত #২২৯১" }, detail: by("Mitu", "মিতু", 1) },
      { id: "d2", kind: "kyc", title: { en: "New investor — Tanvir Hasan", bn: "নতুন বিনিয়োগকারী — তানভীর হাসান" }, detail: by("Nusrat", "নুসরাত", 3) },
    ],
  },
];

export const fundedPercent = (b: Business) =>
  Math.round((b.investment.raised / b.investment.needed) * 100);

// ---------- Investment Vault ----------
export type ProjectStatus = "raising" | "running" | "settled";
export type Split = { investors: number; partner: number; company: number };
export type Project = {
  id: string; name: Text; code: string; status: ProjectStatus;
  goal: number; raised: number; profit: number; contract: Split;
};
export type PayoutBatch = {
  id: string; batch: string; investors: number; total: number; preparedBy: Text;
};

const projectNames: Text[] = [
  { en: "Project Alpha", bn: "প্রজেক্ট আলফা" },
  { en: "Project Beta", bn: "প্রজেক্ট বিটা" },
  { en: "Project Gamma", bn: "প্রজেক্ট গামা" },
];
const statuses: ProjectStatus[] = ["raising", "running", "settled"];
const staff: Text[] = [
  { en: "Nusrat (Accounts)", bn: "নুসরাত (হিসাব)" },
  { en: "Karim (Finance)", bn: "করিম (অর্থ)" },
];

const vaultSeed: Record<string, { goals: number[]; pct: number[]; profits: number[]; splits: Split[]; payouts: [number, number][] }> = {
  b1: { goals: [5000000, 3000000, 2000000], pct: [70, 100, 100], profits: [450000, 620000, 380000],
    splits: [{ investors: 60, partner: 5, company: 35 }, { investors: 55, partner: 5, company: 40 }, { investors: 65, partner: 3, company: 32 }],
    payouts: [[24, 372000], [11, 186500]] },
  b2: { goals: [2500000, 1800000, 1200000], pct: [88, 100, 100], profits: [210000, 305000, 154000],
    splits: [{ investors: 60, partner: 5, company: 35 }, { investors: 50, partner: 10, company: 40 }, { investors: 60, partner: 5, company: 35 }],
    payouts: [[9, 128000]] },
  b3: { goals: [4000000, 2200000, 900000], pct: [35, 100, 100], profits: [31000, 140000, 96000],
    splits: [{ investors: 55, partner: 5, company: 40 }, { investors: 60, partner: 5, company: 35 }, { investors: 70, partner: 0, company: 30 }],
    payouts: [] },
  b4: { goals: [1500000, 1000000, 800000], pct: [60, 100, 100], profits: [54000, 98000, 72000],
    splits: [{ investors: 60, partner: 5, company: 35 }, { investors: 60, partner: 5, company: 35 }, { investors: 58, partner: 2, company: 40 }],
    payouts: [[6, 41500], [14, 88200], [3, 19900]] },
};

export const vault: Record<string, { projects: Project[]; payouts: PayoutBatch[] }> = Object.fromEntries(
  businesses.map((b, bi) => {
    const s = vaultSeed[b.id]!;
    return [b.id, {
      projects: projectNames.map((name, i) => ({
        id: `${b.id}-p${i + 1}`, name, code: `G${bi + 1}-P0${i + 1}`, status: statuses[i]!,
        goal: s.goals[i]!, raised: Math.round((s.goals[i]! * s.pct[i]!) / 100), profit: s.profits[i]!, contract: s.splits[i]!,
      })),
      payouts: s.payouts.map(([investors, total], i) => ({
        id: `${b.id}-pb${i + 1}`, batch: `PB-${bi + 1}0${i + 1}`, investors, total, preparedBy: staff[i % 2]!,
      })),
    }];
  }),
);

// ---------- Supply Chain ----------
export type Stage = "stock" | "transit" | "delivered";
export type StockItem = { id: string; product: Text; qty: number; party: Text; date: Text; stage: Stage };
export type LowStock = { id: string; product: Text; left: number; min: number };
export type ImportShipment = { id: string; container: string; from: Text; eta: Text; status: Text };

const P = {
  tote: { en: "Jute tote bag", bn: "পাটের ব্যাগ" }, saree: { en: "Cotton saree", bn: "সুতি শাড়ি" },
  honey: { en: "Sundarban honey 500g", bn: "সুন্দরবনের মধু ৫০০গ্রা" }, cup: { en: "Ceramic tea set", bn: "সিরামিক চায়ের সেট" },
  oil: { en: "Mustard oil 1L", bn: "সরিষার তেল ১লি" }, wallet: { en: "Leather wallet", bn: "চামড়ার মানিব্যাগ" },
};
const today: Text = { en: "Today", bn: "আজ" };
const d = (en: string, bn: string): Text => ({ en, bn });

export const supply: Record<string, { items: StockItem[]; low: LowStock[]; imports: ImportShipment[] }> = {
  b1: {
    items: [
      { id: "s1", stage: "stock", product: P.tote, qty: 640, party: d("Supplier: Jute Mills Ltd", "সরবরাহকারী: জুট মিলস লিমিটেড"), date: d("Received 28 Oct", "পৌঁছেছে ২৮ অক্টোবর") },
      { id: "s2", stage: "stock", product: P.cup, qty: 420, party: d("Supplier: Shinepukur", "সরবরাহকারী: শাইনপুকুর"), date: d("Received 30 Oct", "পৌঁছেছে ৩০ অক্টোবর") },
      { id: "s3", stage: "stock", product: P.saree, qty: 180, party: d("Supplier: Tangail Weavers", "সরবরাহকারী: টাঙ্গাইল তাঁতি"), date: d("Received 1 Nov", "পৌঁছেছে ১ নভেম্বর") },
      { id: "s4", stage: "transit", product: P.cup, qty: 200, party: d("To: Agora Retail", "গন্তব্য: আগোরা রিটেইল"), date: d("Arrives 5 Nov", "পৌঁছাবে ৫ নভেম্বর") },
      { id: "s5", stage: "transit", product: P.tote, qty: 120, party: d("To: Shwapno Gulshan", "গন্তব্য: স্বপ্ন গুলশান"), date: d("Arrives 4 Nov", "পৌঁছাবে ৪ নভেম্বর") },
      { id: "s6", stage: "delivered", product: P.saree, qty: 46, party: d("Customer: Online orders", "গ্রাহক: অনলাইন অর্ডার"), date: today },
      { id: "s7", stage: "delivered", product: P.tote, qty: 40, party: d("Customer: Unimart", "গ্রাহক: ইউনিমার্ট"), date: today },
    ],
    low: [
      { id: "l1", product: P.saree, left: 12, min: 50 },
      { id: "l2", product: P.wallet, left: 6, min: 30 },
      { id: "l3", product: P.honey, left: 9, min: 40 },
    ],
    imports: [
      { id: "i1", container: "MSKU 482211-7", from: d("Guangzhou, China", "গুয়াংজু, চীন"), eta: d("Chattogram · 12 Nov", "চট্টগ্রাম · ১২ নভেম্বর"), status: d("At sea", "সমুদ্রে") },
      { id: "i2", container: "TGHU 903145-2", from: d("Chennai, India", "চেন্নাই, ভারত"), eta: d("Mongla · 19 Nov", "মোংলা · ১৯ নভেম্বর"), status: d("Loading", "লোড হচ্ছে") },
    ],
  },
  b2: {
    items: [
      { id: "s1", stage: "stock", product: P.honey, qty: 520, party: d("Supplier: Satkhira Bee Farm", "সরবরাহকারী: সাতক্ষীরা মৌ খামার"), date: d("Received 29 Oct", "পৌঁছেছে ২৯ অক্টোবর") },
      { id: "s2", stage: "stock", product: P.oil, qty: 340, party: d("Supplier: Bogura Oil Mill", "সরবরাহকারী: বগুড়া তেল কল"), date: d("Received 31 Oct", "পৌঁছেছে ৩১ অক্টোবর") },
      { id: "s3", stage: "transit", product: P.honey, qty: 140, party: d("To: Chaldal warehouse", "গন্তব্য: চালডাল গুদাম"), date: d("Arrives 4 Nov", "পৌঁছাবে ৪ নভেম্বর") },
      { id: "s4", stage: "delivered", product: P.oil, qty: 42, party: d("Customer: Online orders", "গ্রাহক: অনলাইন অর্ডার"), date: today },
    ],
    low: [],
    imports: [],
  },
  b3: {
    items: [
      { id: "s1", stage: "stock", product: P.saree, qty: 310, party: d("Supplier: Tangail Weavers", "সরবরাহকারী: টাঙ্গাইল তাঁতি"), date: d("Received 25 Oct", "পৌঁছেছে ২৫ অক্টোবর") },
      { id: "s2", stage: "transit", product: P.saree, qty: 75, party: d("To: Aarong Uttara", "গন্তব্য: আড়ং উত্তরা"), date: d("Arrives 6 Nov", "পৌঁছাবে ৬ নভেম্বর") },
      { id: "s3", stage: "delivered", product: P.saree, qty: 9, party: d("Customer: Walk-in shop", "গ্রাহক: দোকান"), date: today },
    ],
    low: [
      { id: "l1", product: { en: "Jamdani saree", bn: "জামদানি শাড়ি" }, left: 4, min: 20 },
      { id: "l2", product: { en: "Silk thread (red)", bn: "রেশম সুতা (লাল)" }, left: 3, min: 25 },
      { id: "l3", product: { en: "Silk thread (gold)", bn: "রেশম সুতা (সোনালি)" }, left: 2, min: 25 },
      { id: "l4", product: { en: "Gift boxes", bn: "উপহারের বাক্স" }, left: 15, min: 100 },
      { id: "l5", product: { en: "Lungi (check)", bn: "লুঙ্গি (চেক)" }, left: 8, min: 40 },
    ],
    imports: [
      { id: "i1", container: "CMAU 117420-9", from: d("Kolkata, India", "কলকাতা, ভারত"), eta: d("Benapole · 8 Nov", "বেনাপোল · ৮ নভেম্বর"), status: d("On road", "সড়কে") },
    ],
  },
  b4: {
    items: [
      { id: "s1", stage: "stock", product: P.wallet, qty: 520, party: d("Supplier: Hazaribagh Tannery", "সরবরাহকারী: হাজারীবাগ ট্যানারি"), date: d("Received 27 Oct", "পৌঁছেছে ২৭ অক্টোবর") },
      { id: "s2", stage: "delivered", product: P.wallet, qty: 18, party: d("Customer: Online orders", "গ্রাহক: অনলাইন অর্ডার"), date: today },
    ],
    low: [{ id: "l1", product: { en: "Leather belt", bn: "চামড়ার বেল্ট" }, left: 7, min: 30 }],
    imports: [],
  },
};

// ---------- Website products ----------
export type ProductImage = "tote" | "saree" | "honey" | "teacup" | "oil" | "wallet";
export type Product = { id: string; name: Text; price: number; live: boolean; image: ProductImage; deal?: number };

export const products: Record<string, Product[]> = {
  b1: [
    { id: "w1", name: P.tote, price: 650, live: true, image: "tote", deal: 520 },
    { id: "w2", name: P.cup, price: 2400, live: true, image: "teacup" },
    { id: "w3", name: P.saree, price: 3200, live: true, image: "saree" },
    { id: "w4", name: P.wallet, price: 1450, live: false, image: "wallet" },
    { id: "w5", name: P.honey, price: 850, live: true, image: "honey" },
    { id: "w6", name: P.oil, price: 380, live: false, image: "oil" },
  ],
  b2: [
    { id: "w1", name: P.honey, price: 850, live: true, image: "honey", deal: 750 },
    { id: "w2", name: P.oil, price: 380, live: true, image: "oil" },
    { id: "w3", name: P.tote, price: 650, live: false, image: "tote" },
  ],
  b3: [
    { id: "w1", name: P.saree, price: 3200, live: false, image: "saree" },
    { id: "w2", name: { en: "Jamdani saree", bn: "জামদানি শাড়ি" }, price: 12500, live: false, image: "saree" },
    { id: "w3", name: P.tote, price: 650, live: false, image: "tote" },
  ],
  b4: [
    { id: "w1", name: P.wallet, price: 1450, live: true, image: "wallet", deal: 1190 },
    { id: "w2", name: { en: "Leather card holder", bn: "চামড়ার কার্ড হোল্ডার" }, price: 690, live: true, image: "wallet" },
    { id: "w3", name: P.tote, price: 650, live: true, image: "tote" },
  ],
};
