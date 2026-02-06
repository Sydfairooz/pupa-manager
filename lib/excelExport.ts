import ExcelJS from 'exceljs';

/**
 * Export schedule data to Excel file
 * @param schedules - Array of schedule items
 * @param filename - Name of the file to download
 */
export async function exportScheduleToExcel(
    schedules: any[],
    filename: string = 'schedule.xlsx'
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Schedule');

    // Define columns
    worksheet.columns = [
        { header: 'Time', key: 'time', width: 15 },
        { header: 'Program', key: 'program', width: 30 },
        { header: 'Speaker', key: 'speaker', width: 25 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Duration', key: 'duration', width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    schedules.forEach((schedule) => {
        worksheet.addRow({
            time: schedule.time || '',
            program: schedule.program || '',
            speaker: schedule.speaker || '',
            location: schedule.location || '',
            duration: schedule.duration || '',
        });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Export submissions data to Excel file
 * @param submissions - Array of submission items
 * @param filename - Name of the file to download
 */
export async function exportSubmissionsToExcel(
    submissions: any[],
    filename: string = 'submissions.xlsx'
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Submissions');

    // Define columns
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Program', key: 'program', width: 30 },
        { header: 'Submitted At', key: 'submittedAt', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    submissions.forEach((submission) => {
        worksheet.addRow({
            name: submission.name || '',
            email: submission.email || '',
            program: submission.program || '',
            submittedAt: submission.submittedAt
                ? new Date(submission.submittedAt).toLocaleString()
                : '',
            status: submission.status || '',
        });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Generic Excel export function
 * @param data - Array of objects to export
 * @param columns - Column definitions
 * @param filename - Name of the file to download
 * @param sheetName - Name of the worksheet
 */
export async function exportToExcel(
    data: any[],
    columns: { header: string; key: string; width?: number }[],
    filename: string = 'export.xlsx',
    sheetName: string = 'Sheet1'
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set columns
    worksheet.columns = columns;

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    data.forEach((item) => {
        worksheet.addRow(item);
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

export async function importFromExcel(file: File): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell) => {
        headers.push(cell.value?.toString() || "");
    });

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
                rowData[header] = cell.value;
            }
        });
        data.push(rowData);
    });

    return data;
}

