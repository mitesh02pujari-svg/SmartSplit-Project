export type SplitType = 'ALL' | 'SUBSET' | 'SOLO';

export interface Member {
  id: string;
  name: string;
  upiId?: string;
  color: string;
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  splitType: SplitType;
  assignedMemberIds: string[]; // empty if ALL, multiple if SUBSET, 1 if SOLO
  category?: string;
}

export interface PaymentContribution {
  memberId: string;
  amountPaid: number;
}

export interface Transaction {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  settled?: boolean;
}

export interface BillSession {
  id: string;
  title: string;
  createdAt: string;
  members: Member[];
  items: BillItem[];
  payments: PaymentContribution[];
  settledTransactionIds?: string[];
  updatedAt?: string;
  currency?: string;
  category?: 'Groceries' | 'Road Trip' | 'Vacation' | 'Restaurant' | 'Flatmates' | 'General';
  notes?: string;
}

export interface MemberFinancials {
  member: Member;
  totalOwed: number;        // Total consumed share
  amountPaid: number;       // Paid upfront at register/counter
  netBalance: number;       // amountPaid - totalOwed (positive = receives money, negative = owes money)
  itemsInvolvedCount: number;
}
