import React from 'react';
import {
  CreditCard,
  AlertTriangle,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Member, BillItem, PaymentContribution } from '../types';
import { calculateBillTotals, calculateMemberFinancials } from '../utils/calculator';
import { formatCurrency, getInitials, getMemberColor } from '../utils/formatters';

interface PaymentManagerProps {
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  onUpdatePayment: (memberId: string, amount: number) => void;
  onBulkSetPayments: (newPayments: PaymentContribution[]) => void;
  currency: string;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({
  members,
  items,
  payments,
  onUpdatePayment,
  onBulkSetPayments,
  currency,
}) => {
  const totals = calculateBillTotals(items, payments);
  const financials = calculateMemberFinancials(members, items, payments);
  const finMap = new Map(financials.map((f) => [f.member.id, f]));

  const getPaidAmount = (memberId: string): number => {
    const p = payments.find((x) => x.memberId === memberId);
    return p ? p.amountPaid : 0;
  };

  const remainingNeeded = Math.max(0, totals.totalBill - totals.totalPaid);

  // Quick action: Assign full bill to a single payer
  const handleSinglePayer = (memberId: string) => {
    const newPayments: PaymentContribution[] = members.map((m) => ({
      memberId: m.id,
      amountPaid: m.id === memberId ? totals.totalBill : 0,
    }));
    onBulkSetPayments(newPayments);
  };

  // Quick action: Fill remaining balance to a specific member
  const handleAssignRemaining = (memberId: string) => {
    const current = getPaidAmount(memberId);
    onUpdatePayment(memberId, Math.round((current + remainingNeeded) * 100) / 100);
  };

  // Quick action: Clear all payments
  const handleClearPayments = () => {
    if (confirm('Clear all upfront payments at the register?')) {
      onBulkSetPayments(members.map((m) => ({ memberId: m.id, amountPaid: 0 })));
    }
  };

  const percentage = totals.totalBill > 0
    ? Math.min(100, Math.round((totals.totalPaid / totals.totalBill) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Reconciliation Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Upfront Counter & Vendor Payments
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Record payments made at the register, toll booth, or hotel desk. Reconciles arbitrary split payments made via cards, UPI, or cash.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearPayments}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition"
              title="Reset all payment amounts"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Payments</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-600 font-mono">
              Total Paid: <strong className="text-slate-900 font-bold">{formatCurrency(totals.totalPaid, currency)}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{formatCurrency(totals.totalBill, currency)}</strong>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                totals.isBalanced
                  ? 'bg-emerald-100 text-emerald-800'
                  : totals.difference > 0
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {totals.isBalanced
                ? '✅ Perfectly Balanced'
                : totals.difference > 0
                ? `Excess +${formatCurrency(totals.difference, currency)}`
                : `Shortfall -${formatCurrency(Math.abs(totals.difference), currency)}`}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                totals.isBalanced
                  ? 'bg-emerald-500'
                  : totals.difference > 0
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Reconciliation Advice */}
          {!totals.isBalanced && (
            <div className="mt-3 flex items-start space-x-2 text-xs">
              {totals.difference < 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-amber-700">
                    Upfront payments are short by{' '}
                    <strong className="font-mono">{formatCurrency(Math.abs(totals.difference), currency)}</strong>. Enter who paid the rest or click &ldquo;+ Remainder&rdquo; below.
                  </span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="text-sky-700">
                    Total paid exceeds the itemized cart total by{' '}
                    <strong className="font-mono">{formatCurrency(totals.difference, currency)}</strong>. Please verify bill item amounts or payment receipts.
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Payments Input List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>Who swiped card or paid at the register?</span>
          <span className="text-xs font-normal text-slate-500">
            {members.length} members
          </span>
        </h3>

        {members.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No members added yet. Go to the Members tab to add people first.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m, idx) => {
              const paid = getPaidAmount(m.id);
              const fin = finMap.get(m.id);
              const color = m.color || getMemberColor(idx);

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    paid > 0
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  {/* Left: Member Info */}
                  <div className="flex items-center space-x-3 min-w-[200px]">
                    <div
                      className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                      <div className="text-xs text-slate-500">
                        Consumption share:{' '}
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatCurrency(fin?.totalOwed || 0, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Input and Quick Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {/* Quick increment buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onUpdatePayment(m.id, paid + 500)}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg transition font-mono"
                      >
                        +₹500
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePayment(m.id, paid + 1000)}
                        className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg transition font-mono"
                      >
                        +₹1000
                      </button>

                      {remainingNeeded > 0 && (
                        <button
                          type="button"
                          onClick={() => handleAssignRemaining(m.id)}
                          className="px-2 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 rounded-lg transition font-mono"
                          title={`Add remaining shortfall (${formatCurrency(remainingNeeded, currency)}) to this member`}
                        >
                          + Remainder
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSinglePayer(m.id)}
                        className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 rounded-lg transition hidden md:inline-block"
                        title="Set this person as the sole payer for the whole bill"
                      >
                        Paid All
                      </button>
                    </div>

                    {/* Numeric Input */}
                    <div className="relative w-32 sm:w-36">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        {currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paid === 0 ? '' : paid}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdatePayment(m.id, isNaN(val) ? 0 : val);
                        }}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-1.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
