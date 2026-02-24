/**
 * Database Index Verification Script
 *
 * This script runs EXPLAIN ANALYZE on critical queries to verify that indexes are being used.
 * Run this after migrations to ensure optimal query performance.
 *
 * Usage: bun run scripts/verify-indexes.ts
 */

import { sql } from 'drizzle-orm';
import db from '../src/drizzle';

console.log('🔍 Verifying database indexes...\n');

interface ExplainResult extends Record<string, unknown> {
  'QUERY PLAN': string;
}

// Helper to check if index is used in query plan
const checkIndexUsage = (plan: string, indexName: string): boolean => {
  return plan.toLowerCase().includes(indexName.toLowerCase());
};

// Helper to check for sequential scans (bad performance)
const hasSequentialScan = (plan: string): boolean => {
  return plan.toLowerCase().includes('seq scan');
};

const runExplainQuery = async (queryName: string, query: string, expectedIndex?: string) => {
  console.log(`📊 Testing: ${queryName}`);
  console.log(`   Query: ${query.substring(0, 100)}...`);

  try {
    const result = await db.execute<ExplainResult>(sql.raw(`EXPLAIN ANALYZE ${query}`));
    const plan = result.map(row => row['QUERY PLAN']).join('\n');

    console.log('\n   Plan:');
    console.log(plan.split('\n').map(line => `   ${line}`).join('\n'));

    if (expectedIndex) {
      if (checkIndexUsage(plan, expectedIndex)) {
        console.log(`   ✅ Index "${expectedIndex}" is being used`);
      } else {
        console.log(`   ❌ Index "${expectedIndex}" is NOT being used`);
      }
    }

    if (hasSequentialScan(plan)) {
      console.log('   ⚠️  WARNING: Sequential scan detected (may indicate missing index)');
    }

    console.log('\n' + '─'.repeat(80) + '\n');
  } catch (error) {
    console.error(`   ❌ Error running query: ${error}`);
    console.log('\n' + '─'.repeat(80) + '\n');
  }
};

const main = async () => {
  // Test 1: Get due cards for user (MOST CRITICAL QUERY)
  await runExplainQuery(
    'Get Due Cards',
    `
      SELECT uw.*, w.*
      FROM user_words uw
      INNER JOIN words w ON uw.word_id = w.id
      WHERE uw.user_id = 'test-user-id'
        AND uw.next_review_date <= NOW()
      ORDER BY uw.next_review_date
      LIMIT 50
    `,
    'idx_userwords_user_nextreview'
  );

  // Test 2: Get user's mastered words by status
  await runExplainQuery(
    'Get Mastered Words',
    `
      SELECT COUNT(*)
      FROM user_words
      WHERE user_id = 'test-user-id'
        AND status = 'mastered'
    `,
    'idx_userwords_user_status'
  );

  // Test 3: Get random words from level (for adding new words)
  await runExplainQuery(
    'Get Random Words from Level',
    `
      SELECT *
      FROM words
      WHERE level = 'N5'
      ORDER BY RANDOM()
      LIMIT 5
    `,
    'idx_words_level'
  );

  // Test 4: Calculate accuracy from reviews
  await runExplainQuery(
    'Calculate Accuracy',
    `
      SELECT
        SUM(CASE WHEN r.was_correct THEN 1 ELSE 0 END) as correct,
        COUNT(*) as total
      FROM reviews r
      INNER JOIN user_words uw ON r.user_word_id = uw.id
      INNER JOIN words w ON uw.word_id = w.id
      WHERE r.user_id = 'test-user-id'
        AND w.level = 'N5'
    `,
    'idx_reviews_user_reviewedat'
  );

  // Test 5: Get review history for a card
  await runExplainQuery(
    'Get Review History',
    `
      SELECT *
      FROM reviews
      WHERE user_word_id = '00000000-0000-0000-0000-000000000000'
      ORDER BY reviewed_at DESC
      LIMIT 50
    `,
    'idx_reviews_userword_reviewedat'
  );

  // Test 6: Get active level progress
  await runExplainQuery(
    'Get Active Level Progress',
    `
      SELECT *
      FROM user_level_progress
      WHERE user_id = 'test-user-id'
        AND status = 'active'
    `,
    'idx_userlevel_user_status'
  );

  console.log('✅ Index verification complete!\n');
  console.log('Summary:');
  console.log('- If indexes are being used, queries should be fast (< 10ms)');
  console.log('- Sequential scans indicate missing or unused indexes');
  console.log('- Review any warnings and consider adding indexes if needed\n');

  process.exit(0);
};

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
