// Shared data shapes. Screens depend only on these, so the data source can be swapped for a real API.

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
export type ProjectStatus = "raising" | "running" | "settled";
export type Split = { investors: number; partner: number; company: number };
export type Project = {
  id: string; name: Text; code: string; status: ProjectStatus;
  goal: number; raised: number; profit: number; contract: Split;
};
export type PayoutBatch = {
  id: string; batch: string; investors: number; total: number; preparedBy: Text;
};
export type Stage = "stock" | "transit" | "delivered";
export type StockItem = { id: string; product: Text; qty: number; party: Text; date: Text; stage: Stage };
export type LowStock = { id: string; product: Text; left: number; min: number };
export type ImportShipment = { id: string; container: string; from: Text; eta: Text; status: Text };
export type ProductImage = "tote" | "saree" | "honey" | "teacup" | "oil" | "wallet";
export type Product = { id: string; name: Text; price: number; live: boolean; image: ProductImage; deal?: number };

export type Currency = "BDT" | "USD";
export type DashboardMetric = "moneyIn" | "profitPaid" | "payoutsDue" | "sales";
export type DashboardStats = {
  currency: Currency;
  moneyIn: number;
  profitPaid: number;
  payoutsDue: number;
  sales: number;
  previousMonth: Record<DashboardMetric, number>;
  /** Profit paid for the last 12 months, oldest first. */
  profitByMonth: number[];
};
export type AttentionItem = {
  id: string;
  businessId: string;
  text: Text;
  to: "/approvals" | "/supply-chain" | "/website" | "/vault";
  tone: "bad" | "warn";
};
export type AppInfo = { name: Text; version: string; latestVersion: string; deviceName: Text };
