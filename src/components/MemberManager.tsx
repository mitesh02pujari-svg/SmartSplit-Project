import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Trash2,
  Edit2,
  Check,
  X,
  QrCode,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';
import { Member, BillItem, PaymentContribution } from '../types';
import { calculateMemberFinancials } from '../utils/calculator';
import { getMemberColor, getInitials, formatCurrency } from '../utils/formatters';

interface MemberManagerProps {
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  onAddMember: (name: string, upiId?: string) => void;
  onAddBatchMembers: (names: string[]) => void;
  onUpdateMember: (id: string, name: string, upiId?: string) => void;
  onDeleteMember: (id: string) => void;
  onSelectMemberPassbook: (member: Member) => void;
  currency: string;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  items,
  payments,
  onAddMember,
  onAddBatchMembers,
  onUpdateMember,
  onDeleteMember,
  onSelectMemberPassbook,
  currency,
}) => {
  const [singleName, setSingleName] = useState('');
  const [singleUpi, setSingleUpi] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUpi, setEditUpi] = useState('');

  const financials = calculateMemberFinancials(members, items, payments);
  const finMap = new Map(financials.map((f) => [f.member.id, f]));

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;
    onAddMember(singleName.trim(), singleUpi.trim() || undefined);
    setSingleName('');
    setSingleUpi('');
  };

  const handleProcessBatch = () => {
    if (!batchInput.trim()) return;
    const names = batchInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (names.length > 0) {
      onAddBatchMembers(names);
      setBatchInput('');
      setShowBatchModal(false);
    }
  };

  const startEditing = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditUpi(m.upiId || '');
  };

  const saveEditing = () => {
    if (editingId && editName.trim()) {
      onUpdateMember(editingId, editName.trim(), editUpi.trim() || undefined);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Group Members ({members.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add everyone involved in this trip, dinner, grocery run, or flat. UPI IDs enable instant 1-tap settlement transfers.
            </p>
          </div>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Fast Batch Add (Paste List)</span>
          </button>
        </div>

        {/* Single Member Quick Add Form */}
        <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Member Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 hover:bg-white transition"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              UPI ID (Optional for 1-tap settlement)
            </label>
            <input
              type="text"
              placeholder="e.g. rahul@oksbi"
              value={singleUpi}
              onChange={(e) => setSingleUpi(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 hover:bg-white transition font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </form>
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No members in group yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Add friends, trip buddies, or flatmates to start allocating items and upfront payments.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
            >
              Batch Add Members
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {members.map((m, idx) => {
            const fin = finMap.get(m.id) || {
              totalOwed: 0,
              amountPaid: 0,
              netBalance: 0,
              itemsInvolvedCount: 0,
            };
            const isEditing = editingId === m.id;
            const color = m.color || getMemberColor(idx);

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition group relative overflow-hidden"
              >
                {/* Top strip colored accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                />

                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="w-full px-2.5 py-1 text-sm border border-emerald-500 rounded-lg focus:outline-none"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editUpi}
                      onChange={(e) => setEditUpi(e.target.value)}
                      placeholder="UPI ID (optional)"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono"
                    />
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={saveEditing}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Header: Avatar, Name, Edit/Delete */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className="w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {getInitials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {m.name}
                          </h4>
                          {m.upiId ? (
                            <span className="text-[11px] text-slate-500 flex items-center space-x-1 truncate font-mono">
                              <QrCode className="w-3 h-3 text-teal-600 shrink-0" />
                              <span className="truncate">{m.upiId}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No UPI set
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => startEditing(m)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Remove ${m.name}? Any items assigned strictly to them will be adjusted.`
                              )
                            ) {
                              onDeleteMember(m.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Items Share
                        </span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatCurrency(fin.totalOwed, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({fin.itemsInvolvedCount} items)
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Paid Upfront
                        </span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {formatCurrency(fin.amountPaid, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          at checkout
                        </span>
                      </div>
                    </div>

                    {/* Net Balance Pill & View Passbook button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 font-sans">
                          Net:
                        </span>
                        {fin.netBalance > 0.05 ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            +{formatCurrency(fin.netBalance, currency)} (Receives)
                          </span>
                        ) : fin.netBalance < -0.05 ? (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            {formatCurrency(fin.netBalance, currency)} (Owes)
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            Settled
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectMemberPassbook(m)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 hover:underline shrink-0"
                      >
                        <span>Passbook</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Add Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">
                  Fast Batch Add Members
                </h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Paste names separated by commas, tabs, or new lines. Perfect for copying from WhatsApp group info or Google Sheets:
              </p>

              <textarea
                rows={5}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Kabir, Rhea, Siddharth, Tara, Neil, Maya"
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500">
                💡 <strong>Tip:</strong> You can add 10-15 people in 1 second. Colors and IDs will be automatically assigned.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessBatch}
                disabled={!batchInput.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-xs transition"
              >
                Add All Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
