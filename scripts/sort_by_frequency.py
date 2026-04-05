"""Sort japaneasy_N5.csv words by spoken frequency using the wordfreq library.

Usage (run from project root):
    pip install wordfreq
    python scripts/sort_by_frequency.py
"""

import csv
import os
import sys

from wordfreq import word_frequency

sys.stdout.reconfigure(encoding="utf-8")


def get_frequency(expression, reading):
    """Return the best frequency match for a word, trying multiple strategies."""

    # Strategy 1: try the expression directly (kanji form)
    freq = word_frequency(expression, "ja")
    if freq > 0:
        return freq

    # Strategy 2: try the reading (kana form)
    freq = word_frequency(reading, "ja")
    if freq > 0:
        return freq

    # Strategy 3: for multi-word / compound expressions, split and average
    separators = [" ", ";", "、"]
    for sep in separators:
        if sep in expression:
            parts = [p.strip() for p in expression.split(sep) if p.strip()]
            freqs = [word_frequency(p, "ja") for p in parts]
            nonzero = [f for f in freqs if f > 0]
            if nonzero:
                return sum(nonzero) / len(nonzero)

    # Strategy 4: strip honorific prefix お and try again
    for form in [expression, reading]:
        if form.startswith("お") and len(form) > 1:
            freq = word_frequency(form[1:], "ja")
            if freq > 0:
                return freq

    return 0.0


def main():
    """Sort japaneasy_N5.csv by word frequency and write the ranked output."""
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(scripts_dir, "japaneasy_N5.csv")
    output_path = os.path.join(scripts_dir, "japaneasy_N5_sorted.csv")

    # Read CSV
    words = []
    with open(input_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            words.append(row)

    print(f"Loaded {len(words)} words from japaneasy_N5.csv")

    # Look up frequencies
    matched = []
    unmatched = []

    for word in words:
        freq = get_frequency(word["expression"], word["reading"])

        if freq > 0:
            word["frequency"] = f"{freq:.2e}"
            word["comment"] = ""
            matched.append((freq, word))
        else:
            word["frequency"] = "0"
            word["comment"] = "unmatched"
            unmatched.append(word)

    # Sort matched words by frequency descending
    matched.sort(key=lambda x: x[0], reverse=True)

    # Write output CSV
    output_fields = fieldnames + ["frequency", "comment"]
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=output_fields)
        writer.writeheader()
        for _, word in matched:
            writer.writerow(word)
        for word in unmatched:
            writer.writerow(word)

    print("\nResults:")
    print(f"  Matched:   {len(matched)}")
    print(f"  Unmatched: {len(unmatched)}")
    print("\nTop 10 most frequent words:")
    for i, (freq, word) in enumerate(matched[:10], 1):
        print(f"  {i:2d}. {word['expression']} ({word['reading']}) — {freq:.2e}")

    if unmatched:
        print("\nUnmatched words:")
        for word in unmatched:
            print(f"  - {word['expression']} ({word['reading']})")

    print(f"\nOutput written to: {output_path}")


if __name__ == "__main__":
    main()
