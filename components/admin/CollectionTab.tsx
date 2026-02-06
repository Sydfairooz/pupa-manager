"use client";

import { useState, useEffect } from "react";
import { getEventPrograms, addProgram, deleteProgram } from "@/lib/firestore";
import { Program, MaterialStatus, DressStatus } from "@/types";
import { Plus, Upload, Trash2, Edit, FileSpreadsheet, Download, Search, Filter, Loader2, Sparkles, User, Clock, CheckCircle2 } from "lucide-react";
import { exportToExcel, importFromExcel, downloadTemplate } from "@/lib/excelExport";
import { EditProgramModal } from "./EditProgramModal";

export function CollectionTab({ eventId }: { eventId: string }) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [newItem, setNewItem] = useState({ itemName: "", timeNeeded: 5, participants: "", programClass: "", division: "" });

    const fetchPrograms = async () => {
        setLoading(true);
        const data = await getEventPrograms(eventId);
        setPrograms(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPrograms();
    }, [eventId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const data = await importFromExcel(file);

            if (data.length === 0) {
                alert("No valid items found. Please ensure your Excel has an 'Item Name' or 'Program' column.");
                return;
            }

            let addedCount = 0;
            for (const item of data) {
                await addProgram(eventId, {
                    ...item,
                    materials: "Pending",
                    dressStatus: "Pending"
                });
                addedCount++;
            }

            if (addedCount > 0) {
                await fetchPrograms();
                alert(`Successfully imported ${addedCount} items.`);
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to import. Check file format.");
        } finally {
            setLoading(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleAddStart = async () => {
        if (!newItem.itemName) return;
        await addProgram(eventId, {
            itemName: newItem.itemName,
            timeNeeded: Number(newItem.timeNeeded),
            programClass: newItem.programClass,
            division: newItem.division,
            participants: newItem.participants.split(",").map(s => s.trim()),
            materials: "Pending",
            dressStatus: "Pending"
        });
        setIsAdding(false);
        setNewItem({ itemName: "", timeNeeded: 5, participants: "", programClass: "", division: "" });
        fetchPrograms();
    };

    const filteredPrograms = programs.filter(p => {
        const itemName = String(p.itemName || "").toLowerCase();
        const search = searchQuery.toLowerCase();
        return itemName.includes(search) ||
            p.participants.some(name => String(name || "").toLowerCase().includes(search));
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "Completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "In-progress": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            default: return "bg-white/5 text-white/40 border-white/10";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        placeholder="Search items or participants..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    <label className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-medium cursor-pointer">
                        <FileSpreadsheet size={18} className="text-emerald-400" />
                        <span className="whitespace-nowrap">Import Excel</span>
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={() => downloadTemplate()}
                        className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-medium whitespace-nowrap"
                    >
                        <Download size={18} className="text-indigo-400" />
                        <span>Sample</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 font-bold"
                    >
                        <Plus size={20} />
                        <span className="whitespace-nowrap">Add Program</span>
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                            <Sparkles size={18} />
                        </div>
                        <h4 className="font-bold text-lg">Quick Program Entry</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Program Name</label>
                            <input
                                placeholder="e.g. Solo Dance"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50"
                                value={newItem.itemName}
                                onChange={e => setNewItem({ ...newItem, itemName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Participants</label>
                            <input
                                placeholder="Comma separated names..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50"
                                value={newItem.participants}
                                onChange={e => setNewItem({ ...newItem, participants: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Class</label>
                            <input
                                placeholder="e.g. 10th"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50"
                                value={newItem.programClass}
                                onChange={e => setNewItem({ ...newItem, programClass: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Div</label>
                            <input
                                placeholder="e.g. A"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50"
                                value={newItem.division}
                                onChange={e => setNewItem({ ...newItem, division: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Time (mins)</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50"
                                value={newItem.timeNeeded}
                                onChange={e => setNewItem({ ...newItem, timeNeeded: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <button onClick={handleAddStart} className="flex-1 h-[50px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                <Plus size={18} /> Save
                            </button>
                            <button onClick={() => setIsAdding(false)} className="h-[50px] px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-medium">
                                <Trash2 size={18} className="text-rose-500/50" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List View */}
            <div className="grid grid-cols-1 gap-4">
                {filteredPrograms.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <Search className="w-12 h-12 text-white/10 mb-4" />
                        <h4 className="text-lg font-medium text-white/60">No items found</h4>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or add a new program.</p>
                    </div>
                ) : (
                    filteredPrograms.map((p, idx) => (
                        <div key={p.programId} className="group relative bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all duration-300 p-5 lg:p-6 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10 group-hover:bg-indigo-600/10 transition-colors"></div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12 duration-500 border border-white/5">
                                        {idx + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-bold text-white/90 group-hover:text-indigo-300 transition-colors">{String(p.itemName || "")}</h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    {String(p.programClass || "General")}
                                                </span>
                                                {p.division && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
                                                        {String(p.division)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <User size={13} className="text-indigo-400/60" />
                                                <span className="max-w-[200px] truncate">{Array.isArray(p.participants) ? p.participants.map(name => String(name)).join(", ") : String(p.participants || "")}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock size={13} className="text-emerald-400/60" />
                                                <span>{Number(p.timeNeeded || 0)} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Materials</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border text-center ${getStatusStyle(String(p.materials))}`}>
                                            {String(p.materials || "")}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Dress Status</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border text-center ${getStatusStyle(String(p.dressStatus))}`}>
                                            {String(p.dressStatus || "")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 lg:ml-4">
                                        <button
                                            onClick={() => setEditingProgram(p)}
                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-indigo-500/50 group/edit"
                                        >
                                            <Edit size={18} className="text-muted-foreground group-hover/edit:text-indigo-400" />
                                        </button>
                                        {/* Optional: Delete button */}
                                    </div>
                                </div>
                            </div>

                            {p.remarks && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/60">Note:</div>
                                    <p className="text-xs text-muted-foreground italic line-clamp-1">"{String(p.remarks || "")}"</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            )}

            {editingProgram && (
                <EditProgramModal
                    program={editingProgram}
                    onClose={() => setEditingProgram(null)}
                    onUpdate={fetchPrograms}
                />
            )}
        </div>
    );
}

