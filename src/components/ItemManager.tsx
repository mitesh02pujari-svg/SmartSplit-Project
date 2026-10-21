import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Layers,
  Users,
  UserCheck,
  User,
  Search,
  Sparkles,
  Check,
} from 'lucide-react';
import { BillItem, Member, SplitType } from '../types';
import { ItemCard } from './ItemCard';
import { BulkAddModal } from './BulkAddModal';
import { formatCurrency, getInitials, getMemberColor } from '../utils/formatters';

interface ItemManagerProps {
  items: BillItem[];
  members: Member[];
  onAddItem: (item: Omit<BillItem, 'id'>) => void;
  onAddMultipleItems: (items: BillItem[]) => void;
  onUpdateItem: (item: BillItem) => void;
  onDeleteItem: (id: string) => void;
  currency: string;
}

const CATEGORIES = [
  'Food & Dining',
  'Transport & Fuel',
  'Groceries',
  'Bar & Drinks',
  'Stay & Lodging',
  'Activities & Gear',
  'Cleaning',
  'Utilities',
  'Personal Care',
  'Other',
];

export const ItemManager: React.FC<ItemManagerProps> = ({
  items,
  members,
  onAddItem,
  onAddMultipleItems,
  onUpdateItem,
  onDeleteItem,
  currency,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('ALL');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [category, setCategory] = useState('Food & Dining');
  const [editingItem, setEditingItem] = useState<BillItem | null>(null);

  // Bulk Modal
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSplitType, setFilterSplitType] = useState<'ALL_TYPES' | SplitType>('ALL_TYPES');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price-desc' | 'price-asc' | 'name'>('recent');

  const nameInputRef = useRef<HTMLInputElement>(null);

  // When editingItem changes, populate form
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setAmount(editingItem.amount.toString());
      setSplitType(editingItem.splitType);
      setAssignedMemberIds(editingItem.assignedMemberIds);
      setCategory(editingItem.category || 'Food & Dining');
      nameInputRef.current?.focus();
    }
  }, [editingItem]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setSplitType('ALL');
    setAssignedMemberIds([]);
    setCategory('Food & Dining');
    setEditingItem(null);
    nameInputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!name.trim() || isNaN(numAmount) || numAmount <= 0) return;

    let finalAssigned: string[] = [];
    if (splitType === 'ALL') {
      finalAssigned = [];
    } else if (splitType === 'SUBSET') {
      finalAssigned = assignedMemberIds;
      if (finalAssigned.length === 0) {
        alert('Please select at least 1 member for a subset split.');
        return;
      }
    } else if (splitType === 'SOLO') {
      if (assignedMemberIds.length === 0) {
        alert('Please pick the member who owns this solo item.');
        return;
      }
      finalAssigned = [assignedMemberIds[0]];
    }

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: name.trim(),
        amount: numAmount,
        splitType,
        assignedMemberIds: finalAssigned,
        category,
      });
    } else {
      onAddItem({
        name: name.trim(),
        amount: numAmount,
        splitType,
        assignedMemberIds: finalAssigned,
        category,
      });
    }

    resetForm();
  };

  // Subset member toggle
  const toggleMember = (mId: string) => {
    if (splitType === 'SOLO') {
      setAssignedMemberIds([mId]);
    } else {
      setAssignedMemberIds((prev) =>
        prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
      );
    }
  };

  const selectAllMembers = () => {
    setAssignedMemberIds(members.map((m) => m.id));
  };

  const clearSelectedMembers = () => {
    setAssignedMemberIds([]);
  };

  const invertMemberSelection = () => {
    setAssignedMemberIds(
      members.filter((m) => !assignedMemberIds.includes(m.id)).map((m) => m.id)
    );
  };

  // Per person preview in form
  const parsedNumAmount = parseFloat(amount) || 0;
  let formPerPersonShare = 0;
  if (splitType === 'ALL') {
    formPerPersonShare = members.length > 0 ? parsedNumAmount / members.length : 0;
  } else if (splitType === 'SUBSET') {
    formPerPersonShare =
      assignedMemberIds.length > 0 ? parsedNumAmount / assignedMemberIds.length : 0;
  } else {
    formPerPersonShare = parsedNumAmount;
  }

  // Filter and Sort Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSplit =
      filterSplitType === 'ALL_TYPES' || item.splitType === filterSplitType;

    const matchesCat =
      filterCategory === 'ALL' || item.category === filterCategory;

    return matchesSearch && matchesSplit && matchesCat;
  });

  filteredItems.sort((a, b) => {
    if (sortBy === 'price-desc') return b.amount - a.amount;
    if (sortBy === 'price-asc') return a.amount - b.amount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default recent
  });

  return (
    <div className="space-y-6">
      {/* Add / Edit Item Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? 'Edit Item' : 'Add Master Bill Item'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bulk Paste Receipt / Tally</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name, Amount, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Item / Expense Description *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="e.g. Highway Petrol Full Tank, Woodfired Pizza, Craft Beer Pitcher"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 hover:bg-white transition"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 hover:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 hover:bg-white transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Split Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Who owns or participated in this expense?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: ALL */}
              <button
                type="button"
                onClick={() => {
                  setSplitType('ALL');
                  setAssignedMemberIds([]);
                }}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                  splitType === 'ALL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>👥 Everyone (ALL)</span>
              </button>

              {/* Option 2: SUBSET */}
              <button
                type="button"
                onClick={() => {
                  setSplitType('SUBSET');
                  if (assignedMemberIds.length === 0 && members.length > 0) {
                    setAssignedMemberIds([members[0].id]);
                  }
                }}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                  splitType === 'SUBSET'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>🎯 Specific People (SUBSET)</span>
              </button>

              {/* Option 3: SOLO */}
              <button
                type="button"
                onClick={() => {
                  setSplitType('SOLO');
                  if (assignedMemberIds.length === 0 && members.length > 0) {
                    setAssignedMemberIds([members[0].id]);
                  } else if (assignedMemberIds.length > 1) {
                    setAssignedMemberIds([assignedMemberIds[0]]);
                  }
                }}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                  splitType === 'SOLO'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>👤 Personal (SOLO)</span>
              </button>
            </div>
          </div>

          {/* Member Picker for SUBSET and SOLO */}
          {(splitType === 'SUBSET' || splitType === 'SOLO') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {splitType === 'SUBSET'
                    ? `Pick members sharing this item (${assignedMemberIds.length} selected):`
                    : 'Pick the single owner of this item:'}
                </span>

                {splitType === 'SUBSET' && (
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllMembers}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={clearSelectedMembers}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={invertMemberSelection}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Invert
                    </button>
                  </div>
                )}
              </div>

              {members.length === 0 ? (
                <p className="text-xs text-rose-500">
                  No members added to group yet! Please add members in the Members tab.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {members.map((m, idx) => {
                    const isSelected = assignedMemberIds.includes(m.id);
                    const color = m.color || getMemberColor(idx);

                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-white border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {getInitials(m.name)}
                        </div>
                        <span>{m.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Per Person Live Breakdown & Submit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-600">
              {parsedNumAmount > 0 && (
                <span>
                  Share per person:{' '}
                  <strong className="text-slate-900 font-bold font-mono">
                    {formatCurrency(formPerPersonShare, currency)}
                  </strong>
                  {splitType === 'ALL' && ` (${members.length} members)`}
                  {splitType === 'SUBSET' && ` (${assignedMemberIds.length} members)`}
                  {splitType === 'SOLO' && ` (100% solo)`}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !amount}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-xs transition transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingItem ? 'Save Item Changes' : 'Add to Master Bill'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Items Filtering & List Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 hover:bg-white transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
            >
              <option value="ALL_TYPES">All Split Types</option>
              <option value="ALL">👥 Shared (ALL)</option>
              <option value="SUBSET">🎯 Subsets</option>
              <option value="SOLO">👤 Solo Items</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
            >
              <option value="recent">Sort: Order Added</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Item Cards List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {items.length === 0 ? 'No items on bill yet' : 'No matching items found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {items.length === 0
                ? 'Add road trip fuel, dinner plates, or groceries manually or paste your receipt text.'
                : 'Try adjusting your search query or split type filters.'}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
              >
                Paste Receipt Text
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                allMembers={members}
                onEdit={(it) => setEditingItem(it)}
                onDelete={onDeleteItem}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bulk Add Modal */}
      <BulkAddModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onAddItems={onAddMultipleItems}
        members={members}
        currency={currency}
      />
    </div>
  );
};
