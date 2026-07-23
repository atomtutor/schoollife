import csv
import json
import os

src = "c:/Users/정선아/Desktop/슬기로운학교생활/수능연계_1800단어.csv"
out = "c:/Users/정선아/Desktop/슬기로운학교생활/wise-school-life/js/words.js"

rows = []
with open(src, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append({
            'id': int(row['No']) if row.get('No') else None,
            'word': row['English'].strip(),
            'meaning': row['Korean'].strip(),
        })

os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'w', encoding='utf-8') as f:
    f.write('window.WORDS_DATA = ')
    json.dump(rows, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f'generated {out} with {len(rows)} words')
