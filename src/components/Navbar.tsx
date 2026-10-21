import React, { useState, useRef } from 'react';
import {
  Sparkles,
  PlusCircle,
  FolderOpen,
  Share2,
  Trash2,
  RotateCcw,
  Check,
  Edit2,
  Download,
  Upload,
  Split,
} from 'lucide-react';
import { BillSession } from '../types';
import { getSavedBillsList, SavedBillSummary, exportSessionToJsonFile } from '../utils/storage';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '../utils/demoData';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  currentSession: BillSession;
  onUpdateTitle: (title: string, category?: BillSession['category']) => void;
  onLoadScenario: (scenario: BillSession) => void;
  onNewBill: () => void;
  onOpenExportModal: () => void;
  onSelectSavedBill: (id: string) => void;
  onDeleteSavedBill: (id: string) => void;
  onResetCurrentBill: () => void;
  onImportSessionJson: (session: BillSession) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSession,
  onUpdateTitle,
  onLoadScenario,
  onNewBill,
  onOpenExportModal,
  onSelectSavedBill,
  onDeleteSavedBill,
  onResetCurrentBill,
  onImportSessionJson,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentSession.title);
  const [categoryInput, setCategoryInput] = useState<BillSession['category']>(currentSession.category || 'General');
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [savedList, setSavedList] = useState<SavedBillSummary[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim(), categoryInput);
    }
    setIsEditingTitle(false);
  };

  const openSavedBills = () => {
    setSavedList(getSavedBillsList());
    setShowSavedModal(true);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.members && parsed.items) {
          onImportSessionJson(parsed);
          setShowSavedModal(false);
          alert(`Successfully imported "${parsed.title || 'Bill'}"!`);
        } else {
          alert('Invalid SmartSplit JSON file structure.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Bill Title */}
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Split className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SmartSplit
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Universal Group Expense & Bill Engine
                  </span>
                  {currentSession.category && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 hidden md:inline">
                      {currentSession.category}
                    </span>
                  )}
                </div>

                {isEditingTitle ? (
                  <div className="flex items-center mt-1 space-x-1.5 flex-wrap">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                      autoFocus
                      className="bg-slate-800 border border-emerald-500 rounded px-2 py-0.5 text-sm sm:text-base text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 w-44 sm:w-64 font-sans"
                    />
                    <select
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Road Trip">🚗 Road Trip</option>
                      <option value="Vacation">🏖️ Vacation</option>
                      <option value="Restaurant">🍽️ Restaurant</option>
                      <option value="Flatmates">🏠 Flatmates</option>
                      <option value="Groceries">🛒 Groceries</option>
                      <option value="General">📑 General</option>
                    </select>
                    <button
                      onClick={handleSaveTitle}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Save Title"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-0.5">
                    <h1
                      onClick={() => {
                        setTitleInput(currentSession.title);
                        setCategoryInput(currentSession.category || 'General');
                        setIsEditingTitle(true);
                      }}
                      className="text-base sm:text-lg font-semibold text-slate-100 truncate cursor-pointer hover:text-emerald-300 transition-colors flex items-center group max-w-[190px] sm:max-w-xs md:max-w-md"
                      title="Click to rename bill and change category"
                    >
                      {currentSession.title}
                      <Edit2 className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                    </h1>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              {/* Load Templates & Scenarios */}
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs hover:border-slate-600"
                title="Select pre-loaded group scenarios (Road Trip, Goa Villa, Restaurant Dinner, Flatmates)"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Scenarios</span>
                <span className="md:hidden">Demos</span>
              </button>

              {/* Saved Bills List */}
              <button
                onClick={openSavedBills}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
                title="View saved bills history"
              >
                <FolderOpen className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Saved</span>
              </button>

              {/* New Bill */}
              <button
                onClick={onNewBill}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-xs"
                title="Start a new blank bill"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">New</span>
              </button>

              {/* Export / Share Modal Button */}
              <button
                onClick={onOpenExportModal}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30 transition transform active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Export / Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scenarios & Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Group Scenarios & Templates</h3>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Instantly load real-world group expense scenarios with mixed ownership (`ALL`, `SUBSET`, `SOLO`) and upfront counter payments:
              </p>

              {SCENARIO_TEMPLATES.map((tmpl: ScenarioTemplate) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onLoadScenario(tmpl.session);
                    setShowTemplatesModal(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-3">
                    <span className="text-2xl shrink-0 mt-0.5">{tmpl.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2 font-mono">
                        <span>{tmpl.session.members.length} members</span>
                        <span>•</span>
                        <span>{tmpl.session.items.length} items</span>
                      </div>
                    </div>
                  </div>

                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 transition shrink-0">
                    Load
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Bills Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">Saved Bills History</h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Backup or restore bills via JSON:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportSessionToJsonFile(currentSession)}
                    className="flex items-center space-x-1 text-slate-700 hover:text-emerald-600 font-semibold"
                    title="Export active bill to JSON file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup JSON</span>
                  </button>
                  <label className="flex items-center space-x-1 text-slate-700 hover:text-emerald-600 font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore JSON</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {savedList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No saved bills found yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your current bill is auto-saved as you make changes!
                  </p>
                </div>
              ) : (
                savedList.map((bill) => {
                  const isCurrent = bill.id === currentSession.id;
                  return (
                    <div
                      key={bill.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div
                        className="cursor-pointer flex-1 mr-3 min-w-0"
                        onClick={() => {
                          onSelectSavedBill(bill.id);
                          setShowSavedModal(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-slate-800 text-sm hover:text-emerald-600 transition truncate">
                            {bill.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3 font-mono">
                          <span>{bill.memberCount} members</span>
                          <span>•</span>
                          <span>{bill.itemCount} items</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(bill.totalBill, currentSession.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              onSelectSavedBill(bill.id);
                              setShowSavedModal(false);
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                          >
                            Open
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete saved bill "${bill.title}"?`)) {
                              onDeleteSavedBill(bill.id);
                              setSavedList((prev) => prev.filter((b) => b.id !== bill.id));
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          title="Delete bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  if (confirm('Clear all items and payments in current bill?')) {
                    onResetCurrentBill();
                    setShowSavedModal(false);
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Current Bill</span>
              </button>
              <button
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
