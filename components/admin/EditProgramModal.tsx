"use client";

import { useState } from "react";
import { Program, MaterialStatus, DressStatus } from "@/types";
import { updateProgram } from "@/lib/firestore";
import { X, Loader2, Save, Trash2 } from "lucide-react";

interface EditProgramModalProps {
    program: Program;
    onClose: () => void;
    onUpdate: () => void;
}

export function EditProgramModal({ program, onClose, onUpdate }: EditProgramModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        itemName: String(program.itemName || ""),
        participants: Array.isArray(program.participants) ? program.participants.map(p => String(p)).join(", ") : String(program.participants || ""),
        timeNeeded: Number(program.timeNeeded || 5),
        programClass: String(program.programClass || ""),
        division: String(program.division || ""),
        remarks: String(program.remarks || ""),
        materials: String(program.materials || "Pending") as MaterialStatus,
        dressStatus: String(program.dressStatus || "Pending") as DressStatus,
        day: Number(program.day || 1),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProgram(program.programId, {
                ...formData,
                day: formData.day as 1 | 2 | 3,
                participants: formData.participants.split(",").map(p => p.trim()).filter(p => p !== "")
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to update program.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">Edit Program Item</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Modify program details and track production status.</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basic Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Program Title</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                    value={formData.itemName}
                                    onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Duration (Min)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all"
                                        value={formData.timeNeeded}
                                        onChange={e => setFormData({ ...formData, timeNeeded: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Assigned Day</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, day: d })}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${formData.day === d ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'}`}
                                            >
                                                D{d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Participants (Comma Separated)</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all min-h-[80px] resize-none text-sm leading-relaxed"
                                    value={formData.participants}
                                    onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Class</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        value={formData.programClass}
                                        onChange={e => setFormData({ ...formData, programClass: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Division</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        value={formData.division}
                                        onChange={e => setFormData({ ...formData, division: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Status Controls */}
                        <div className="space-y-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                            <h4 className="text-sm font-bold border-b border-white/5 pb-3 mb-2 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <Save size={14} />
                                </div>
                                Production Status
                            </h4>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Material Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Pending", "In-progress", "Completed", "Delivered"].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, materials: status as MaterialStatus })}
                                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${formData.materials === status ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Dress / Costume Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Pending", "In-progress", "Completed", "Delivered"].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, dressStatus: status as DressStatus })}
                                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${formData.dressStatus === status ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Remarks</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all text-sm"
                                    value={formData.remarks}
                                    placeholder="Add notes here..."
                                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border border-white/10 hover:bg-white/5 rounded-2xl font-bold transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
}
