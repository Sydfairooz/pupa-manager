"use client";

import { useState, useEffect } from "react";
import { getEventPrograms, updateProgram } from "@/lib/firestore";
import { Program } from "@/types";
import { Play, CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, ChevronRight, CirclePlay as PlayCircle } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { Timestamp } from "@/lib/firestore";
import { EventConfig } from "@/types";
import { calculateSchedule } from "@/lib/scheduler";

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
        setPrograms(data); // Hold all data for stats
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

        // Recalculate everything after change
        const data = await getEventPrograms(eventId);
        const newSchedule = calculateSchedule(data, eventConfig);

        const updates = newSchedule.map(p =>
            updateProgram(p.programId, {
                orderIndex: p.orderIndex,
                scheduledStartTime: p.scheduledStartTime,
                day: p.day
            })
        );
        await Promise.all(updates);
        fetchState();
    };

    const handlePostpone = async () => {
        if (!currentProgram) return;

        // Move to absolute end of global schedule
        const maxOrder = Math.max(...programs.map(p => p.orderIndex), 0);

        // Postpone explicitly to the next day (max Day 3)
        const targetDay = Math.min(Number(currentProgram.day || 1) + 1, 3);

        await updateProgram(currentProgram.programId, {
            orderIndex: maxOrder + 1,
            day: targetDay as any,
            status: "Pending" // Move back to pending queue
        });

        // Global recalculation to sync all timings and respect the new day assignment
        const data = await getEventPrograms(eventId);
        const newSchedule = calculateSchedule(data, eventConfig);

        const updates = newSchedule.map(p =>
            updateProgram(p.programId, {
                orderIndex: p.orderIndex,
                scheduledStartTime: p.scheduledStartTime,
                day: p.day
            })
        );
        await Promise.all(updates);
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
                    <div className="font-mono text-2xl font-bold tracking-widest text-white">
                        {format(currentTime, "hh:mm a")}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${delay > 0 ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"}`}>
                        {delay > 0 ? `LATE: +${delay} MIN` : "ON TIME"}
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2 text-white">
                    <span className="bg-white/10 px-2 py-0.5 rounded border border-white/10">DAY {currentProgram.day}</span>
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
                                        Running Now (Started {format(currentProgram.scheduledStartTime.toDate(), "hh:mm a")})
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} />
                                        Ready to Start (Scheduled {format(currentProgram.scheduledStartTime.toDate(), "hh:mm a")})
                                    </>
                                )}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{String(currentProgram.itemName || "")}</h2>
                            <div className="flex items-center gap-3">
                                <p className="text-xl text-indigo-200 font-bold">{String(currentProgram.programClass || "General")}</p>
                                {currentProgram.division && (
                                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg text-sm font-bold">
                                        {String(currentProgram.division)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-mono font-bold">{Number(currentProgram.timeNeeded || 0)}<span className="text-lg text-muted-foreground">min</span></div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                            <div className="text-sm text-muted-foreground mb-1 flex justify-between">
                                <span>Participants</span>
                                <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Day {currentProgram.day}</span>
                            </div>
                            <div className="font-medium text-lg">{Array.isArray(currentProgram.participants) ? currentProgram.participants.map(p => String(p)).join(", ") : String(currentProgram.participants || "")}</div>
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
        </div>
    );
}
