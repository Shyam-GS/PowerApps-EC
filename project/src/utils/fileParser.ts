const parseRfc4180Csv = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        currentField += '"';
        i += 2;
      } else {
        insideQuotes = !insideQuotes;
        i++;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
      i++;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
      if (char === '\r' && text[i + 1] === '\n') {
        i += 2;
      } else {
        i++;
      }
    } else {
      currentField += char;
      i++;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

export const parseCsvFile = async (
  file: File,
  jsonColumnName: string,
  jsonKey: string
): Promise<Set<string>> => {
  const text = await file.text();
  const rows = parseRfc4180Csv(text);

  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = rows[0].map(h => h.trim());
  const columnIndex = headers.indexOf(jsonColumnName);

  if (columnIndex === -1) {
    throw new Error(`Column "${jsonColumnName}" not found in CSV. Available columns: ${headers.join(', ')}`);
  }

  const users = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length <= columnIndex) continue;

    const cellValue = row[columnIndex].trim();
    if (!cellValue) continue;

    try {
      const jsonData = JSON.parse(cellValue);
      if (jsonData[jsonKey]) {
        users.add(String(jsonData[jsonKey]).trim());
      }
    } catch {
      users.add(cellValue.trim());
    }
  }

  return users;
};

export const parseJsonFiles = async (
  files: FileList,
  csvUsers: Set<string>,
  jsonKey: string
): Promise<{ matching: number; missing: Map<string, string[]> }> => {
  let matchingCount = 0;
  const missingMap = new Map<string, string[]>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const currentUser = String(jsonData[jsonKey] || '').trim();

      if (!currentUser) continue;

      if (csvUsers.has(currentUser)) {
        matchingCount++;
      } else {
        const existing = missingMap.get(currentUser) || [];
        existing.push(file.name);
        missingMap.set(currentUser, existing);
      }
    } catch (error) {
      console.error(`Error parsing ${file.name}:`, error);
    }
  }

  return { matching: matchingCount, missing: missingMap };
};

export const exportToCsv = (missingUsers: Array<{ currentUser: string; files: string[]; count: number }>) => {
  const headers = ['currentUser', 'count', 'files'];
  const rows = missingUsers.map(user => [
    user.currentUser,
    user.count.toString(),
    user.files.join(';')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'missing_users_summary.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
