/**
 * Example Usage of Excel Export Functions
 * 
 * This file demonstrates how to use the excelExport utility functions
 * in your Schedule Manager application.
 */

import {
    exportScheduleToExcel,
    exportSubmissionsToExcel,
    exportToExcel
} from '@/lib/excelExport';

// Example 1: Export Schedule Data
export const handleExportSchedule = async (schedules: any[]) => {
    try {
        await exportScheduleToExcel(schedules, 'event-schedule.xlsx');
        console.log('Schedule exported successfully!');
    } catch (error) {
        console.error('Error exporting schedule:', error);
    }
};

// Example 2: Export Submissions Data
export const handleExportSubmissions = async (submissions: any[]) => {
    try {
        await exportSubmissionsToExcel(submissions, 'event-submissions.xlsx');
        console.log('Submissions exported successfully!');
    } catch (error) {
        console.error('Error exporting submissions:', error);
    }
};

// Example 3: Generic Export with Custom Columns
export const handleCustomExport = async (data: any[]) => {
    try {
        const columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 20 },
        ];

        await exportToExcel(
            data,
            columns,
            'custom-export.xlsx',
            'Custom Data'
        );
        console.log('Custom data exported successfully!');
    } catch (error) {
        console.error('Error exporting custom data:', error);
    }
};

// Example 4: Usage in a React Component
/*
import { Download } from 'lucide-react';

export function ExportButton({ data }: { data: any[] }) {
  const handleExport = async () => {
    await exportScheduleToExcel(data, 'my-schedule.xlsx');
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      <Download className="w-4 h-4" />
      Export to Excel
    </button>
  );
}
*/

// Example 5: Export with Formatted Data
export const handleExportWithFormatting = async (rawData: any[]) => {
    try {
        // Transform your data before exporting
        const formattedData = rawData.map(item => ({
            time: item.startTime || 'TBD',
            program: item.title || 'Untitled',
            speaker: item.speaker?.name || 'TBA',
            location: item.venue || 'Online',
            duration: `${item.durationMinutes || 0} mins`,
        }));

        await exportScheduleToExcel(formattedData, 'formatted-schedule.xlsx');
        console.log('Formatted schedule exported successfully!');
    } catch (error) {
        console.error('Error exporting formatted schedule:', error);
    }
};
