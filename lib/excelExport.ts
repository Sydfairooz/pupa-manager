import ExcelJS from 'exceljs';

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
    // Basic file type validation
    const validExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
        throw new Error("Invalid file type. Please upload an Excel file (.xlsx or .xls)");
    }

    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const data: any[] = [];
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        headers.push(cell.value?.toString().trim() || "");
    });

    // Helper to find value from multiple possible header keys
    const getVal = (row: any, keys: string[]) => {
        for (const key of keys) {
            const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") {
                return row[foundKey];
            }
        }
        return undefined;
    };

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rawRow: any = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
                let value = cell.value;
                if (value && typeof value === 'object') {
                    if ('result' in value) value = value.result;
                    else if ('richText' in value) value = (value as any).richText.map((rt: any) => rt.text).join('');
                    else if ('text' in value) value = (value as any).text;
                    else value = value.toString();
                }
                rawRow[header] = value === null || value === undefined ? "" : value;
            }
        });

        // Map to standard fields
        const itemName = getVal(rawRow, ["Item Name", "Program", "Item", "Name", "Program Name", "Title"]);
        if (!itemName) return; // Skip rows without a name

        const participantsStr = String(getVal(rawRow, ["Participants", "Members", "Cast", "Participant Names", "Students"]) || "");
        const participants = participantsStr
            ? participantsStr.split(/[,•|/]/).map(p => p.trim()).filter(p => p)
            : [];

        const timeNeeded = parseInt(String(getVal(rawRow, ["Duration", "Time", "Time Needed", "Duration (mins)", "Mins"]) || "5"));
        const programClass = String(getVal(rawRow, ["Class", "Grade", "Standard", "Floor", "Level"]) || "");
        const division = String(getVal(rawRow, ["Division", "Section", "Group", "Div"]) || "");
        const remarks = String(getVal(rawRow, ["Remarks", "Notes", "Description", "Extra"]) || "");

        data.push({
            itemName: String(itemName),
            participants,
            timeNeeded: isNaN(timeNeeded) ? 5 : timeNeeded,
            programClass,
            division,
            remarks
        });
    });

    return data;
}

export async function downloadTemplate() {
    const templateData = [
        {
            "Program Name": "Inauguration Ceremony",
            "Class": "All",
            "Division": "",
            "Participants": "Principal, Chief Guest",
            "Duration": 15,
            "Remarks": "Ensure mic is ready"
        },
        {
            "Program Name": "Solo Song",
            "Class": "10th",
            "Division": "A",
            "Participants": "John Doe",
            "Duration": 5,
            "Remarks": "Track provided via USB"
        },
        {
            "Program Name": "Group Dance",
            "Class": "8th",
            "Division": "B",
            "Participants": "Alice, Bob, Charlie, Daisy",
            "Duration": 8,
            "Remarks": ""
        }
    ];

    const columns = [
        { header: "Program Name", key: "Program Name", width: 30 },
        { header: "Class", key: "Class", width: 15 },
        { header: "Division", key: "Division", width: 10 },
        { header: "Participants", key: "Participants", width: 40 },
        { header: "Duration", key: "Duration", width: 15 },
        { header: "Remarks", key: "Remarks", width: 30 }
    ];

    await exportToExcel(templateData, columns, "schedule_template.xlsx", "Template");
}

