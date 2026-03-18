// import { and, eq, sql } from 'drizzle-orm';

// import db from '@/drizzle';
// import { userGroupProgress } from '@/drizzle/schema';
// import { JlptLevelEnum } from '@/drizzle/schema/enums';

// /**
//  * Bulk insert group progress rows for a level
//  */
// export const insertUserGroupProgress = async (
//   data: {
//     userId: string;
//     level: JlptLevelEnum;
//     groupNumber: number;
//     status: 'locked' | 'active' | 'completed';
//     totalWords: number;
//   }[]
// ) => {
//   if (data.length === 0) return;
//   await db.insert(userGroupProgress).values(data);
// };

// /**
//  * Increment wordsAdded for a specific group
//  */
// export const incrementGroupWordsAdded = async (
//   userId: string,
//   level: JlptLevelEnum,
//   group: number,
//   count: number
// ) => {
//   await db
//     .update(userGroupProgress)
//     .set({ wordsAdded: sql`${userGroupProgress.wordsAdded} + ${count}` })
//     .where(
//       and(
//         eq(userGroupProgress.userId, userId),
//         eq(userGroupProgress.level, level),
//         eq(userGroupProgress.groupNumber, group)
//       )
//     );
// };

// /**
//  * Adjust wordsCompleted by delta (+1 or -1) for a specific group
//  */
// export const adjustGroupWordsCompleted = async (
//   userId: string,
//   level: JlptLevelEnum,
//   group: number,
//   delta: number
// ) => {
//   await db
//     .update(userGroupProgress)
//     .set({ wordsCompleted: sql`${userGroupProgress.wordsCompleted} + ${delta}` })
//     .where(
//       and(
//         eq(userGroupProgress.userId, userId),
//         eq(userGroupProgress.level, level),
//         eq(userGroupProgress.groupNumber, group)
//       )
//     );
// };

// /**
//  * Update status of a specific group row
//  */
// export const updateGroupStatus = async (
//   userId: string,
//   level: JlptLevelEnum,
//   group: number,
//   status: 'locked' | 'active' | 'completed'
// ) => {
//   await db
//     .update(userGroupProgress)
//     .set({ status })
//     .where(
//       and(
//         eq(userGroupProgress.userId, userId),
//         eq(userGroupProgress.level, level),
//         eq(userGroupProgress.groupNumber, group)
//       )
//     );
// };
