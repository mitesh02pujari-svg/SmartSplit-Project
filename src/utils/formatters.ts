/**
 * High contrast, aesthetic pastel/vibrant colors for up to 20+ members
 */
export const MEMBER_COLORS = [
  '#0d9488', // Teal
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#ea580c', // Orange
  '#16a34a', // Green
  '#d97706', // Amber
  '#0284c7', // Sky
  '#9333ea', // Violet
  '#e11d48', // Rose
  '#059669', // Emerald
  '#4f46e5', // Indigo
  '#ca8a04', // Yellow
  '#0891b2', // Cyan
  '#c026d3', // Fuchsia
  '#65a30d', // Lime
];

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
}

export function getInitials(name: string): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-https or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

export function generateUpiLink(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string = 'SmartSplit Settlement'
): string {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note);
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount.toFixed(2)}&tn=${cleanNote}&cu=INR`;
}
