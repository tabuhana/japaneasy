import type { WordOfTheDay as WordOfTheDayType } from '@/lib/types';

export function WordOfTheDay({ word }: { word: WordOfTheDayType }) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jlptLevel = `N${word.level}`;

  return (
    <section className="space-y-3">
      <div className="font-baloo flex items-center justify-between font-bold">
        <h2 className="text-2xl">Word of the Day</h2>
        <span className="text-muted-foreground text-sm font-normal">{today}</span>
      </div>

      <div className="border-border bg-card rounded-sm border-2 p-6">
        <div className="flex justify-end">
          <span className="bg-primary text-primary-foreground rounded-2xl px-3 py-1 text-sm font-bold">
            {jlptLevel}
          </span>
        </div>

        <p className="font-cherry-bomb my-2 text-center text-5xl">{word.word}</p>
        <p className="text-muted-foreground text-center text-lg">{word.furigana}</p>

        <hr className="border-border my-3" />

        <p className="font-baloo text-center text-xl font-bold">{word.meaning}</p>
      </div>
    </section>
  );
}
