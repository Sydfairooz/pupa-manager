"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, Calendar, Settings, User as UserIcon, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Program } from "@/types";
import { format } from "date-fns";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const { id: eventId } = useParams() as { id?: string };
    const [programs, setPrograms] = useState<Program[]>([]);
    const [eventCount, setEventCount] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    // Global Events Listener (for Total Events stat)
    useEffect(() => {
        if (!user || eventId) return;

        const q = query(
            collection(db, "events"),
            where("ownerId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEventCount(snapshot.size);
        });

        return () => unsubscribe();
    }, [user, eventId]);
    useEffect(() => {
        if (!eventId) {
            setPrograms([]);
            return;
        }

        const q = query(
            collection(db, "programs"),
            where("eventId", "==", eventId),
            orderBy("orderIndex", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(),
                programId: doc.id
            })) as Program[];
            setPrograms(data);
        });

        return () => unsubscribe();
    }, [eventId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background text-indigo-500">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-card/50 backdrop-blur-xl h-screen sticky top-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Pupa
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/dashboard"} />
                    <NavItem href="/dashboard/schedule" icon={<Calendar />} label="Schedule" active={pathname.includes("/schedule")} />
                    <div className="pt-4 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Settings
                    </div>
                    <NavItem href="/dashboard/profile" icon={<UserIcon />} label="Profile" active={pathname === "/dashboard/profile"} />
                    <SettingsItem onClick={signOut} icon={<LogOut />} label="Sign Out" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <img src={user.photoURL || ""} alt="User" className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user.displayName}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-card/80 backdrop-blur-md sticky top-0 z-50">
                    <span className="font-bold text-lg">Pupa Manager</span>
                    <button onClick={signOut} className="p-2 text-muted-foreground hover:text-white">
                        <LogOut size={20} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {children}
                </main>
            </div>

            {/* Right Pane - Desktop Stats (Dynamic) */}
            <aside className="hidden xl:flex w-80 flex-col border-l border-white/10 bg-card/30 backdrop-blur-sm h-screen sticky top-0 px-6 py-8 space-y-8">
                <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Event Insight</div>
                    <h3 className="text-xl font-black text-white">Live Stats</h3>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 scrollbar-none">
                    {eventId && programs.length > 0 ? (
                        <>
                            {/* Status Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Items</div>
                                    <div className="text-2xl font-black">{programs.length}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Active</div>
                                    <div className="text-2xl font-black">{programs.filter(p => p.status === 'Live' || p.status === 'Pending').length}</div>
                                </div>
                            </div>

                            {/* State List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-xs font-bold text-white/40">In Progress</span>
                                    <span className="text-xs font-black text-indigo-400">{programs.filter(p => p.status === 'Live').length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-xs font-bold text-white/40">Completed</span>
                                    <span className="text-xs font-black text-emerald-400">{programs.filter(p => p.status === 'Completed').length}</span>
                                </div>
                            </div>

                            {/* Multi-day Progress */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Live Progress</div>
                                {[1, 2, 3].map(day => {
                                    const dayItems = programs.filter(p => p.day === day);
                                    const dayCompleted = dayItems.filter(p => p.status === 'Completed').length;
                                    if (dayItems.length === 0) return null;

                                    return (
                                        <div key={day} className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-white/40 font-black">DAY {day}</span>
                                                <span className="text-[10px] text-white/20 tracking-tighter">{dayCompleted}/{dayItems.length}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                                    style={{ width: `${(dayCompleted / dayItems.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pipeline Preview */}
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Upcoming</div>
                                <div className="space-y-3">
                                    {programs.filter(p => p.status === 'Pending').slice(0, 3).map((p) => (
                                        <div key={p.programId} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-[8px] font-black text-indigo-500/50 uppercase tracking-widest">Day {p.day}</div>
                                                <div className="text-[9px] font-black text-white/20">{p.timeNeeded}M</div>
                                            </div>
                                            <div className="text-xs font-bold text-white/80 truncate">{p.itemName}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                <div className="text-sm text-indigo-300 mb-1">Total Events</div>
                                <div className="text-3xl font-bold">{eventCount}</div>
                            </div>

                            <div className="p-12 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">No Event Selected</div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5">
                                <div className="text-xs text-indigo-300/40 mb-1 font-bold uppercase tracking-widest">System Status</div>
                                <div className="flex items-center gap-2 text-xs text-emerald-500/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Operational
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Local Time (IST)</div>
                    <div className="text-xl font-black font-mono">{format(new Date(), "hh:mm a")}</div>
                </div>
            </aside>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                ? "bg-indigo-600/20 text-indigo-300 shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)] border border-indigo-500/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
        >
            <span className={active ? "text-indigo-400" : "text-muted-foreground group-hover:text-white transition-colors"}>
                {icon}
            </span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}

function SettingsItem({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors group"
        >
            <span className="group-hover:text-red-400 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
}
