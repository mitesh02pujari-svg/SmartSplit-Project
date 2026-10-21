import { Member, BillItem, PaymentContribution } from '../types';
import {
  calculateBillTotals,
  calculateMemberFinancials,
  calculateSettlementTransactions,
} from './calculator';
import { formatCurrency } from './formatters';

export function generateWhatsAppSummary(
  billTitle: string,
  members: Member[],
  items: BillItem[],
  payments: PaymentContribution[],
  currency: string = '₹',
  includeItemizedList: boolean = true,
  settledTransactionIds: string[] = []
): string {
  const totals = calculateBillTotals(items, payments);
  const financials = calculateMemberFinancials(members, items, payments);
  const transactions = calculateSettlementTransactions(members, items, payments, settledTransactionIds);

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const lines: string[] = [];

  // Header
  lines.push(`🧾 *${billTitle.toUpperCase()} - SMARTSPLIT REPORT*`);
  lines.push(`📅 Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
  lines.push(`👥 Group Size: ${members.length} members`);
  lines.push(`🛒 Total Items: ${items.length}`);
  lines.push('───────────────────────');

  // Financial Overview
  lines.push(`💰 *Total Expenses:* ${formatCurrency(totals.totalBill, currency)}`);
  lines.push(`💳 *Total Paid Upfront:* ${formatCurrency(totals.totalPaid, currency)}`);

  if (totals.isBalanced) {
    lines.push(`✅ *Status:* Perfectly Balanced! (₹0 discrepancy)`);
  } else if (totals.difference > 0) {
    lines.push(`⚠️ *Notice:* Upfront payment exceeded expenses by ${formatCurrency(totals.difference, currency)}`);
  } else {
    lines.push(`⚠️ *Notice:* Upfront payment is short by ${formatCurrency(Math.abs(totals.difference), currency)}`);
  }
  lines.push('───────────────────────');

  // Counter Payers
  const payers = payments.filter((p) => p.amountPaid > 0);
  if (payers.length > 0) {
    lines.push(`💳 *UPFRONT PAYMENTS AT REGISTER / VENDOR:*`);
    payers.forEach((p) => {
      const m = memberMap.get(p.memberId);
      lines.push(`  • ${m ? m.name : 'Unknown'}: ${formatCurrency(p.amountPaid, currency)}`);
    });
    lines.push('───────────────────────');
  }

  // Transactions / Who Pays Whom
  lines.push(`⚡ *SETTLEMENTS (WHO PAYS WHOM):*`);
  if (transactions.length === 0) {
    lines.push(`🎉 Everyone is all settled up! No transfers needed.`);
  } else {
    transactions.forEach((tx, idx) => {
      const fromName = memberMap.get(tx.fromMemberId)?.name || 'Someone';
      const toName = memberMap.get(tx.toMemberId)?.name || 'Someone';
      const toUpi = memberMap.get(tx.toMemberId)?.upiId;
      const upiNote = toUpi ? ` (UPI: ${toUpi})` : '';
      const statusIcon = tx.settled ? '✅ [SETTLED] ' : '';
      lines.push(`${idx + 1}. ${statusIcon}*${fromName}* ➡️ pays *${toName}*: *${formatCurrency(tx.amount, currency)}*${upiNote}`);
    });
  }
  lines.push('───────────────────────');

  // Individual Passbook Summary
  lines.push(`📊 *INDIVIDUAL MEMBER SUMMARY:*`);
  financials.forEach((f) => {
    let statusText = '';
    if (f.netBalance > 0.05) {
      statusText = `🟢 Gets back ${formatCurrency(f.netBalance, currency)}`;
    } else if (f.netBalance < -0.05) {
      statusText = `🔴 Owes ${formatCurrency(Math.abs(f.netBalance), currency)}`;
    } else {
      statusText = `⚪ Settled (₹0)`;
    }

    lines.push(
      `• *${f.member.name}*: Share ${formatCurrency(f.totalOwed, currency)} | Paid ${formatCurrency(f.amountPaid, currency)} ➡️ ${statusText}`
    );
  });

  // Optional itemized list
  if (includeItemizedList && items.length > 0) {
    lines.push('───────────────────────');
    lines.push(`📝 *ITEMIZED EXPENSES:*`);
    items.forEach((item) => {
      let splitInfo = 'Shared by All';
      if (item.splitType === 'SOLO') {
        const m = memberMap.get(item.assignedMemberIds[0]);
        splitInfo = `Solo (${m ? m.name : 'Personal'})`;
      } else if (item.splitType === 'SUBSET') {
        const names = item.assignedMemberIds
          .map((id) => memberMap.get(id)?.name || 'Unknown')
          .join(', ');
        splitInfo = `Subset (${names})`;
      }
      lines.push(`• ${item.name}: ${formatCurrency(item.amount, currency)} [${splitInfo}]`);
    });
  }

  lines.push('───────────────────────');
  lines.push(`✨ Reconciled via *SmartSplit* • Universal Group Expense Engine`);

  return lines.join('\n');
}
