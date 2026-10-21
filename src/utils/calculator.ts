import { Member, BillItem, PaymentContribution, Transaction, MemberFinancials } from '../types';

/**
 * Calculates how much each member owes for a specific item
 */
export function calculateItemShares(
  item: BillItem,
  allMembers: Member[]
): Map<string, number> {
  const shares = new Map<string, number>();

  if (allMembers.length === 0 || item.amount <= 0) {
    return shares;
  }

  if (item.splitType === 'ALL') {
    const perMemberShare = item.amount / allMembers.length;
    allMembers.forEach((m) => {
      shares.set(m.id, perMemberShare);
    });
  } else if (item.splitType === 'SUBSET') {
    const validAssigned = item.assignedMemberIds.filter((id) =>
      allMembers.some((m) => m.id === id)
    );
    if (validAssigned.length > 0) {
      const perMemberShare = item.amount / validAssigned.length;
      validAssigned.forEach((id) => {
        shares.set(id, perMemberShare);
      });
    }
  } else if (item.splitType === 'SOLO') {
    const assignedId = item.assignedMemberIds[0];
    if (assignedId && allMembers.some((m) => m.id === assignedId)) {
      shares.set(assignedId, item.amount);
    }
  }

  return shares;
}

/**
 * Calculates complete financials for each member:
 * - total consumed liability
 * - total upfront payment at register/counter
 * - net balance (+ owed to them, - owes to group)
 * - count of items they participated in
 */
export function calculateMemberFinancials(
  members: Member[],
  items: BillItem[],
  payments: PaymentContribution[]
): MemberFinancials[] {
  const owedMap = new Map<string, number>();
  const itemCountMap = new Map<string, number>();

  members.forEach((m) => {
    owedMap.set(m.id, 0);
    itemCountMap.set(m.id, 0);
  });

  items.forEach((item) => {
    const shares = calculateItemShares(item, members);
    shares.forEach((share, memberId) => {
      const currentOwed = owedMap.get(memberId) || 0;
      owedMap.set(memberId, currentOwed + share);

      const currentCount = itemCountMap.get(memberId) || 0;
      itemCountMap.set(memberId, currentCount + 1);
    });
  });

  const paidMap = new Map<string, number>();
  payments.forEach((p) => {
    const currentPaid = paidMap.get(p.memberId) || 0;
    paidMap.set(p.memberId, currentPaid + p.amountPaid);
  });

  return members.map((member) => {
    const totalOwed = owedMap.get(member.id) || 0;
    const amountPaid = paidMap.get(member.id) || 0;
    const netBalance = amountPaid - totalOwed;

    return {
      member,
      totalOwed: Math.round(totalOwed * 100) / 100,
      amountPaid: Math.round(amountPaid * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      itemsInvolvedCount: itemCountMap.get(member.id) || 0,
    };
  });
}

/**
 * Totals summary for the entire bill session
 */
export function calculateBillTotals(
  items: BillItem[],
  payments: PaymentContribution[]
) {
  const totalBill = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const difference = Math.round((totalPaid - totalBill) * 100) / 100;

  return {
    totalBill: Math.round(totalBill * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    difference,
    isBalanced: Math.abs(difference) < 0.05,
  };
}

/**
 * Helper to generate a unique transaction ID
 */
export function getTransactionId(fromMemberId: string, toMemberId: string): string {
  return `${fromMemberId}->${toMemberId}`;
}

/**
 * Debt Simplification Algorithm (Greedy Minimum Cash Flow)
 * Minimizes total number of transactions required to settle all debts.
 * Maximum number of transactions is N - 1.
 */
export function calculateSettlementTransactions(
  members: Member[],
  items: BillItem[],
  payments: PaymentContribution[],
  settledTransactionIds: string[] = []
): Transaction[] {
  if (members.length === 0 || items.length === 0) {
    return [];
  }

  const financials = calculateMemberFinancials(members, items, payments);

  // Separate debtors (netBalance < 0) and creditors (netBalance > 0)
  interface BalanceNode {
    memberId: string;
    amount: number; // positive value representing magnitude
  }

  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  financials.forEach((f) => {
    // Round to 2 decimal places to avoid floating point precision artifacts
    const bal = Math.round(f.netBalance * 100) / 100;
    if (bal < -0.01) {
      debtors.push({ memberId: f.member.id, amount: Math.abs(bal) });
    } else if (bal > 0.01) {
      creditors.push({ memberId: f.member.id, amount: bal });
    }
  });

  // Sort descending by magnitude to minimize transactions
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settledSet = new Set(settledTransactionIds);
  const transactions: Transaction[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const roundedSettledAmount = Math.round(settledAmount * 100) / 100;

    if (roundedSettledAmount > 0.01) {
      const txId = getTransactionId(debtor.memberId, creditor.memberId);
      const isSettled = settledSet.has(txId) || settledSet.has(`${debtor.memberId}_${creditor.memberId}`);

      transactions.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: roundedSettledAmount,
        settled: isSettled,
      });
    }

    debtor.amount = Math.round((debtor.amount - settledAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settledAmount) * 100) / 100;

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return transactions;
}
