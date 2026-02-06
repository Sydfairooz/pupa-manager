"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEvent, submitProgram } from "@/lib/firestore";
import { Event } from "@/types";
import { Loader2, CheckCircle2, Plus, Minus, Send, Sparkles, Clock, Shirt, User, Music } from "lucide-react";

export default function PublicSubmissionPage() {
    const { eventId } = useParams() as { eventId: string };
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        itemName: "",
        participants: [""],
        timeNeeded: 5,
        costumeStatus: "In-progress",
        category: "Dance",
        remarks: ""
    });

    useEffect(() => {
        if (eventId) {
            getEvent(eventId).then((ev) => {
                if (ev && ev.publicFormEnabled) {
                    setEvent(ev);
                }
                setLoading(false);
            });
        }
    }, [eventId]);

    const addParticipant = () => {
        setFormData(prev => ({ ...prev, participants: [...prev.participants, ""] }));
    };

    const removeParticipant = (index: number) => {
        if (formData.participants.length === 1) return;
        const newList = [...formData.participants];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, participants: newList }));
    };

    const updateParticipant = (index: number, value: string) => {
        const newList = [...formData.participants];
        newList[index] = value;
        setFormData(prev => ({ ...prev, participants: newList }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.participants.every(p => !p.trim())) {
            alert("Please add at least one participant.");
            return;
        }
        setIsSubmitting(true);
        try {
            await submitProgram(eventId, {
                ...formData,
                participants: formData.participants.filter(p => p.trim() !== "")
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#060608] flex items-center justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 relative" />
            </div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
                <X className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Access Denied</h1>
            <p className="text-muted-foreground mt-3 max-w-xs leading-relaxed">
                This event link is either invalid or registrations have been disabled by the organizer.
            </p>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/40 relative group">
                <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                <CheckCircle2 className="w-12 h-12 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Registration Sent!</h1>
            <p className="text-white/60 mt-4 max-w-sm text-lg leading-relaxed">
                Your program details for <span className="text-indigo-400 font-bold">{event.title}</span> are now being reviewed by our team.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-10 px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest"
            >
                Register Another Item
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#060608] text-white selection:bg-indigo-500/30 pb-20">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none"></div>

            <main className="max-w-2xl mx-auto px-6 pt-16">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles size={12} />
                        Join the Stage
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase italic">
                        {event.title}
                    </h1>
                    <p className="text-white/40 text-lg font-medium">Program Registration Interface</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Item Name */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Music size={18} />
                            </div>
                            <label className="text-lg font-bold tracking-tight">Stage Name / Item Title</label>
                        </div>
                        <input
                            required
                            type="text"
                            placeholder="e.g., Midnight Harmony Solo"
                            className="w-full bg-white/[0.03] border border-white/5 focus:border-indigo-500/50 focus:bg-white/[0.05] rounded-3xl p-6 outline-none transition-all text-xl font-medium placeholder:text-white/10 shadow-inner"
                            value={formData.itemName}
                            onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                        />
                    </div>

                    {/* Participants Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <User size={18} />
                                </div>
                                <label className="text-lg font-bold tracking-tight">Participants</label>
                            </div>
                            <button
                                type="button"
                                onClick={addParticipant}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Plus size={14} /> ADD MEMBER
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.participants.map((p, idx) => (
                                <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <input
                                        required
                                        type="text"
                                        placeholder={`Participant #${idx + 1}`}
                                        className="flex-1 bg-white/[0.03] border border-white/5 focus:border-indigo-500/50 rounded-2xl p-5 outline-none transition-all font-medium placeholder:text-white/10"
                                        value={p}
                                        onChange={e => updateParticipant(idx, e.target.value)}
                                    />
                                    {formData.participants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(idx)}
                                            className="p-5 bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                                        >
                                            <Minus size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Expected Time */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                                    <Clock size={18} />
                                </div>
                                <label className="text-lg font-bold tracking-tight">Expected Duration</label>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4 flex items-center justify-between">
                                <span className="text-2xl font-black ml-4">{formData.timeNeeded}m</span>
                                <div className="flex gap-1">
                                    {[3, 5, 8, 12, 20].map(time => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, timeNeeded: time })}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${formData.timeNeeded === time ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Costume Status */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Shirt size={18} />
                                </div>
                                <label className="text-lg font-bold tracking-tight">Costume Status</label>
                            </div>
                            <select
                                className="w-full bg-white/[0.03] border border-white/5 focus:border-indigo-500/50 rounded-3xl p-5 outline-none transition-all appearance-none cursor-not-allowed cursor-pointer font-bold text-center uppercase tracking-widest text-xs"
                                value={formData.costumeStatus}
                                onChange={e => setFormData({ ...formData, costumeStatus: e.target.value })}
                            >
                                <option className="bg-[#0A0A0B]" value="Pending">Pending</option>
                                <option className="bg-[#0A0A0B]" value="In-progress">In-progress</option>
                                <option className="bg-[#0A0A0B]" value="Completed">Completed</option>
                                <option className="bg-[#0A0A0B]" value="Delivered">Delivered</option>
                            </select>
                        </div>
                    </div>

                    {/* Category (Hidden but defaulted) */}
                    <div className="grid grid-cols-3 gap-3">
                        {['Dance', 'Music', 'Drama', 'Speach', 'Other'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat })}
                                className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.category === cat ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full relative group"
                        >
                            <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-6 rounded-[2rem] transition-all shadow-xl shadow-indigo-600/20 text-xl tracking-tighter italic">
                                {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <>FINALIZE & SUBMIT <Send size={20} className="not-italic" /></>}
                            </div>
                        </button>
                    </div>
                </form>

                <footer className="mt-20 text-center">
                    <div className="inline-flex items-center gap-3 text-white/20 font-bold tracking-[0.3em] text-[8px] uppercase">
                        <div className="w-8 h-px bg-white/10"></div>
                        Empowering Performances by Pupa
                        <div className="w-8 h-px bg-white/10"></div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}

