"""Verify Japanese word entries in a CSV against expected structure and values.

Usage (run from project root):
    python scripts/verify_words.py jpez_n5.csv
"""
import csv
import sys
import time
import os

from jisho_api.word import Word


def check_word(expression):
    """Look up an expression on jisho. Returns True if found."""
    try:
        result = Word.request(expression)
        return result is not None and len(result.data) > 0
    except (ValueError, ConnectionError, TimeoutError, OSError):
        return False


def main():
    """Read a CSV of Japanese words and verify each entry exists on Jisho."""
    if len(sys.argv) < 2:
        print("Usage: python verify_words.py <csv_filename>")
        print("Example: python verify_words.py jpez_n5.csv")
        sys.exit(1)

    csv_filename = sys.argv[1]
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(scripts_dir, csv_filename)

    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        sys.exit(1)

    # Read CSV
    words = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            words.append(row)

    total = len(words)
    print(f"Loaded {total} words from {csv_filename}\n")

    matches = []
    non_matches = []

    for i, word in enumerate(words, 1):
        expression = word["expression"]

        # Split semicolon-separated variants
        variants = [v.strip() for v in expression.split(";")]

        found = False
        for variant in variants:
            if check_word(variant):
                found = True
                break
            time.sleep(0.5)

        if found:
            matches.append(word)
        else:
            non_matches.append(word)

        if i % 10 == 0 or i == total:
            print(f"Checking {i}/{total}...")

    # Results
    print(f"\n{'='*50}")
    print("RESULTS")
    print(f"{'='*50}")
    print(f"Total words checked: {total}")
    print(f"Matches:     {len(matches)}")
    print(f"Non-matches: {len(non_matches)}")

    if non_matches:
        print(f"\n{'='*50}")
        print("NON-MATCHING WORDS")
        print(f"{'='*50}")
        for w in non_matches:
            expr = w["expression"]
            reading = w.get("reading", "")
            meaning = w.get("meaning", "")
            print(f"  {expr}  ({reading})  -  {meaning}")


if __name__ == "__main__":
    main()
