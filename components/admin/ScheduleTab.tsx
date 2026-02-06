"use client";

import { useState, useEffect } from "react";
import { getEventPrograms, updateProgram } from "@/lib/firestore";
import { Program, EventConfig } from "@/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Loader2, GripVertical, AlertCircle, Download, Settings, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Timestamp } from "@/lib/firestore";
import { exportToExcel } from "@/lib/excelExport";
import { ScheduleConfigModal } from "./ScheduleConfigModal";

export function ScheduleTab({ eventId, eventConfig: initialConfig }: { eventId: string; eventConfig: EventConfig }) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<EventConfig>(initialConfig);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const fetchPrograms = async () => {
        setLoading(true);
        const data = await getEventPrograms(eventId);
        data.sort((a, b) => a.orderIndex - b.orderIndex);
        const scheduled = calculateSchedule(data, config);
        setPrograms(scheduled);
        setLoading(false);
    };

    useEffect(() => {
        fetchPrograms();
    }, [eventId, config]);

    const calculateSchedule = (items: Program[], currentConfig: EventConfig) => {
        let dayIndex = 1;
        let dayStartTime = currentConfig.startTime.toMillis();
        let dayEndTime = currentConfig.endTime.toMillis();
        let currentTime = dayStartTime;

        const breakTime = currentConfig.breakStartTime?.toMillis();
        const breakDur = (currentConfig.breakDuration || 0) * 60 * 1000;
        let breakApplied = false;

        return items.map((item, index) => {
            const durationMs = item.timeNeeded * 60 * 1000;

            // Apply break if we've passed the breakStartTime
            if (breakTime && !breakApplied && currentTime >= breakTime) {
                currentTime += breakDur;
                breakApplied = true;
            }

            // If the item doesn't fit in the current day, move it to the next day's start time
            if (currentTime + durationMs > dayEndTime) {
                dayIndex++;
                const dayOffset = 24 * 60 * 60 * 1000;
                dayStartTime += dayOffset;
                dayEndTime += dayOffset;
                currentTime = dayStartTime;
            }

            const start = currentTime;
            const scheduledStartTime = Timestamp.fromMillis(start);

            // Set next item's start time - consecutive timing
            currentTime = start + durationMs;

            return {
                ...item,
                orderIndex: index,
                scheduledStartTime,
                day: dayIndex as any
            };
        });
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(programs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const newSchedule = calculateSchedule(items, config);
        setPrograms(newSchedule);

        // Update in background
        const updates = newSchedule.map(p =>
            updateProgram(p.programId, {
                orderIndex: p.orderIndex,
                scheduledStartTime: p.scheduledStartTime,
                day: p.day
            })
        );
        await Promise.all(updates);
    };

    const handleExportSchedule = async () => {
        const exportData = programs.map((p, idx) => ({
            "S.No": idx + 1,
            "Item Name": p.itemName,
            "Participants": p.participants.join(", "),
            "Scheduled Time": format(p.scheduledStartTime.toDate(), "h:mm a").toUpperCase(),
            "Day": `Day ${p.day}`
        }));

        const columns = [
            { header: "S.No", key: "S.No", width: 10 },
            { header: "Item Name", key: "Item Name", width: 30 },
            { header: "Participants", key: "Participants", width: 40 },
            { header: "Scheduled Time", key: "Scheduled Time", width: 20 },
            { header: "Day", key: "Day", width: 15 }
        ];

        await exportToExcel(exportData, columns, `${eventId}_Schedule.xlsx`, "Schedule");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col justify-center p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-indigo-100/80 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <Sparkles size={14} />
                                Schedule Timeline
                            </div>
                            <h3 className="text-3xl font-black">
                                {format(config.startTime.toDate(), "EEEE, MMM do")}
                            </h3>
                            <div className="flex items-center gap-4 text-indigo-100 font-medium bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                <Clock size={16} />
                                <span>{format(config.startTime.toDate(), "hh:mm a")} — {format(config.endTime.toDate(), "hh:mm a")}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="flex items-center gap-2 px-6 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
                        >
                            <Settings size={20} />
                            Configure
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleExportSchedule}
                        className="flex-1 flex items-center justify-center gap-3 p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.06] transition-all group"
                    >
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Download size={24} />
                        </div>
                        <div className="text-left">
                            <div className="font-bold">Export XLSX</div>
                            <div className="text-xs text-muted-foreground">Download full schedule</div>
                        </div>
                    </button>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-emerald-400">{programs.length} Items</div>
                            <div className="text-xs text-emerald-500/60">Auto-scheduled with {config.breakDuration}m breaks</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Draggable List */}
            <div className="space-y-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="schedule-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {programs.map((item, index) => (
                                    <Draggable key={item.programId} draggableId={item.programId} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`group relative flex items-center gap-6 p-6 rounded-3xl border transition-all duration-300 ${snapshot.isDragging
                                                    ? "bg-indigo-600/20 border-indigo-500 shadow-2xl scale-[1.02] z-50 backdrop-blur-xl"
                                                    : "bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                                    }`}
                                            >
                                                <div {...provided.dragHandleProps} className="text-white/10 group-hover:text-white/40 transition-colors">
                                                    <GripVertical size={24} />
                                                </div>

                                                <div className="flex flex-col items-center justify-center min-w-[100px] py-2 px-4 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-0.5">Start</div>
                                                    <div className="text-lg font-mono font-bold">
                                                        {format(item.scheduledStartTime.toDate(), "hh:mm")}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-white/30 uppercase">{format(item.scheduledStartTime.toDate(), "a")}</div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                                            {item.itemName}
                                                        </h4>
                                                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40">
                                                            {item.category || "General"}
                                                        </span>
                                                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                                            DAY {item.day}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                                                        <div className="flex items-center gap-1.5 ring-1 ring-white/10 bg-white/5 px-2 py-1 rounded-lg">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                            {item.timeNeeded} MINS
                                                        </div>
                                                        <div className="truncate max-w-[300px] uppercase tracking-wider opacity-60 font-bold text-[10px]">
                                                            {item.participants.join(" • ")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center gap-3">
                                                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${item.materials === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-white/20 border-white/5'
                                                        }`}>
                                                        Mat: {item.materials}
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${item.dressStatus === 'Delivered' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-white/20 border-white/5'
                                                        }`}>
                                                        Dress: {item.dressStatus}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            )}

            {isConfigOpen && (
                <ScheduleConfigModal
                    eventId={eventId}
                    currentConfig={config}
                    onClose={() => setIsConfigOpen(false)}
                    onUpdate={(newConfig) => {
                        setConfig(newConfig);
                        fetchPrograms();
                    }}
                />
            )}
        </div>
    );
}

