"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getEventPrograms, getEvent } from "@/lib/firestore";
import { Program, Event } from "@/types";
import { Loader2, Calendar, Clock, MapPin, Shield } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

import { useAuth } from "@/context/AuthContext";

export default function StaffViewPage() {
    const { eventId } = useParams() as { eventId: string };
    const { user, loading: authLoading, signInWithGoogle } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (user) {
            getEvent(eventId).then(setEvent);
            fetchData();
            const timer = setInterval(() => setCurrentTime(new Date()), 30000);
            return () => clearInterval(timer);
        }
    }, [eventId, user]);

    const fetchData = async () => {
        const data = await getEventPrograms(eventId);
        data.sort((a, b) => a.orderIndex - b.orderIndex);
        setPrograms(data);

        // Find active
        const active = data.find(p => p.status === "Live") || data.find(p => p.status === "Pending");
        setCurrentProgram(active || null);
    };

    if (authLoading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" />
        </div>
    );

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl bg-card border border-white/10 shadow-2xl">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-4">
                        <Shield className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Secure Access</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Please sign in with Google to view the live schedule and program updates for this event.
                    </p>
                    <button
                        onClick={() => signInWithGoogle()}
                        className="w-full group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-white px-8 font-bold text-black transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02]"
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-5 h-5 mr-3"
                        />
                        Sign in with Google
                    </button>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest pt-4">Staff Verification Required</p>
                </div>
            </div>
        );
    }

    if (!event) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}
            <header className="p-4 border-b border-white/10 bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-lg">{event.title}</h1>
                        <p className="text-xs text-muted-foreground">Staff View</p>
                    </div>
                    <div className="font-mono font-bold text-xl">
                        {format(currentTime, "HH:mm")}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Current Status Card */}
                {currentProgram && (
                    <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-6 shadow-xl border border-white/10">
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                            On Stage Now
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{String(currentProgram.itemName || "")}</h2>
                        <div className="flex items-center gap-4 text-indigo-200 text-sm">
                            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                                {String(currentProgram.programClass || "General")}
                                {currentProgram.division && ` - ${currentProgram.division}`}
                            </span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {Number(currentProgram.timeNeeded || 0)}m</span>
                        </div>
                    </div>
                )}

                {/* Full Schedule List Grouped by Day */}
                <div className="space-y-8">
                    {[1, 2, 3].map((day) => {
                        const dayPrograms = programs.filter(p => p.day === day);
                        if (dayPrograms.length === 0 && day > 1) return null;

                        return (
                            <div key={day} className="space-y-4">
                                <h3 className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                                    <div className="h-px flex-1 bg-white/5" />
                                    Day {day} Schedule
                                    <div className="h-px flex-1 bg-white/5" />
                                </h3>

                                <div className="space-y-2">
                                    {dayPrograms.map((p) => {
                                        const isCompleted = p.status === "Completed";
                                        const isLive = p.status === "Live";
                                        const isNext = p.programId === currentProgram?.programId && !isLive;

                                        return (
                                            <div
                                                key={p.programId}
                                                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${isLive ? "bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5" :
                                                    isNext ? "bg-white/10 border-white/20" :
                                                        isCompleted ? "bg-white/5 border-transparent opacity-40" : "bg-card border-white/5"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center justify-center min-w-[50px]">
                                                    <div className="text-xs font-mono font-bold text-white/80">{format(p.scheduledStartTime.toMillis(), "HH:mm")}</div>
                                                    <div className="text-[8px] font-bold text-white/20 uppercase">{format(p.scheduledStartTime.toMillis(), "a")}</div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-bold truncate ${isCompleted ? "line-through text-muted-foreground/60" : "text-white"}`}>
                                                        {String(p.itemName || "")}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate font-medium">
                                                        {Array.isArray(p.participants) ? p.participants.map(n => String(n)).join(" • ") : String(p.participants || "")}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-lg border ${isLive ? "bg-indigo-500 text-white border-indigo-400 animate-pulse" :
                                                        isNext ? "bg-amber-500/20 text-amber-400 border-amber-500/20" :
                                                            isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" :
                                                                "bg-white/5 text-white/20 border-white/5"
                                                        }`}>
                                                        {isLive ? "LIVE NOW" : isNext ? "UP NEXT" : isCompleted ? "DONE" : "PENDING"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
