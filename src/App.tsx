import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BillSummaryBar } from './components/BillSummaryBar';
import { ItemManager } from './components/ItemManager';
import { MemberManager } from './components/MemberManager';
import { PaymentManager } from './components/PaymentManager';
import { SettlementView } from './components/SettlementView';
import { MemberBreakdownModal } from './components/MemberBreakdownModal';
import { ReceiptExportModal } from './components/ReceiptExportModal';
import { BillSession, Member, BillItem, PaymentContribution } from './types';
import {
  loadCurrentBillSession,
  saveCurrentBillSession,
  createNewEmptyBill,
  loadBillById,
  deleteBillById,
} from './utils/storage';
import { calculateSettlementTransactions } from './utils/calculator';
import { getMemberColor } from './utils/formatters';
import { getDemoBillSession } from './utils/demoData';

export function App() {
  const [session, setSession] = useState<BillSession>(() => loadCurrentBillSession());
  const [activeTab, setActiveTab] = useState<'items' | 'members' | 'payments' | 'settlement'>(
    () => (loadCurrentBillSession().members.length === 0 ? 'members' : 'items')
  );
  const [selectedPassbookMember, setSelectedPassbookMember] = useState<Member | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Auto-save changes to localStorage
  useEffect(() => {
    saveCurrentBillSession(session);
  }, [session]);

  // Derived transactions with settled status
  const transactions = calculateSettlementTransactions(
    session.members,
    session.items,
    session.payments,
    session.settledTransactionIds || []
  );

  // Update Bill Title and Category
  const handleUpdateTitle = (title: string, category?: BillSession['category']) => {
    setSession((prev) => ({
      ...prev,
      title,
      category: category || prev.category,
    }));
  };

  // Load a Scenario Template
  const handleLoadScenario = (scenario: BillSession) => {
    setSession(scenario);
    setActiveTab('items');
  };

  // Start New Empty Bill
  const handleNewBill = () => {
    const title = prompt(
      'Enter a name for the new bill (e.g., "Manali Road Trip", "Olive Bistro Dinner", "Flat 402 Groceries"):',
      'New Group Bill'
    );
    if (title && title.trim()) {
      const newBill = createNewEmptyBill(title.trim(), 'General');
      setSession(newBill);
      setActiveTab('members');
    }
  };

  // Import JSON session
  const handleImportSessionJson = (imported: BillSession) => {
    setSession(imported);
    setActiveTab('items');
  };

  // Select Saved Bill
  const handleSelectSavedBill = (id: string) => {
    const saved = loadBillById(id);
    if (saved) {
      setSession(saved);
    }
  };

  // Delete Saved Bill
  const handleDeleteSavedBill = (id: string) => {
    deleteBillById(id);
    if (session.id === id) {
      setSession(createNewEmptyBill());
    }
  };

  // Reset Current Bill
  const handleResetCurrentBill = () => {
    setSession((prev) => ({
      ...prev,
      items: [],
      payments: [],
      settledTransactionIds: [],
    }));
  };

  // Member Management
  const handleAddMember = (name: string, upiId?: string) => {
    const newMember: Member = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      color: getMemberColor(session.members.length),
      upiId,
    };
    setSession((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const handleAddBatchMembers = (names: string[]) => {
    const newMembers: Member[] = names.map((name, idx) => ({
      id: `m-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      color: getMemberColor(session.members.length + idx),
    }));
    setSession((prev) => ({
      ...prev,
      members: [...prev.members, ...newMembers],
    }));
  };

  const handleUpdateMember = (id: string, name: string, upiId?: string) => {
    setSession((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id ? { ...m, name, upiId } : m
      ),
    }));
  };

  const handleDeleteMember = (id: string) => {
    setSession((prev) => {
      // Clean up items referencing this member
      const updatedItems = prev.items.map((item) => {
        if (item.splitType === 'SUBSET') {
          return {
            ...item,
            assignedMemberIds: item.assignedMemberIds.filter((mId) => mId !== id),
          };
        } else if (item.splitType === 'SOLO' && item.assignedMemberIds[0] === id) {
          return {
            ...item,
            assignedMemberIds: [],
          };
        }
        return item;
      });

      // Clean up payments
      const updatedPayments = prev.payments.filter((p) => p.memberId !== id);

      return {
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        items: updatedItems,
        payments: updatedPayments,
      };
    });
  };

  // Item Management
  const handleAddItem = (itemData: Omit<BillItem, 'id'>) => {
    const newItem: BillItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setSession((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
  };

  const handleAddMultipleItems = (newItems: BillItem[]) => {
    setSession((prev) => ({
      ...prev,
      items: [...newItems, ...prev.items],
    }));
  };

  const handleUpdateItem = (updated: BillItem) => {
    setSession((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updated.id ? updated : item)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setSession((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Payment Management
  const handleUpdatePayment = (memberId: string, amount: number) => {
    setSession((prev) => {
      const existingIdx = prev.payments.findIndex((p) => p.memberId === memberId);
      let updatedPayments: PaymentContribution[];
      if (existingIdx >= 0) {
        updatedPayments = [...prev.payments];
        updatedPayments[existingIdx] = { memberId, amountPaid: amount };
      } else {
        updatedPayments = [...prev.payments, { memberId, amountPaid: amount }];
      }
      return {
        ...prev,
        payments: updatedPayments,
      };
    });
  };

  const handleBulkSetPayments = (newPayments: PaymentContribution[]) => {
    setSession((prev) => ({
      ...prev,
      payments: newPayments,
    }));
  };

  // Settlement Management (settledTransactionIds array)
  const handleToggleSettledTransaction = (txId: string) => {
    setSession((prev) => {
      const current = prev.settledTransactionIds || [];
      const next = current.includes(txId)
        ? current.filter((id) => id !== txId)
        : [...current, txId];
      return {
        ...prev,
        settledTransactionIds: next,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation */}
      <Navbar
        currentSession={session}
        onUpdateTitle={handleUpdateTitle}
        onLoadScenario={handleLoadScenario}
        onNewBill={handleNewBill}
        onOpenExportModal={() => setShowExportModal(true)}
        onSelectSavedBill={handleSelectSavedBill}
        onDeleteSavedBill={handleDeleteSavedBill}
        onResetCurrentBill={handleResetCurrentBill}
        onImportSessionJson={handleImportSessionJson}
      />

      {/* Bill Summary KPIs & Tab Navigation */}
      <BillSummaryBar
        items={session.items}
        payments={session.payments}
        members={session.members}
        transactions={transactions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currency={session.currency || '₹'}
      />

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {session.members.length === 0 && (
          <div className="mb-6 bg-white rounded-2xl border-2 border-dashed border-emerald-300 p-6 sm:p-8 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              No members in group yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Add group members above or load a sample scenario to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveTab('members')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Group Members</span>
              </button>
              <button
                onClick={() => handleLoadScenario(getDemoBillSession())}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load Sample Trip</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <ItemManager
            items={session.items}
            members={session.members}
            onAddItem={handleAddItem}
            onAddMultipleItems={handleAddMultipleItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            currency={session.currency || '₹'}
          />
        )}

        {activeTab === 'members' && (
          <MemberManager
            members={session.members}
            items={session.items}
            payments={session.payments}
            onAddMember={handleAddMember}
            onAddBatchMembers={handleAddBatchMembers}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onSelectMemberPassbook={(m) => setSelectedPassbookMember(m)}
            currency={session.currency || '₹'}
            onLoadSample={() => handleLoadScenario(getDemoBillSession())}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentManager
            members={session.members}
            items={session.items}
            payments={session.payments}
            onUpdatePayment={handleUpdatePayment}
            onBulkSetPayments={handleBulkSetPayments}
            currency={session.currency || '₹'}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementView
            members={session.members}
            items={session.items}
            payments={session.payments}
            settledTransactionIds={session.settledTransactionIds || []}
            onToggleSettledTransaction={handleToggleSettledTransaction}
            onOpenExportModal={() => setShowExportModal(true)}
            currency={session.currency || '₹'}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">SmartSplit</span>
            <span>• Universal group expense & bill reconciliation engine</span>
          </div>
          <div>
            <span>Road trips • Vacations • Dinners • Shared flat groceries • Shopping runs</span>
          </div>
        </div>
      </footer>

      {/* Member Detailed Passbook Modal */}
      <MemberBreakdownModal
        member={selectedPassbookMember}
        allMembers={session.members}
        items={session.items}
        payments={session.payments}
        onClose={() => setSelectedPassbookMember(null)}
        currency={session.currency || '₹'}
      />

      {/* Receipt Export & WhatsApp Sharing Modal */}
      <ReceiptExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        billTitle={session.title}
        members={session.members}
        items={session.items}
        payments={session.payments}
        currency={session.currency || '₹'}
      />
    </div>
  );
}

export default App;
