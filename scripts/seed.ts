import csv from 'csv-parser';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createReadStream } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import { toRomaji } from 'wanakana';

import * as schema from '@/drizzle/schema/index';

config({ path: '.env' });

const connection = process.env.DATABASE_URL!;
const sql = postgres(connection);
const db = drizzle(sql, { schema });

type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'N0';

// Function to read CSV data using csv-parser
function readCSVData(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const csvPath = join(__dirname, 'japaneasy_N5.csv');

    createReadStream(csvPath)
      .pipe(csv())
      .on('data', data => {
        results.push({
          kanji: data.expression,
          kana: data.reading,
          english: data.meaning,
          level: data.tags as JlptLevel,
          partOfSpeech: data.parts_of_speech,
          group: data.group,
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Read CSV data
    console.log('📖 Reading CSV data...');
    const kanjiData = await readCSVData();

    // Clear existing data
    await db.delete(schema.words);

    // Seed words using CSV data
    console.log('📇 Seeding words...');
    await db.insert(schema.words).values(
      kanjiData.map((entry, idx) => ({
        kanji: entry.kanji,
        kana: entry.kana,
        romaji: toRomaji(entry.kana),
        english: entry.english,
        partOfSpeech: entry.partOfSpeech,
        wordGroup: entry.group,
        level: entry.level,
        displayOrder: idx,
      }))
    );

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the seed function
seed().catch(error => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
