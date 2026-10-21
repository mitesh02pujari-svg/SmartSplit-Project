import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  User,
  UserCheck,
} from 'lucide-react';
import { BillItem, Member } from '../types';
import { parseReceiptText } from '../utils/billParser';
import { formatCurrency } from '../utils/formatters';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: BillItem[]) => void;
  members: Member[];
  currency: string;
}

const SAMPLE_BULK_TEXT = `Tata Sampann Chana Dal 1kg 160
Amul Pure Ghee 1L 620
Aashirvaad Atta 10kg 450
Fortune Sunflower Oil 5L 880
Dairy Milk Silk Chocolate 180 (Priya)
Gillette Mach3 Blades 450 (Rohan)
Energy Drinks 6-Pack 650 (Amit, Vikram, Rahul)
Surf Excel Matic 890`;

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  members,
  currency,
}) => {
  const [textInput, setTextInput] = useState('');

  if (!isOpen) return null;

  const { items: parsedItems, unparsedLines } = parseReceiptText(textInput, members);
  const totalParsedAmount = parsedItems.reduce((s, it) => s + it.amount, 0);

  const handleAdd = () => {
    if (parsedItems.length > 0) {
      onAddItems(parsedItems);
      setTextInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Fast Receipt & Bill Parser</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Paste items line-by-line (e.g. &ldquo;Item Name Price (Names)&rdquo;):</span>
            <button
              onClick={() => setTextInput(SAMPLE_BULK_TEXT)}
              className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
            >
              Insert Sample Text
            </button>
          </div>

          <textarea
            rows={6}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Fortune Sunflower Oil 5L 880\nCadbury Silk 180 (Priya)\nCold Drinks 450 (Amit, Rohan)\nAashirvaad Atta 450`}
            className="w-full p-3.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 hover:bg-white transition"
          />

          {/* Live Parsing Preview */}
          {textInput.trim() && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Parsed {parsedItems.length} {parsedItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Total: {formatCurrency(totalParsedAmount, currency)}
                </span>
              </div>

              {parsedItems.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-semibold text-slate-800 truncate">
                          {item.name}
                        </span>
                        {item.splitType === 'ALL' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ALL
                          </span>
                        )}
                        {item.splitType === 'SUBSET' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            SUBSET ({item.assignedMemberIds.length})
                          </span>
                        )}
                        {item.splitType === 'SOLO' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                            SOLO
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {unparsedLines.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-800 space-y-1">
                  <div className="flex items-center space-x-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Could not find price in {unparsedLines.length} lines:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] opacity-80 max-h-20 overflow-y-auto">
                    {unparsedLines.map((l, i) => (
                      <li key={i} className="truncate">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={parsedItems.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-xs transition"
          >
            Add {parsedItems.length} {parsedItems.length === 1 ? 'Item' : 'Items'} to Bill (
            {formatCurrency(totalParsedAmount, currency)})
          </button>
        </div>
      </div>
    </div>
  );
};
