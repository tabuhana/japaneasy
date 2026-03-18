import { createReadStream } from 'fs';
import { join } from 'path';
import csv from 'csv-parser';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { toRomaji } from 'wanakana';

import * as schema from '@/drizzle/schema/index';

config({ path: '.env' });

const connection = process.env.DATABASE_URL!;
const sql = postgres(connection);
const db = drizzle(sql, { schema });

// Function to read CSV data using csv-parser
function readCSVData(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const csvPath = join(__dirname, 'japaneasy_words.csv');

    createReadStream(csvPath)
      .pipe(csv())
      .on('data', data => {
        results.push({
          kanji: data.expression,
          hiragana: data.reading,
          english: data.meaning,
          level: data.tags,
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
    console.log(`📊 Loaded ${kanjiData.length} entries from CSV`);

    const first = kanjiData[0];
    console.log('kanji:', first.kanji);
    console.log('hiragana:', first.hiragana);
    console.log('romaji:', toRomaji(first.hiragana));
    console.log('english:', first.english);
    console.log('level:', first.level);
    console.log('group:', first.group);

    // Clear existing data (optional)
    await db.delete(schema.words);

    // Seed words using CSV data
    console.log('📇 Seeding words...');
    const seedWords = await db
      .insert(schema.words)
      .values(
        kanjiData.map(entry => ({
          kanji: entry.kanji,
          kana: entry.hiragana,
          romaji: toRomaji(entry.hiragana),
          english: entry.english,
          level: entry.level as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
          wordGroup: parseInt(entry.group.split('_').pop()!),
        }))
      )
      .returning();

    console.log(`✅ Created ${seedWords.length} words`);

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
