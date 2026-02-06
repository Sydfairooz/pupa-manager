import { Program, EventConfig } from "@/types";
import { Timestamp } from "@/lib/firestore";

/**
 * Recalculates start times for an array of programs based on event configuration.
 * Handles multi-day breaks and day overflows.
 */
export function calculateSchedule(items: Program[], config: EventConfig) {
    let dayIndex = 1;
    let dayStartTime = config.startTime.toMillis();
    let dayEndTime = config.endTime.toMillis();
    let currentTime = dayStartTime;

    // Extract break clock time (time since start of day)
    const breakStartTs = config.breakStartTime?.toMillis();
    const baseStartTs = config.startTime.toMillis();
    const breakOffset = breakStartTs ? (breakStartTs - baseStartTs) : null;
    const breakDur = (config.breakDuration || 0) * 60 * 1000;
    let breakAppliedForCurrentDay = false;

    // We sort items by their order index primarily
    const sortedItems = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

    return sortedItems.map((item, index) => {
        const durationMs = item.timeNeeded * 60 * 1000;

        // If the item has an explicit day higher than current dayIndex, jump to it
        if (item.day > dayIndex && item.day <= 3) {
            dayIndex = item.day;
            const dayOffset = (dayIndex - 1) * 24 * 60 * 60 * 1000;
            dayStartTime = config.startTime.toMillis() + dayOffset;
            dayEndTime = config.endTime.toMillis() + dayOffset;
            currentTime = dayStartTime;
            breakAppliedForCurrentDay = false;
        }

        // Apply break if defined and not yet applied for today
        if (breakOffset !== null && !breakAppliedForCurrentDay) {
            const todayBreakTime = dayStartTime + breakOffset;
            if (currentTime >= todayBreakTime) {
                currentTime += breakDur;
                breakAppliedForCurrentDay = true;
            }
        }

        // If the item doesn't fit in the current day, move it to the next day's start time
        // Allowing up to Day 3
        if (currentTime + durationMs > dayEndTime && dayIndex < 3) {
            dayIndex++;
            const dayOffset = 24 * 60 * 60 * 1000;
            dayStartTime += dayOffset;
            dayEndTime += dayOffset;
            currentTime = dayStartTime;
            breakAppliedForCurrentDay = false; // Reset break for new day
        }

        const start = currentTime;
        const scheduledStartTime = Timestamp.fromMillis(start);

        // Set next item's start time
        currentTime = start + durationMs;

        return {
            ...item,
            orderIndex: index, // Normalize index
            scheduledStartTime,
            day: dayIndex as any
        };
    });
}
