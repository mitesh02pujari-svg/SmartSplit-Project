import { BillItem, Member, SplitType } from '../types';

export interface ParseResult {
  items: BillItem[];
  unparsedLines: string[];
}

export function parseReceiptText(text: string, existingMembers: Member[]): ParseResult {
  const lines = text.split('\n');
  const items: BillItem[] = [];
  const unparsedLines: string[] = [];

  const memberNameMap = new Map<string, string>(); // lowerName -> id
  existingMembers.forEach((m) => {
    memberNameMap.set(m.name.trim().toLowerCase(), m.id);
  });

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      return;
    }

    // Check for Tab-separated or Comma-separated (e.g. "Rice, 450, ALL" or "Rice\t450")
    if (line.includes('\t') || (line.includes(',') && !line.includes('('))) {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const amount = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
        if (name && !isNaN(amount) && amount > 0) {
          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name,
            amount,
            splitType: 'ALL',
            assignedMemberIds: [],
          });
          return;
        }
      }
    }

    // General regex to parse: Item Name [optional details] Price [optional (Names...)]
    // Example: "Basmati Rice 5kg 450"
    // Example: "Cadbury Silk 180 (Priya)"
    // Example: "Red Bull 450 - (Rahul, Amit)"
    // Example: "₹ 550 Surf Excel"
    // Example: "Amul Butter - 275"

    // Extract names in parentheses or brackets if present
    let detectedMembers: string[] = [];
    let cleanLine = line;

    const bracketMatch = line.match(/[\(\[]([^\)\]]+)[\)\]]/);
    if (bracketMatch) {
      const candidateNames = bracketMatch[1].split(/[,/&]+/).map((s) => s.trim().toLowerCase());
      candidateNames.forEach((cName) => {
        // Direct match or substring match with existing members
        for (const [mName, mId] of memberNameMap.entries()) {
          if (cName === mName || mName.startsWith(cName) || cName.startsWith(mName)) {
            if (!detectedMembers.includes(mId)) {
              detectedMembers.push(mId);
            }
          }
        }
      });
      // Remove bracket section for price/name extraction
      cleanLine = line.replace(/[\(\[][^\)\]]+[\)\]]/, '').trim();
    }

    // Try to find the numeric amount
    // Match currency symbols, numbers with optional decimals
    const amountMatches = [...cleanLine.matchAll(/(?:₹|\$|Rs\.?|INR)?\s*([0-9]+(?:[.,][0-9]{1,2})?)/gi)];

    if (amountMatches.length > 0) {
      // Typically the last number in the line is the price
      const lastMatch = amountMatches[amountMatches.length - 1];
      const amountStr = lastMatch[1].replace(',', '.');
      const amount = parseFloat(amountStr);

      // The item name is everything excluding the amount match
      const amountIndex = lastMatch.index ?? cleanLine.lastIndexOf(lastMatch[0]);
      let itemName = cleanLine.substring(0, amountIndex).replace(/[-:–—]+$/, '').trim();

      // If price was at the beginning (e.g. "450 Basmati Rice")
      if (!itemName) {
        itemName = cleanLine.substring(amountIndex + lastMatch[0].length).replace(/^[-:–—]+/, '').trim();
      }

      if (itemName && !isNaN(amount) && amount > 0) {
        let splitType: SplitType = 'ALL';
        let assignedMemberIds: string[] = [];

        if (detectedMembers.length === 1) {
          splitType = 'SOLO';
          assignedMemberIds = [detectedMembers[0]];
        } else if (detectedMembers.length > 1) {
          splitType = 'SUBSET';
          assignedMemberIds = detectedMembers;
        }

        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: itemName,
          amount,
          splitType,
          assignedMemberIds,
        });
        return;
      }
    }

    unparsedLines.push(rawLine);
  });

  return { items, unparsedLines };
}
