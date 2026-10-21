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
    setIsExportingImage(true);
    try {
      // Wait for fonts and layouts to settle
      await document.fonts.ready;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // High-res output
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure the cloned node is fully visible and rendered
          const el = clonedDoc.getElementById('receipt-capture-area');
          if (el) {
            el.style.display = 'block';
            el.style.width = '380px';
            el.style.margin = '0 auto';
          }
        },
      });

      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${billTitle.replace(/\s+/g, '_')}_Settlement.png`;
      link.href = imageUri;
      link.click();

      setImageDownloaded(true);
      setTimeout(() => setImageDownloaded(false), 3000);
    } catch (err) {
      console.error('Receipt generation failed:', err);
      alert('Could not generate PNG image. Please copy the WhatsApp summary instead.');
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
              id="receipt-capture-area"
              ref={receiptRef}
              style={{
                backgroundColor: '#ffffff',
                color: '#09090b',
                border: '1px solid #e4e4e7',
                borderRadius: '16px',
                padding: '24px',
                width: '380px',
                margin: '0 auto',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxSizing: 'border-box',
              }}
            >
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '2px dashed #d4d4d8' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  SmartSplit Settlement
                </div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#09090b',
                    letterSpacing: '-0.02em',
                    margin: '4px 0 0 0',
                    wordBreak: 'break-word',
                  }}
                >
                  {billTitle}
                </h2>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '4px 0 0 0' }}>
                  Universal Group Expense Report
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: '#a1a1aa',
                    marginTop: '4px',
                    fontFamily: 'monospace',
                  }}
                >
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
              <div style={{ padding: '12px 0', borderBottom: '2px dashed #d4d4d8', fontSize: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    color: '#09090b',
                    fontSize: '14px',
                    marginBottom: '6px',
                  }}
                >
                  <span>Total Expenses:</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatCurrency(totals.totalBill, currency)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#52525b',
                    marginBottom: '4px',
                  }}
                >
                  <span>Total Paid Upfront:</span>
                  <span style={{ fontWeight: 600, color: '#18181b', fontFamily: 'monospace' }}>
                    {formatCurrency(totals.totalPaid, currency)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#71717a',
                    fontSize: '11px',
                  }}
                >
                  <span>Group Size:</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {members.length} members ({items.length} items)
                  </span>
                </div>
              </div>

              {/* Who Pays Whom / Settlements */}
              <div style={{ padding: '12px 0', borderBottom: '2px dashed #d4d4d8' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowRightLeft style={{ width: '14px', height: '14px', color: '#7c3aed' }} />
                  <span>Settlement Transfers ({transactions.length})</span>
                </div>

                {transactions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#059669', fontWeight: 600, fontStyle: 'italic', margin: 0 }}>
                    All settled! No payments required.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {transactions.map((tx, i) => {
                      const fromM = memberMap.get(tx.fromMemberId)?.name || 'Someone';
                      const toM = memberMap.get(tx.toMemberId)?.name || 'Someone';
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#f4f4f5',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ fontWeight: 600, color: '#18181b' }}>
                            {fromM} ➡️ {toM}
                          </span>
                          <span style={{ fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Members Net Balances */}
              <div style={{ padding: '12px 0', borderBottom: '2px dashed #d4d4d8' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                    marginBottom: '8px',
                  }}
                >
                  Member Balances
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {financials.map((f) => (
                    <div
                      key={f.member.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '2px 0',
                      }}
                    >
                      <span
                        style={{
                          color: '#3f3f46',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: '8px',
                        }}
                      >
                        {f.member.name}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: 'monospace',
                          color:
                            f.netBalance > 0.01
                              ? '#047857'
                              : f.netBalance < -0.01
                              ? '#b91c1c'
                              : '#71717a',
                        }}
                      >
                        {f.netBalance > 0.01 ? '+' : ''}
                        {formatCurrency(f.netBalance, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barcode Footer */}
              <div style={{ paddingTop: '16px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '4px',
                    color: '#27272a',
                  }}
                >
                  <Barcode style={{ width: '180px', height: '32px' }} />
                </div>
                <p
                  style={{
                    fontSize: '10px',
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    margin: 0,
                  }}
                >
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
