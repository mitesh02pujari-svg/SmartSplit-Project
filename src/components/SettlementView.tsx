import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Check,
  Copy,
  QrCode,
  TrendingDown,
  TrendingUp,
  Share2,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, BillItem, PaymentContribution, Transaction } from '../types';
import {
  calculateSettlementTransactions,
  calculateMemberFinancials,
  getTransactionId,
} from '../utils/calculator';
import {
  formatCurrency,
  getInitials,
  generateUpiLink,
  copyToClipboard,
} from '../utils/formatters';

interface SettlementViewProps {
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  settledTransactionIds: string[];
  onToggleSettledTransaction: (txId: string) => void;
  onOpenExportModal: () => void;
  currency: string;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  members,
  items,
  payments,
  settledTransactionIds,
  onToggleSettledTransaction,
  onOpenExportModal,
  currency,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const transactions = calculateSettlementTransactions(
    members,
    items,
    payments,
    settledTransactionIds
  );
  const financials = calculateMemberFinancials(members, items, payments);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const settledCount = transactions.filter((tx) => tx.settled).length;
  const allSettled = transactions.length > 0 && settledCount === transactions.length;

  const handleToggle = (tx: Transaction) => {
    const txId = getTransactionId(tx.fromMemberId, tx.toMemberId);
    const wasSettled = !!tx.settled;
    onToggleSettledTransaction(txId);

    // If this toggles the final transaction to settled, celebrate!
    if (!wasSettled && settledCount + 1 === transactions.length) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleCopyUpi = async (upiId: string, key: string) => {
    const success = await copyToClipboard(upiId);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCopyReminder = async (tx: Transaction) => {
    const fromM = memberMap.get(tx.fromMemberId);
    const toM = memberMap.get(tx.toMemberId);
    const text = `Hey ${fromM?.name}! Please settle your share of ${formatCurrency(
      tx.amount,
      currency
    )} to ${toM?.name}${toM?.upiId ? ` via UPI (${toM.upiId})` : ''}. Thanks!`;

    await copyToClipboard(text);
    const key = `reminder-${tx.fromMemberId}->${tx.toMemberId}`;
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Group financials into Receivers (Creditors) and Payers (Debtors)
  const receivers = financials.filter((f) => f.netBalance > 0.01).sort((a, b) => b.netBalance - a.netBalance);
  const payers = financials.filter((f) => f.netBalance < -0.01).sort((a, b) => a.netBalance - b.netBalance);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold">Optimal Settlement Center</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Using the greedy minimum cash-flow debt simplification algorithm, we reduced all group debts down into just{' '}
              <strong className="text-emerald-400 font-semibold font-mono">{transactions.length} direct transfers</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenExportModal}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-md flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp / Export</span>
            </button>
          </div>
        </div>

        {/* All Settled Banner */}
        {allSettled && (
          <div className="mt-5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between text-emerald-300">
            <div className="flex items-center space-x-2">
              <PartyPopper className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">
                Amazing! All {transactions.length} transfers are marked as paid & settled!
              </span>
            </div>
            <button
              onClick={() => {
                confetti({ particleCount: 100, spread: 70 });
              }}
              className="text-xs font-bold px-3 py-1 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-400 transition"
            >
              Celebrate 🎉
            </button>
          </div>
        )}
      </div>

      {/* Main Settlement Transactions Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Who Pays Whom</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {settledCount}/{transactions.length} Settled
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off transfers as payments are made via UPI, bank transfer, or cash.
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-slate-800 text-base">No debts to settle</h4>
            <p className="text-xs text-slate-500 mt-1">
              Either no items have been added, or everyone&apos;s payments exactly match their consumption shares!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {transactions.map((tx, idx) => {
              const fromM = memberMap.get(tx.fromMemberId);
              const toM = memberMap.get(tx.toMemberId);
              if (!fromM || !toM) return null;

              const txId = getTransactionId(tx.fromMemberId, tx.toMemberId);
              const isSettled = !!tx.settled;

              const upiLink = toM.upiId
                ? generateUpiLink(toM.upiId, toM.name, tx.amount)
                : '';

              return (
                <div
                  key={txId}
                  className={`rounded-2xl border p-4 transition relative overflow-hidden ${
                    isSettled
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Transfer #{idx + 1}
                    </span>

                    {/* Settled Checkbox */}
                    <button
                      onClick={() => handleToggle(tx)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                        isSettled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSettled
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSettled && <Check className="w-3 h-3" />}
                      </div>
                      <span>{isSettled ? 'Settled' : 'Mark Paid'}</span>
                    </button>
                  </div>

                  {/* Transfer Visual: From -> To */}
                  <div className="flex items-center justify-between gap-2 my-2">
                    {/* Debtor */}
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: fromM.color }}
                      >
                        {getInitials(fromM.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-rose-600 block">
                          Payer
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {fromM.name}
                        </h4>
                      </div>
                    </div>

                    {/* Arrow & Amount */}
                    <div className="text-center px-2 shrink-0">
                      <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        pays ➡️
                      </div>
                    </div>

                    {/* Creditor */}
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 justify-end text-right">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                          Receiver
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {toM.name}
                        </h4>
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: toM.color }}
                      >
                        {getInitials(toM.name)}
                      </div>
                    </div>
                  </div>

                  {/* Actions: UPI & Reminder */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      {toM.upiId ? (
                        <>
                          <a
                            href={upiLink}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold transition"
                            title="Open in UPI payment app (GPay / PhonePe / Paytm)"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pay via UPI</span>
                          </a>

                          <button
                            onClick={() => handleCopyUpi(toM.upiId!, `upi-${txId}`)}
                            className="p-1 text-slate-400 hover:text-slate-600 font-mono text-[11px]"
                            title={`Copy UPI ID: ${toM.upiId}`}
                          >
                            {copiedKey === `upi-${txId}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No UPI registered
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyReminder(tx)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1"
                      title="Copy friendly WhatsApp payment reminder"
                    >
                      {copiedKey === `reminder-${txId}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Reminder</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Net Balances Overview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Net Group Balances
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Receivers Column */}
          <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/30">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>To Receive (Paid upfront at counter)</span>
            </div>

            {receivers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No members owed money</p>
            ) : (
              <div className="space-y-2">
                {receivers.map((r) => (
                  <div
                    key={r.member.id}
                    className="bg-white p-2.5 rounded-lg border border-emerald-200/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: r.member.color }}
                      >
                        {getInitials(r.member.name)}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">{r.member.name}</span>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="font-bold text-emerald-700 block">
                        +{formatCurrency(r.netBalance, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Paid {formatCurrency(r.amountPaid, currency)} • Share {formatCurrency(r.totalOwed, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payers Column */}
          <div className="border border-rose-100 rounded-xl p-4 bg-rose-50/30">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-3">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>To Pay (Underpaid at counter)</span>
            </div>

            {payers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No members owe money</p>
            ) : (
              <div className="space-y-2">
                {payers.map((p) => (
                  <div
                    key={p.member.id}
                    className="bg-white p-2.5 rounded-lg border border-rose-200/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: p.member.color }}
                      >
                        {getInitials(p.member.name)}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">{p.member.name}</span>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="font-bold text-rose-700 block">
                        {formatCurrency(p.netBalance, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Paid {formatCurrency(p.amountPaid, currency)} • Share {formatCurrency(p.totalOwed, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
