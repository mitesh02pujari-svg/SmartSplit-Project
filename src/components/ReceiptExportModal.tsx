import React, { useState, useRef } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  MessageSquare,
  Barcode,
  ArrowRightLeft,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Member, BillItem, PaymentContribution } from '../types';
import { generateWhatsAppSummary } from '../utils/whatsappExporter';
import {
  calculateBillTotals,
  calculateMemberFinancials,
  calculateSettlementTransactions,
} from '../utils/calculator';
import { formatCurrency, copyToClipboard } from '../utils/formatters';

interface ReceiptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  billTitle: string;
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  currency: string;
}

export const ReceiptExportModal: React.FC<ReceiptExportModalProps> = ({
  isOpen,
  onClose,
  billTitle,
  members,
  items,
  payments,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'image'>('whatsapp');
  const [includeItemized, setIncludeItemized] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [imageDownloaded, setImageDownloaded] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const whatsappText = generateWhatsAppSummary(
    billTitle,
    members,
    items,
    payments,
    currency,
    includeItemized
  );

  const totals = calculateBillTotals(items, payments);
  const financials = calculateMemberFinancials(members, items, payments);
  const transactions = calculateSettlementTransactions(members, items, payments);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const handleCopyWhatsapp = async () => {
    const success = await copyToClipboard(whatsappText);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      setIsExportingImage(true);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${billTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_settlement_receipt.png`;
      link.click();

      setImageDownloaded(true);
      setTimeout(() => setImageDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to export receipt image:', err);
      alert('Could not export image. Please try copying text instead.');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg">Export & WhatsApp Sharing</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Export Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>📱 WhatsApp Message</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'image'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>🖼️ Graphic Settlement Card (PNG)</span>
          </button>
        </div>

        {/* Tab 1: WhatsApp Text Export */}
        {activeTab === 'whatsapp' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span>Formatted with WhatsApp emojis, bolding, and settlement steps:</span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeItemized}
                  onChange={(e) => setIncludeItemized(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-medium">Include itemized list</span>
              </label>
            </div>

            <textarea
              readOnly
              rows={12}
              value={whatsappText}
              className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none select-all text-slate-800 leading-relaxed"
            />
          </div>
        )}

        {/* Tab 2: Graphic Receipt Image */}
        {activeTab === 'image' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100 flex justify-center">
            {/* The printable receipt card element */}
            <div
              ref={receiptRef}
              className="bg-white p-6 rounded-2xl shadow-md border border-slate-300 max-w-md w-full text-slate-900 font-sans"
              style={{ width: '420px' }}
            >
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-1">
                  SmartSplit Settlement
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {billTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal Group Expense Report
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Totals Summary */}
              <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Expenses:</span>
                  <span className="font-mono">{formatCurrency(totals.totalBill, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Paid Upfront:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {formatCurrency(totals.totalPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Group Size:</span>
                  <span className="font-mono">{members.length} members ({items.length} items)</span>
                </div>
              </div>

              {/* Who Pays Whom / Settlements */}
              <div className="py-3 border-b-2 border-dashed border-slate-300">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                  <span>Settlement Transfers ({transactions.length})</span>
                </div>

                {transactions.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium italic">
                    All settled! No payments required.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {transactions.map((tx, i) => {
                      const fromM = memberMap.get(tx.fromMemberId)?.name || 'Someone';
                      const toM = memberMap.get(tx.toMemberId)?.name || 'Someone';
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs"
                        >
                          <span className="font-semibold text-slate-800">
                            {fromM} ➡️ {toM}
                          </span>
                          <span className="font-black text-slate-900 font-mono">
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Members Net Balances */}
              <div className="py-3 border-b-2 border-dashed border-slate-300">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Member Balances
                </div>
                <div className="space-y-1 text-xs">
                  {financials.map((f) => (
                    <div key={f.member.id} className="flex justify-between py-0.5">
                      <span className="text-slate-700 truncate mr-2">{f.member.name}</span>
                      <span
                        className={`font-bold shrink-0 font-mono ${
                          f.netBalance > 0.01
                            ? 'text-emerald-700'
                            : f.netBalance < -0.01
                            ? 'text-rose-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {f.netBalance > 0.01 ? '+' : ''}
                        {formatCurrency(f.netBalance, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="pt-4 text-center">
                <div className="flex justify-center mb-1 text-slate-800 opacity-80">
                  <Barcode className="w-48 h-8" />
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">
                  SMARTSPLIT-APP-VERIFIED
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {activeTab === 'whatsapp'
              ? 'Ready to paste into WhatsApp group chat.'
              : 'Crisp image receipt to share in chat.'}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'whatsapp' ? (
              <button
                onClick={handleCopyWhatsapp}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied WhatsApp Message!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy WhatsApp Text</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownloadImage}
                disabled={isExportingImage}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 transition shadow-md disabled:opacity-50"
              >
                {imageDownloaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Downloaded PNG!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isExportingImage ? 'Generating...' : 'Download Image (PNG)'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
