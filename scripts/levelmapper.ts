import { JlptLevelEnum } from '@/drizzle/schema/enums';

const levelMap: Record<string, JlptLevelEnum> = {
  JLPT_1: 'N1',
  JLPT_2: 'N2',
  JLPT_3: 'N3',
  JLPT_4: 'N4',
  JLPT_5: 'N5',
  JLPT_N1: 'N1',
  JLPT_N2: 'N2',
  JLPT_N3: 'N3',
  JLPT_N4: 'N4',
  JLPT_N5: 'N5',
};

export const levelMapper = (tags: string): JlptLevelEnum | undefined => {
  const match = tags.match(/JLPT_N?\d/);
  return match ? levelMap[match[0]] : undefined;
};