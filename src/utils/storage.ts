import { BillSession } from '../types';
import { getDemoBillSession } from './demoData';

const CURRENT_BILL_KEY = 'smartsplit_current_session';
const SAVED_BILLS_INDEX_KEY = 'smartsplit_saved_bills_index';

export interface SavedBillSummary {
  id: string;
  title: string;
  updatedAt: string;
  memberCount: number;
  itemCount: number;
  totalBill: number;
  category?: string;
}

export const createEmptyBill = (): BillSession => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  title: 'New Expense Split',
  createdAt: new Date().toISOString(),
  members: [],
  items: [],
  payments: [],
  settledTransactionIds: [],
});

export function loadCurrentBillSession(): BillSession {
  try {
    const raw = localStorage.getItem(CURRENT_BILL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && Array.isArray(parsed.members) && Array.isArray(parsed.items)) {
        // Backwards compatibility for settled transactions format
        if (!parsed.settledTransactionIds && parsed.settledTransactions) {
          parsed.settledTransactionIds = Object.keys(parsed.settledTransactions).filter(
            (k) => parsed.settledTransactions[k]
          );
        } else if (!parsed.settledTransactionIds) {
          parsed.settledTransactionIds = [];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse current bill session from localStorage:', e);
  }

  // When no saved bills exist in localStorage, initialize a fresh, empty bill session
  const empty = createEmptyBill();
  saveCurrentBillSession(empty);
  return empty;
}

export function saveCurrentBillSession(session: BillSession): void {
  try {
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(CURRENT_BILL_KEY, JSON.stringify(session));

    // Also update index of bills
    updateBillInIndex(session);
  } catch (e) {
    console.error('Failed to save bill session to localStorage:', e);
  }
}

export function createNewEmptyBill(
  title: string = 'New Expense Split',
  category: BillSession['category'] = 'General'
): BillSession {
  return {
    ...createEmptyBill(),
    title,
    category,
    currency: '₹',
  };
}

export function getSavedBillsList(): SavedBillSummary[] {
  try {
    const raw = localStorage.getItem(SAVED_BILLS_INDEX_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved bills index:', e);
  }
  return [];
}

function updateBillInIndex(session: BillSession): void {
  try {
    const list = getSavedBillsList();
    const total = session.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const summary: SavedBillSummary = {
      id: session.id,
      title: session.title,
      updatedAt: session.updatedAt || session.createdAt,
      memberCount: session.members.length,
      itemCount: session.items.length,
      totalBill: total,
      category: session.category,
    };

    const existingIdx = list.findIndex((b) => b.id === session.id);
    if (existingIdx >= 0) {
      list[existingIdx] = summary;
    } else {
      list.unshift(summary);
    }

    localStorage.setItem(SAVED_BILLS_INDEX_KEY, JSON.stringify(list));
    localStorage.setItem(`smartsplit_bill_${session.id}`, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to update bill in index:', e);
  }
}

export function loadBillById(id: string): BillSession | null {
  try {
    const raw = localStorage.getItem(`smartsplit_bill_${id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.settledTransactionIds && parsed.settledTransactions) {
        parsed.settledTransactionIds = Object.keys(parsed.settledTransactions).filter(
          (k) => parsed.settledTransactions[k]
        );
      } else if (!parsed.settledTransactionIds) {
        parsed.settledTransactionIds = [];
      }
      return parsed;
    }
  } catch (e) {
    console.error(`Failed to load bill with id ${id}:`, e);
  }
  return null;
}

export function deleteBillById(id: string): void {
  try {
    localStorage.removeItem(`smartsplit_bill_${id}`);
    const list = getSavedBillsList().filter((b) => b.id !== id);
    localStorage.setItem(SAVED_BILLS_INDEX_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete bill:', e);
  }
}

export function exportSessionToJsonFile(session: BillSession): void {
  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_smartsplit.json`;
  a.click();
  URL.revokeObjectURL(url);
}
