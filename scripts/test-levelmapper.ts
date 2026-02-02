import { createReadStream } from 'fs';
import { join } from 'path';
import csv from 'csv-parser';

import { levelMapper } from './levelmapper';

interface CsvRow {
  expression: string;
  reading: string;
  meaning: string;
  tags: string;
}

function readCSVData(): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    const csvPath = join(__dirname, 'all.csv');

    createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: CsvRow) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
}

async function testLevelMapper() {
  const rows = await readCSVData();
  const failures: { expression: string; reading: string; tags: string }[] = [];
  const tagCounts: Record<string, number> = {};

  for (const row of rows) {
    const level = levelMapper(row.tags);

    // Track unique tag patterns
    tagCounts[row.tags] = (tagCounts[row.tags] || 0) + 1;

    if (level == null) {
      failures.push({
        expression: row.expression,
        reading: row.reading,
        tags: row.tags,
      });
    }
  }

  // Report results
  console.log(`Total words: ${rows.length}`);
  console.log(`Passed: ${rows.length - failures.length}`);
  console.log(`Failed (null level): ${failures.length}`);
  // Exit with failure code if any words had null level
  if (failures.length > 0) {
    process.exit(1);
  }
}

testLevelMapper();
