"""Export MongoDB collections to JSON files under backend/mongo_exports"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from backend.mongo import get_db

load_dotenv()

OUT_DIR = Path(__file__).resolve().parent / 'mongo_exports'
OUT_DIR.mkdir(exist_ok=True)

def export_collection(name):
    db = get_db()
    col = db[name]
    docs = list(col.find())
    # Convert ObjectId to str
    for d in docs:
        if '_id' in d:
            d['_id'] = str(d['_id'])
    with open(OUT_DIR / f"{name}.json", 'w', encoding='utf-8') as f:
        json.dump(docs, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(docs)} docs from {name} to {OUT_DIR / f'{name}.json'}")

def main():
    db = get_db()
    names = db.list_collection_names()
    for n in names:
        export_collection(n)

if __name__ == '__main__':
    main()
