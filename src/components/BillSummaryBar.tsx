import React from 'react';
import {
  Receipt,
  CreditCard,
  Scale,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
  Layers,
} from 'lucide-react';
import { BillItem, PaymentContribution, Member, Transaction } from '../types';
import { calculateBillTotals } from '../utils/calculator';
import { formatCurrency } from '../utils/formatters';

interface BillSummaryBarProps {
  items: BillItem[];
  payments: PaymentContribution[];
  members: Member[];
  transactions: Transaction[];
  activeTab: 'items' | 'members' | 'payments' | 'settlement';
  onTabChange: (tab: 'items' | 'members' | 'payments' | 'settlement') => void;
  currency: string;
}

export const BillSummaryBar: React.FC<BillSummaryBarProps> = ({
  items,
  payments,
  members,
  transactions,
  activeTab,
  onTabChange,
  currency,
}) => {
  const totals = calculateBillTotals(items, payments);
  const payerCount = payments.filter((p) => p.amountPaid > 0).length;

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Card 1: Total Bill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCurrency(totals.totalBill, currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'} on bill
            </div>
          </div>

          {/* Card 2: Total Paid Upfront */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Upfront Paid</span>
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCurrency(totals.totalPaid, currency)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              by {payerCount} {payerCount === 1 ? 'payer' : 'payers'} at checkout
            </div>
          </div>

          {/* Card 3: Reconciliation Status */}
          <div
            className={`rounded-xl p-3.5 sm:p-4 border transition ${
              totals.isBalanced
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : totals.difference > 0
                ? 'bg-sky-50/80 border-sky-200 text-sky-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1 opacity-80">
              <span className="text-xs font-semibold uppercase tracking-wider">Reconciliation</span>
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-lg sm:text-xl font-bold flex items-center space-x-1.5 font-mono">
              {totals.isBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800">Balanced</span>
                </>
              ) : totals.difference > 0 ? (
                <>
                  <Info className="w-5 h-5 text-sky-600 shrink-0" />
                  <span className="text-sky-800">+{formatCurrency(totals.difference, currency)}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-amber-800">
                    -{formatCurrency(Math.abs(totals.difference), currency)}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs opacity-75 mt-0.5">
              {totals.isBalanced
                ? 'Upfront paid matches items'
                : totals.difference > 0
                ? 'Excess paid at checkout'
                : 'Unsettled shortfall remains'}
            </div>
          </div>

          {/* Card 4: Settlements Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Settlement Flow</span>
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {transactions.length}{' '}
              <span className="text-sm font-medium text-slate-500 font-sans">
                {transactions.length === 1 ? 'transfer' : 'transfers'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Minimum cash-flow simplification
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onTabChange('items')}
            className={`flex items-center space-x-2 py-2.5 px-3 sm:px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'items'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Items & Ownership</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'items'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {items.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('members')}
            className={`flex items-center space-x-2 py-2.5 px-3 sm:px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Members & Passbooks</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'members'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {members.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('payments')}
            className={`flex items-center space-x-2 py-2.5 px-3 sm:px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>3. Counter Payments</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'payments'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {payerCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('settlement')}
            className={`flex items-center space-x-2 py-2.5 px-3 sm:px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'settlement'
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>4. Settlements & UPI</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'settlement'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {transactions.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
