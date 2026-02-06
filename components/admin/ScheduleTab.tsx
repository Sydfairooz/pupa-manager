"use client";

import { useState, useEffect } from "react";
import { getEventPrograms, updateProgram, addProgram } from "@/lib/firestore";
import { Program, EventConfig } from "@/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Loader2, GripVertical, AlertCircle, Download, Settings, Clock, Sparkles, User } from "lucide-react";
import { format } from "date-fns";
import { Timestamp } from "@/lib/firestore";
import { importFromExcel, downloadTemplate } from "@/lib/excelExport";
import { ScheduleConfigModal } from "./ScheduleConfigModal";
import { calculateSchedule } from "@/lib/scheduler";

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

    const handleImportSchedule = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const data = await importFromExcel(file);

            if (data.length === 0) {
                alert("No valid items found. Please ensure you have an 'Item Name' or 'Program' column.");
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
                await fetchPrograms(); // Refresh the list
                alert(`Successfully imported ${addedCount} items.`);
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to import schedule. Please check the file format.");
        } finally {
            setLoading(false);
            if (e.target) e.target.value = ""; // Reset input
        }
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
                    <label className="flex-1 flex items-center justify-center gap-3 p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.06] transition-all group cursor-pointer">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleImportSchedule}
                        />
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Download size={24} className="rotate-180" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold">Import XLSX</div>
                            <div className="text-xs text-muted-foreground">Upload schedule data</div>
                        </div>
                    </label>
                    <button
                        onClick={() => downloadTemplate()}
                        className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.06] transition-all group"
                    >
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Download size={18} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold">Sample Template</div>
                            <div className="text-[10px] text-muted-foreground">Download example file</div>
                        </div>
                    </button>
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Global Items</div>
                            <div className="text-2xl font-black text-white">{programs.length}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Duration</div>
                            <div className="text-2xl font-black text-emerald-400">
                                {programs.reduce((acc, p) => acc + (p.timeNeeded || 0), 0)} <span className="text-xs text-emerald-500/50">min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Draggable List Grouped by Day */}
            <div className="space-y-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="schedule-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
                            >
                                {[1, 2, 3].map((day) => {
                                    const dayItems = programs.filter(p => p.day === day);
                                    const totalTime = dayItems.reduce((acc, p) => acc + (p.timeNeeded || 0), 0);

                                    return (
                                        <div key={day} className="flex flex-col space-y-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 lg:min-h-[600px]">
                                            <div className="flex items-center justify-between px-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-600/20">
                                                        {day}
                                                    </div>
                                                    <h3 className="font-black text-white uppercase tracking-widest text-xs">Day {day}</h3>
                                                </div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                                                    {totalTime} mins • {dayItems.length} Items
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {programs.map((item, index) => {
                                                    if (item.day !== day) return null;
                                                    return (
                                                        <Draggable key={item.programId} draggableId={item.programId} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`group relative flex flex-col p-5 rounded-3xl border transition-all duration-300 ${snapshot.isDragging
                                                                        ? "bg-indigo-600/30 border-indigo-500 shadow-2xl scale-[1.05] z-50 backdrop-blur-xl"
                                                                        : "bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                                        <div {...provided.dragHandleProps} className="shrink-0 text-white/5 group-hover:text-white/20 transition-colors">
                                                                            <GripVertical size={20} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="font-black text-sm text-white/90 truncate uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                                                                {String(item.itemName || "")}
                                                                            </h4>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-widest">
                                                                                    {String(item.programClass || "General")}
                                                                                </span>
                                                                                <div className="text-[9px] font-bold text-white/20">
                                                                                    ({item.timeNeeded}M)
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="shrink-0 text-right">
                                                                            <div className="text-[11px] font-mono font-black text-indigo-300 whitespace-nowrap">
                                                                                {format(item.scheduledStartTime.toDate(), "hh:mm a")}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                                        <div className="flex gap-1">
                                                                            {[1, 2, 3].map(d => (
                                                                                <button
                                                                                    key={d}
                                                                                    onClick={async () => {
                                                                                        await updateProgram(item.programId, { day: d as 1 | 2 | 3 });
                                                                                        fetchPrograms();
                                                                                    }}
                                                                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black border transition-all ${item.day === d ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'}`}
                                                                                >
                                                                                    D{d}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <div className="flex gap-1.5">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${String(item.materials) === 'Delivered' ? 'bg-emerald-500' : 'bg-white/10'}`} title="Materials" />
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${String(item.dressStatus) === 'Delivered' ? 'bg-blue-500' : 'bg-white/10'}`} title="Dress" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
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

