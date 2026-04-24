import React, { useState } from 'react';
import { InvestigationCase, HistoryEntry } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, FolderOpen, Calendar as CalendarIcon, User, Layers, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CasesDashboardProps {
  cases: InvestigationCase[];
  setCases: React.Dispatch<React.SetStateAction<InvestigationCase[]>>;
  history: HistoryEntry[];
  lang: 'en' | 'th';
  onViewUrl: (url: string) => void;
}

export default function CasesDashboard({ cases, setCases, history, lang, onViewUrl }: CasesDashboardProps) {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseAssignee, setNewCaseAssignee] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseName.trim()) return;

    const newCase: InvestigationCase = {
      id: "CASE-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
      name: newCaseName.trim(),
      description: newCaseDesc.trim(),
      status: 'OPEN',
      assignedTo: newCaseAssignee.trim() || 'Unassigned',
      createdAt: new Date().toISOString(),
      linkedUrlIds: []
    };

    setCases([newCase, ...cases]);
    setIsCreating(false);
    setNewCaseName('');
    setNewCaseDesc('');
    setNewCaseAssignee('');
    setActiveCaseId(newCase.id);
  };

  const handleUpdateStatus = (caseId: string, status: InvestigationCase['status']) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, status } : c));
  };

  const activeCase = cases.find(c => c.id === activeCaseId);
  
  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {!activeCase ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded border border-slate-200 shadow-sm">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search cases by name or ID..." 
                className="pl-9 h-10 w-full max-w-md bg-slate-50 border-slate-200"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </div>

          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader className="bg-blue-50/50 border-b border-blue-50 pb-4">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-800 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Initialize New Case
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleCreateCase} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Operation / Case Name *</label>
                        <Input value={newCaseName} onChange={e => setNewCaseName(e.target.value)} required autoFocus placeholder="e.g. OP_BLACKDROP" className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Objectives / Description</label>
                        <Input value={newCaseDesc} onChange={e => setNewCaseDesc(e.target.value)} placeholder="Main targets and scope of investigation..." className="bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lead Investigator (Optional)</label>
                        <Input value={newCaseAssignee} onChange={e => setNewCaseAssignee(e.target.value)} placeholder="Agent ID or Name" className="bg-slate-50" />
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">Create Case</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map(c => (
              <Card key={c.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full" onClick={() => setActiveCaseId(c.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono text-[10px] text-slate-500">{c.id}</Badge>
                    <Badge className={`text-[10px] uppercase font-bold ${c.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : c.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-base text-slate-800 line-clamp-1">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-1">
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description || "No description provided."}</p>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-3 px-4 sm:px-6 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{c.linkedUrlIds.length} Linked Target{c.linkedUrlIds.length !== 1 && 's'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 max-w-[50%]">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.assignedTo}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
            {filteredCases.length === 0 && !isCreating && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No active cases found.</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveCaseId(null)} className="text-slate-500 hover:text-slate-800 -ml-3">
              &larr; Back to Cases
            </Button>
          </div>
          
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="font-mono text-xs bg-white">{activeCase.id}</Badge>
                  <select 
                    className={`text-[10px] uppercase font-bold rounded px-2 py-1 outline-none border focus:ring-1 focus:ring-blue-500 cursor-pointer ${activeCase.status === 'OPEN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : activeCase.status === 'IN_PROGRESS' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
                    value={activeCase.status}
                    onChange={(e) => handleUpdateStatus(activeCase.id, e.target.value as any)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <CardTitle className="text-xl text-slate-900 mb-2">{activeCase.name}</CardTitle>
                <p className="text-sm text-slate-600">{activeCase.description || 'No description'}</p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-500 bg-white p-3 rounded border border-slate-200 min-w-[200px]">
                <div className="flex justify-between">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Created</span>
                  <span className="font-mono">{new Date(activeCase.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Lead</span>
                  <span className="font-medium text-slate-700">{activeCase.assignedTo}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Linked Analysis Reports ({activeCase.linkedUrlIds.length})
                </h3>
              </div>
              
              {activeCase.linkedUrlIds.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {activeCase.linkedUrlIds.map(historyId => {
                    const entry = history.find(h => h.id === historyId);
                    if (!entry) return null;
                    return (
                      <div key={entry.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <span className="font-mono text-sm text-blue-700 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-full block" title={entry.url}>{entry.url}</span>
                            <Badge className={`shrink-0 px-2 py-0.5 text-[10px] uppercase font-bold ${
                              entry.riskLevel === 'Critical' ? 'bg-red-600 hover:bg-red-700 text-white' :
                              entry.riskLevel === 'High' ? 'bg-red-500 hover:bg-red-600 text-white' :
                              entry.riskLevel === 'Medium' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                              'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}>
                              {entry.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{entry.report.summary}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                            {new Date(entry.analyzedAt).toLocaleString()}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-white shadow-sm"
                            onClick={() => onViewUrl(entry.url)}
                          >
                            <Search className="w-3.5 h-3.5 mr-1" /> View Report
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Layers className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No targets linked to this case yet.</p>
                  <p className="text-xs mt-1 text-slate-400">Run a scan in the Intelligence Center and click "Link to Case".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
