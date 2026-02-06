"use client";

import { useState } from "react";
import { EventConfig } from "@/types";
import { updateEventConfig } from "@/lib/firestore";
import { X, Loader2, Calendar, Clock, Coffee, Save, Sparkles } from "lucide-react";
import { Timestamp } from "@/lib/firestore";

interface ScheduleConfigModalProps {
    eventId: string;
    currentConfig: EventConfig;
    onClose: () => void;
    onUpdate: (newConfig: EventConfig) => void;
}

export function ScheduleConfigModal({ eventId, currentConfig, onClose, onUpdate }: ScheduleConfigModalProps) {
    const [loading, setLoading] = useState(false);

    // Helper to format Timestamp to datetime-local string
    const formatTimestamp = (ts: Timestamp | null | undefined) => {
        if (!ts) return "";
        const date = ts.toDate();
        // Adjust to local time string format for input: YYYY-MM-DDTHH:MM
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDateOnly = (ts: Timestamp | null | undefined) => {
        if (!ts) return "";
        const date = ts.toDate();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        scheduleDate: formatDateOnly(currentConfig.scheduleDate || currentConfig.startTime),
        startTime: formatTimestamp(currentConfig.startTime),
        endTime: formatTimestamp(currentConfig.endTime),
        breakDuration: currentConfig.breakDuration || 10,
        breakStartTime: formatTimestamp(currentConfig.breakStartTime)
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newConfig: Partial<EventConfig> = {
                scheduleDate: Timestamp.fromDate(new Date(formData.scheduleDate)),
                startTime: Timestamp.fromDate(new Date(formData.startTime)),
                endTime: Timestamp.fromDate(new Date(formData.endTime)),
                breakDuration: Number(formData.breakDuration),
                breakStartTime: formData.breakStartTime ? Timestamp.fromDate(new Date(formData.breakStartTime)) : null,
                maxAdmins: currentConfig.maxAdmins || 5
            };

            await updateEventConfig(eventId, newConfig);
            onUpdate(newConfig as EventConfig);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to update schedule configuration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-300">
                <div className="relative p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Configure Schedule</h3>
                    <p className="text-sm text-muted-foreground mt-1">Set the timeline and intervals for your event.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 ml-1">Event Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-white"
                                    value={formData.scheduleDate}
                                    onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 ml-1">Starting Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 ml-1">Ending Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all text-sm"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 ml-1">Break Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all text-sm"
                                        value={formData.breakStartTime}
                                        onChange={e => setFormData({ ...formData, breakStartTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 ml-1">Break Duration (mins)</label>
                                <div className="relative">
                                    <Coffee className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        required
                                        type="number"
                                        placeholder="e.g. 30"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all"
                                        value={formData.breakDuration}
                                        onChange={e => setFormData({ ...formData, breakDuration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1">The schedule will automatically pause for this duration at the specified break time (e.g., Lunch).</p>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border border-white/10 hover:bg-white/5 rounded-2xl font-bold transition-all text-white/60 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Save size={18} />
                                    <span>Apply Timeline</span>
                                    <Sparkles size={16} className="text-white/40 group-hover:text-white transition-colors" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
