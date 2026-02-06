"use client";

import { useState, useEffect } from "react";
import { getEventPrograms, updateProgram } from "@/lib/firestore";
import { Program } from "@/types";
import { Play, CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, ChevronRight, CirclePlay as PlayCircle } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { Timestamp } from "@/lib/firestore";
import { EventConfig } from "@/types";

export function LiveTab({ eventId, eventConfig }: { eventId: string; eventConfig: EventConfig }) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [delay, setDelay] = useState(0);

    const fetchState = async () => {
        const data = await getEventPrograms(eventId);
        data.sort((a, b) => a.orderIndex - b.orderIndex);

        const allRemaining = data.filter(p => p.status !== "Completed");
        const active = allRemaining.find(p => p.status === "Live") || allRemaining[0];

        setCurrentProgram(active || null);
        setPrograms(allRemaining);
    };

    useEffect(() => {
        fetchState();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 30);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (currentProgram && currentProgram.status === "Live") {
            const scheduledEnd = currentProgram.scheduledStartTime.toMillis() + (currentProgram.timeNeeded * 60 * 1000);
            const diff = differenceInMinutes(currentTime, scheduledEnd);
            setDelay(diff > 0 ? diff : 0);
        } else {
            setDelay(0);
        }
    }, [currentTime, currentProgram]);

    const handleStart = async () => {
        if (!currentProgram) return;
        await updateProgram(currentProgram.programId, { status: "Live" });
        fetchState();
    };

    const handleComplete = async () => {
        if (!currentProgram) return;

        await updateProgram(currentProgram.programId, { status: "Completed" });

        // Pull up logic: Update subsequent programs' start times
        const remaining = programs.filter(p => p.programId !== currentProgram.programId);
        if (remaining.length > 0) {
            let nextStartTime = Date.now();

            const updates = remaining.map((p) => {
                const start = nextStartTime;
                const durationMs = p.timeNeeded * 60 * 1000;
                nextStartTime = start + durationMs;

                return updateProgram(p.programId, {
                    scheduledStartTime: Timestamp.fromMillis(start)
                });
            });
            await Promise.all(updates);
        }

        fetchState();
    };

    const handlePostpone = async () => {
        if (!currentProgram) return;
        const maxOrder = Math.max(...programs.map(p => p.orderIndex), 0);
        await updateProgram(currentProgram.programId, {
            orderIndex: maxOrder + 1,
            status: "Pending"
        });
        fetchState();
    };

    if (!currentProgram) return (
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <CheckCircle size={48} className="mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white">All Clear!</h2>
            <p>No active programs remaining.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Sticky Header Alarm */}
            <div className={`sticky top-0 z-10 -mx-6 -mt-6 p-4 flex items-center justify-between border-b backdrop-blur-xl transition-all duration-500 ${delay > 0
                ? "bg-red-500/10 border-red-500/30 late-alarm"
                : "bg-emerald-500/10 border-emerald-500/30"
                }`}>
                <div className="flex items-center gap-4">
                    <div className="font-mono text-2xl font-bold tracking-widest">
                        {format(currentTime, "HH:mm")}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${delay > 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
                        {delay > 0 ? `LATE: +${delay} min` : "ON TIME"}
                    </div>
                </div>
                <div className="text-sm font-medium opacity-80 uppercase tracking-wider">
                    Live Control
                </div>
            </div>

            {/* Active Program Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-indigo-300 font-medium mb-1 flex items-center gap-2">
                                {currentProgram.status === "Live" ? (
                                    <>
                                        <Play size={16} className="fill-indigo-300 animate-pulse" />
                                        Running Now
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} />
                                        Ready to Start
                                    </>
                                )}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{currentProgram.itemName}</h2>
                            <p className="text-xl text-indigo-200">{currentProgram.category}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-mono font-bold">{currentProgram.timeNeeded}<span className="text-lg text-muted-foreground">min</span></div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                            <div className="text-sm text-muted-foreground mb-1">Participants</div>
                            <div className="font-medium text-lg">{currentProgram.participants.join(", ")}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {currentProgram.status === "Live" ? (
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={24} />
                                Mark Completed
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <PlayCircle size={24} />
                                Start Program
                            </button>
                        )}
                        <button
                            onClick={handlePostpone}
                            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronRight size={24} />
                            Postpone
                        </button>
                    </div>
                </div>
            </div>

            {/* Up Next Preview */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">Up Next</h3>
                {programs.filter(p => p.programId !== currentProgram.programId).slice(0, 3).map((p, idx) => (
                    <div key={p.programId} className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-white/5 opacity-60">
                        <span className="text-lg font-mono text-muted-foreground/50">+{idx + 1}</span>
                        <div className="flex-1">
                            <div className="font-medium">{p.itemName}</div>
                            <div className="text-sm text-muted-foreground">{p.timeNeeded} mins</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{p.category}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
