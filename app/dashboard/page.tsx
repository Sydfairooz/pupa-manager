"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Users, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createEvent, getUserEvents } from "@/lib/firestore";
import { Event } from "@/types";
import { CreateEventModal } from "@/components/CreateEventModal";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();
    const [ownedEvents, setOwnedEvents] = useState<Event[]>([]);
    const [sharedEvents, setSharedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);

    const fetchEvents = async () => {
        if (!user || !user.email) return;
        try {
            const { ownedEvents: owned, sharedEvents: shared } = await getUserEvents(user.uid, user.email);
            setOwnedEvents(owned);
            setSharedEvents(shared);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const handleCreateEvent = async (title: string) => {
        if (!user || !user.email) return;
        try {
            await createEvent(user.uid, user.email, title);
            await fetchEvents(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    const EventCard = ({ event, isOwner }: { event: Event; isOwner: boolean }) => (
        <Link
            key={event.eventId}
            href={`/dashboard/event/${event.eventId}`}
            className="group relative flex flex-col p-6 rounded-2xl bg-card border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all duration-300"
        >
            <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Calendar size={20} />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${isOwner ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        }`}>
                        {isOwner ? "Owner" : "Admin"}
                    </span>
                </div>

                <div>
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {event.config.startTime ? new Date(event.config.startTime.toMillis()).toLocaleDateString() : "No Date"}
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{(event.admins?.length || 0) + (event.managers?.length || 0) + 1} Staff</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{event.config.breakDuration}min Break</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                    {isOwner ? "Manage Event" : "View Event"}
                </span>
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                </div>
            </div>
        </Link>
    );

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your art programs and schedules.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={18} />
                    Create Event
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse border border-white/10" />
                    ))}
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Owned Events Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Plus className="text-indigo-400" size={20} />
                            My Events
                        </h2>
                        {ownedEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                                <p className="text-muted-foreground">You haven't created any events yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ownedEvents.map(event => <EventCard key={event.eventId} event={event} isOwner={true} />)}
                            </div>
                        )}
                    </div>

                    {/* Shared Events Section */}
                    {sharedEvents.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-emerald-400" size={20} />
                                Shared with Me
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sharedEvents.map(event => <EventCard key={event.eventId} event={event} isOwner={false} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FAB for Mobile */}
            <button
                onClick={() => setModalOpen(true)}
                className="md:hidden fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 transition-transform active:scale-95 z-50"
            >
                <Plus size={24} />
            </button>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateEvent}
            />
        </div>
    );
}
