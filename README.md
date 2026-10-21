# 🛒 SmartSplit — Universal Group Expense & Bill Reconciliation Engine

> Production-ready, responsive single-page web application designed for **road trips**, **group vacations**, **shared flat groceries**, **restaurant dinners**, and **general shopping runs**.

SmartSplit solves two primary friction points in group activities:
1. **Mixed Item Ownership on a Master Bill**: Master bills often combine items shared across the entire group (`ALL`), items shared only by a sub-group of 2–4 people (`SUBSET`), and 100% personal items (`SOLO`).
2. **Uncoordinated Upfront Payments**: Multiple members make arbitrary payments via cash, cards, or UPI at the checkout register or vendor counter. SmartSplit reconciles them with mathematical precision down to the **minimum possible peer-to-peer transfers**.

---

## 📐 Core Data Models (TypeScript)

Strictly conforms to specification:

```typescript
export type SplitType = 'ALL' | 'SUBSET' | 'SOLO';

export interface Member {
  id: string;
  name: string;
  upiId?: string;
  color: string;
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  splitType: SplitType;
  assignedMemberIds: string[]; // empty if ALL, multiple if SUBSET, 1 if SOLO
  category?: string;
}

export interface PaymentContribution {
  memberId: string;
  amountPaid: number;
}

export interface Transaction {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  settled?: boolean;
}

export interface BillSession {
  id: string;
  title: string;
  createdAt: string;
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  settledTransactionIds?: string[];
  category?: 'Groceries' | 'Road Trip' | 'Vacation' | 'Restaurant' | 'Flatmates' | 'General';
  updatedAt?: string;
  currency?: string;
  notes?: string;
}
```

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. Mixed Ownership Allocation (`ALL`, `SUBSET`, `SOLO`)
- 👥 **Everyone (`ALL`)**: Shared equally by all $N$ members.
- 🎯 **Specific Subgroups (`SUBSET`)**: Shared equally among selected members (e.g. alcohol drinkers, non-vegetarian eaters, coffee lovers). Includes **Select All**, **Clear**, and **Invert** shortcuts.
- 👤 **Personal Solo Items (`SOLO`)**: 100% assigned to a single member.

### 2. Multi-Payer Register Reconciliation
- Real-time comparison between **Total Bill Items** and **Total Paid Upfront**.
- Automatic discrepancy alerts:
  - 🟢 **Balanced**: Upfront payments exactly match bill total.
  - 🟡 **Shortfall**: Displays remaining unpaid balance with a 1-click **"+ Remainder"** button to allocate.
  - 🔵 **Excess**: Alerts if upfront payments exceed the bill.

### 3. $O(N)$ Greedy Debt Simplification Algorithm
- Standard two-pointer greedy balance matching reduces all cyclic/multi-way debts down to the **minimum possible number of transactions** (at most $N - 1$).
- Saves groups from dozens of chaotic small transfers.
- Interactive **"Mark as Settled"** persistent checkbox checklist on each transfer card.
- Fires a **canvas-confetti** celebration when the group is 100% settled!

### 4. 1-Tap UPI Mobile Deep-Linking
- Payee cards include direct `upi://pay?pa=...&am=...` deep-links.
- On mobile devices, tapping **"Pay via UPI"** automatically launches Google Pay, PhonePe, or Paytm with payee and amount pre-filled!

### 5. Pre-loaded Scenario Templates
Switch instantly between 5 real-world group scenarios:
- 🚗 **Mountain Road Trip (6 People)**: Fuel tanks, FASTag tolls, roadside dhaba meals, driver energy drinks, and personal gear.
- 🏖️ **Goa Villa Getaway (10 People)**: Villa breakfast groceries, pool party drinks, fresh seafood BBQ, and solo surf rentals.
- 🍽️ **Restaurant Celebration Dinner (8 People)**: Shared appetizers, craft cocktails subset, veg/non-veg mains, and solo desserts.
- 🏠 **Shared Flat Monthly Expenses (4 Roommates)**: 300 Mbps fiber WiFi, communal kitchen staples, dietary splits, and personal whey protein.
- 🛒 **Hypermarket / DMart Mega Haul (10 People)**: Communal grocery staples, cleaning supplies, and personal toiletries.

### 6. Exporting & WhatsApp Sharing
- 📱 **WhatsApp Message Generator**: 1-click formatted copy with emojis, bold headers, item totals, and settlement steps ready to paste into chat.
- 🖼️ **Graphic PNG Settlement Receipt**: Generated via `html2canvas` with barcode, summary totals, and who-pays-whom table.
- 📋 **Personal Passbooks**: Click any member to view and copy their personal ledger.
- 💾 **JSON Backup & Restore**: Export or import sessions to JSON files.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4 (neutral slate/zinc palette, emerald/indigo accents, `font-mono` for all financial figures)
- **Icons**: Lucide React
- **Exporting**: `html2canvas` & clipboard WhatsApp markdown
- **Effects**: `canvas-confetti`
- **Persistence**: LocalStorage with multi-bill history

---

## 🚀 Running the Project

```bash
# Navigate to project
cd C:\Programming\Projects\SmartSplit

# Install dependencies (if not already done)
npm install

# Start Vite development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

To run a production build:
```bash
npm run build
npm run preview
```
