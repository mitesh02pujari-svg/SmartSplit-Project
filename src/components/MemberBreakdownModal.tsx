import React, { useState } from 'react';
import {
  Copy,
  Check,
} from 'lucide-react';
import { Member, BillItem, PaymentContribution } from '../types';
import { calculateItemShares, calculateMemberFinancials } from '../utils/calculator';
import { formatCurrency, getInitials, copyToClipboard } from '../utils/formatters';

interface MemberBreakdownModalProps {
  member: Member | null;
  allMembers: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  onClose: () => void;
  currency: string;
}

export const MemberBreakdownModal: React.FC<MemberBreakdownModalProps> = ({
  member,
  allMembers,
  items,
  payments,
  onClose,
  currency,
}) => {
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const financials = calculateMemberFinancials(allMembers, items, payments);
  const fin = financials.find((f) => f.member.id === member.id) || {
    totalOwed: 0,
    amountPaid: 0,
    netBalance: 0,
    itemsInvolvedCount: 0,
  };

  // Find all items this member participated in
  interface InvolvedItem {
    item: BillItem;
    memberShare: number;
    splitInfo: string;
  }

  const involvedItems: InvolvedItem[] = [];

  items.forEach((item) => {
    const shares = calculateItemShares(item, allMembers);
    const memberShare = shares.get(member.id);

    if (memberShare !== undefined && memberShare > 0) {
      let splitInfo = '';
      if (item.splitType === 'ALL') {
        splitInfo = `Shared equally by all ${allMembers.length}`;
      } else if (item.splitType === 'SUBSET') {
        splitInfo = `Shared by ${item.assignedMemberIds.length} members`;
      } else {
        splitInfo = 'Personal solo item (100%)';
      }

      involvedItems.push({
        item,
        memberShare,
        splitInfo,
      });
    }
  });

  const handleCopyPersonalSummary = async () => {
    const lines: string[] = [];
    lines.push(`🧾 *SmartSplit Passbook for ${member.name}*`);
    lines.push(`💰 Total Items Share: ${formatCurrency(fin.totalOwed, currency)}`);
    lines.push(`💳 Paid Upfront: ${formatCurrency(fin.amountPaid, currency)}`);
    if (fin.netBalance > 0.01) {
      lines.push(`🟢 Net Balance: Gets back ${formatCurrency(fin.netBalance, currency)}`);
    } else if (fin.netBalance < -0.01) {
      lines.push(`🔴 Net Balance: Owes ${formatCurrency(Math.abs(fin.netBalance), currency)}`);
    } else {
      lines.push(`⚪ Net Balance: All Settled!`);
    }
    lines.push('');
    lines.push(`*Items Breakdown (${involvedItems.length} items):*`);
    involvedItems.forEach((inv, idx) => {
      lines.push(
        `${idx + 1}. ${inv.item.name}: ${formatCurrency(
          inv.memberShare,
          currency
        )} (Total: ${formatCurrency(inv.item.amount, currency)})`
      );
    });

    const success = await copyToClipboard(lines.join('\n'));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {getInitials(member.name)}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{member.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {member.upiId ? `UPI: ${member.upiId}` : 'No UPI registered'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Financial KPI Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-3 gap-2 text-center shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
              Items Share
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {formatCurrency(fin.totalOwed, currency)}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
              Paid Upfront
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {formatCurrency(fin.amountPaid, currency)}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border font-bold font-mono ${
              fin.netBalance > 0.01
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : fin.netBalance < -0.01
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-bold opacity-80 block font-sans">
              Net Balance
            </span>
            <span className="text-sm sm:text-base">
              {fin.netBalance > 0.01 ? '+' : ''}
              {formatCurrency(fin.netBalance, currency)}
            </span>
          </div>
        </div>

        {/* Itemized Breakdown List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Items Consumed ({involvedItems.length})
          </h4>

          {involvedItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              This member is not assigned to any items in this bill.
            </div>
          ) : (
            involvedItems.map((inv) => (
              <div
                key={inv.item.id}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {inv.item.name}
                    </span>
                    {inv.item.splitType === 'ALL' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700">
                        ALL
                      </span>
                    )}
                    {inv.item.splitType === 'SUBSET' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700">
                        SUBSET
                      </span>
                    )}
                    {inv.item.splitType === 'SOLO' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-50 text-amber-800">
                        SOLO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {inv.splitInfo} • Total item: <span className="font-mono">{formatCurrency(inv.item.amount, currency)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {formatCurrency(inv.memberShare, currency)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">their share</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            onClick={handleCopyPersonalSummary}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl transition shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied Passbook!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary for {member.name}</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
