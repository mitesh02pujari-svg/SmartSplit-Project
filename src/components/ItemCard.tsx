import React from 'react';
import {
  Users,
  UserCheck,
  User,
  Trash2,
  Edit2,
} from 'lucide-react';
import { BillItem, Member } from '../types';
import { formatCurrency, getInitials, getMemberColor } from '../utils/formatters';

interface ItemCardProps {
  item: BillItem;
  allMembers: Member[];
  onEdit: (item: BillItem) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  allMembers,
  onEdit,
  onDelete,
  currency,
}) => {
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  // Calculate per person share
  let participantCount = 0;
  let perPerson = 0;

  if (item.splitType === 'ALL') {
    participantCount = allMembers.length;
    perPerson = participantCount > 0 ? item.amount / participantCount : 0;
  } else if (item.splitType === 'SUBSET') {
    participantCount = item.assignedMemberIds.length;
    perPerson = participantCount > 0 ? item.amount / participantCount : 0;
  } else if (item.splitType === 'SOLO') {
    participantCount = 1;
    perPerson = item.amount;
  }

  const soloMember =
    item.splitType === 'SOLO' && item.assignedMemberIds[0]
      ? memberMap.get(item.assignedMemberIds[0])
      : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition group relative overflow-hidden">
      {/* Top row: Name, Category, Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {item.name}
            </h4>
            {item.category && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {item.category}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-1">
            {/* Split Type Badge */}
            {item.splitType === 'ALL' ? (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Users className="w-3 h-3" />
                <span>Shared by All ({allMembers.length})</span>
              </span>
            ) : item.splitType === 'SUBSET' ? (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UserCheck className="w-3 h-3" />
                <span>Subset ({participantCount} people)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                <User className="w-3 h-3" />
                <span>Solo: {soloMember ? soloMember.name : 'Personal'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Price & Per-person share in font-mono */}
        <div className="text-right shrink-0">
          <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
            {formatCurrency(item.amount, currency)}
          </div>
          {participantCount > 1 && (
            <div className="text-xs text-slate-500 font-medium font-mono">
              {formatCurrency(perPerson, currency)} / person
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Assigned member avatars & edit/delete buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Avatars Stack */}
        <div className="flex items-center space-x-1.5 overflow-hidden">
          {item.splitType === 'ALL' ? (
            <span className="text-xs text-slate-500">
              Split equally across all {allMembers.length} group members
            </span>
          ) : item.splitType === 'SUBSET' ? (
            <div className="flex items-center -space-x-2">
              {item.assignedMemberIds.slice(0, 7).map((id, idx) => {
                const m = memberMap.get(id);
                if (!m) return null;
                const color = m.color || getMemberColor(idx);
                return (
                  <div
                    key={id}
                    title={m.name}
                    className="w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(m.name)}
                  </div>
                );
              })}
              {item.assignedMemberIds.length > 7 && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs shrink-0 font-mono">
                  +{item.assignedMemberIds.length - 7}
                </div>
              )}
            </div>
          ) : soloMember ? (
            <div className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
                style={{ backgroundColor: soloMember.color }}
              >
                {getInitials(soloMember.name)}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                100% charged to {soloMember.name}
              </span>
            </div>
          ) : (
            <span className="text-xs text-rose-500 font-medium">
              No member assigned
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Edit item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${item.name}" from bill?`)) {
                onDelete(item.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
