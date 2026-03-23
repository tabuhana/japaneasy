import { pgEnum } from "drizzle-orm/pg-core";

export const jlptLevelEnum = pgEnum('jlpt_level', ['N5', 'N4', 'N3', 'N2', 'N1', 'N0'])

export const cardStatusEnum = pgEnum('card_status', ['new', 'learning', 'reviewing', 'mastered'])

export type JlptLevelEnum = (typeof jlptLevelEnum.enumValues)[number];
