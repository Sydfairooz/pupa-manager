import { Timestamp } from '@firebase/firestore';

export interface EventConfig {
    startTime: Timestamp;
    endTime: Timestamp;
    breakDuration: number;
    breakStartTime?: Timestamp;
    maxAdmins: number;
    scheduleDate?: Timestamp; // Date for the event
}

export type PermissionLevel = "view" | "edit" | "manage";

export interface AdminPermission {
    userId: string;
    email: string;
    displayName: string;
    permission: PermissionLevel;
    addedAt: Timestamp;
}

export interface Event {
    eventId: string;
    ownerId: string;
    ownerEmail: string;
    title: string;
    config: EventConfig;
    admins: AdminPermission[];
    adminEmails: string[];
    managers: string[];
    staffViewers: string[];
    publicFormEnabled: boolean;
    publicFormUrl?: string;
}

export type MaterialStatus = "Pending" | "In-progress" | "Completed" | "Delivered";
export type DressStatus = "Pending" | "In-progress" | "Completed" | "Delivered";

export interface Program {
    programId: string;
    eventId: string;
    itemName: string;
    participants: string[];
    timeNeeded: number;
    materials: MaterialStatus;
    dressStatus: DressStatus;
    rating: number; // 1-5
    remarks: string;
    category: string;
    status: "Pending" | "Live" | "Completed" | "Postponed";
    scheduledStartTime: Timestamp;
    day: 1 | 2;
    orderIndex: number;
}

export interface FormSubmission {
    submissionId: string;
    eventId: string;
    itemName: string;
    participants: string[];
    timeNeeded: number;
    category: string;
    remarks: string;
    contactEmail?: string;
    contactPhone?: string;
    costumeStatus?: string;
    submittedAt: Timestamp;
    status: "pending" | "approved" | "rejected";
}
