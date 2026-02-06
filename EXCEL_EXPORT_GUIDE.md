# Excel Export Functionality

This project uses **ExcelJS** for Excel file generation and export. ExcelJS is a modern, secure, and actively maintained library with no known security vulnerabilities.

## 📦 Installation

Already installed! ExcelJS is included in the project dependencies.

```bash
npm install exceljs
```

## 🚀 Quick Start

### Import the utility functions

```typescript
import { 
  exportScheduleToExcel, 
  exportSubmissionsToExcel, 
  exportToExcel 
} from '@/lib/excelExport';
```

### Example 1: Export Schedule Data

```typescript
const schedules = [
  {
    time: '09:00 AM',
    program: 'Opening Ceremony',
    speaker: 'John Doe',
    location: 'Main Hall',
    duration: '30 mins'
  },
  // ... more schedule items
];

await exportScheduleToExcel(schedules, 'event-schedule.xlsx');
```

### Example 2: Export Submissions

```typescript
const submissions = [
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    program: 'Workshop A',
    submittedAt: new Date(),
    status: 'Approved'
  },
  // ... more submissions
];

await exportSubmissionsToExcel(submissions, 'submissions.xlsx');
```

### Example 3: Generic Export with Custom Columns

```typescript
const data = [
  { id: 1, title: 'Event 1', description: 'Description here' },
  { id: 2, title: 'Event 2', description: 'Another description' }
];

const columns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Title', key: 'title', width: 30 },
  { header: 'Description', key: 'description', width: 50 }
];

await exportToExcel(data, columns, 'custom-export.xlsx', 'My Sheet');
```

## 🎨 Usage in React Components

### Add Export Button to Your Component

```typescript
import { Download } from 'lucide-react';
import { exportScheduleToExcel } from '@/lib/excelExport';

export function ScheduleTab() {
  const [schedules, setSchedules] = useState([]);

  const handleExport = async () => {
    try {
      await exportScheduleToExcel(schedules, 'schedule.xlsx');
      // Optional: Show success toast
    } catch (error) {
      console.error('Export failed:', error);
      // Optional: Show error toast
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Download className="w-4 h-4" />
        Export to Excel
      </button>
      {/* Your schedule content */}
    </div>
  );
}
```

## 🎯 Features

- ✅ **Secure**: No known vulnerabilities (unlike the old `xlsx` package)
- ✅ **Modern**: Actively maintained with regular updates
- ✅ **Styled Output**: Pre-configured with headers, borders, and colors
- ✅ **TypeScript Support**: Full type definitions included
- ✅ **Browser Compatible**: Works in all modern browsers
- ✅ **Customizable**: Easy to modify styles and formatting

## 📚 Advanced Usage

### Custom Styling

```typescript
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('My Sheet');

// Add custom styling
worksheet.getCell('A1').fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFF0000' } // Red background
};

worksheet.getCell('A1').font = {
  bold: true,
  size: 14,
  color: { argb: 'FFFFFFFF' } // White text
};
```

### Multiple Sheets

```typescript
const workbook = new ExcelJS.Workbook();
const sheet1 = workbook.addWorksheet('Schedule');
const sheet2 = workbook.addWorksheet('Submissions');

// Add data to each sheet...

const buffer = await workbook.xlsx.writeBuffer();
// Download logic...
```

## 🔗 Resources

- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [ExcelJS API Reference](https://github.com/exceljs/exceljs#interface)

## 🆚 Why ExcelJS over xlsx?

| Feature | ExcelJS | xlsx (old) |
|---------|---------|------------|
| Security | ✅ No vulnerabilities | ❌ High severity issues |
| Maintenance | ✅ Active | ⚠️ Limited |
| Styling | ✅ Full support | ⚠️ Limited |
| TypeScript | ✅ Built-in | ⚠️ Community types |
| File Size | ✅ Optimized | ⚠️ Larger |

## 🐛 Troubleshooting

### Issue: "Module not found"
Make sure ExcelJS is installed:
```bash
npm install exceljs
```

### Issue: Download not working
Ensure you're calling the export function in a browser environment (not server-side).

### Issue: TypeScript errors
The types are included with ExcelJS, but you can explicitly install them:
```bash
npm install --save-dev @types/node
```
