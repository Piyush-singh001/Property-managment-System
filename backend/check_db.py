r"""
Helper script to inspect the SQLite database (pms.db).
Usage:
    cd backend
    .\venv\Scripts\python.exe check_db.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "pms.db")

def check_database():
    if not os.path.exists(DB_PATH):
        print(f"[!] Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("=" * 65)
    print(f"DATABASE INSPECTION: {DB_PATH}")
    print("=" * 65)

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]

    print(f"Total Tables: {len(tables)}\n")

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        
        # Get column names
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col[1] for col in cursor.fetchall()]
        col_preview = ", ".join(columns[:5]) + ("..." if len(columns) > 5 else "")
        print(f"  * {table:<20} : {count:>4} rows   (cols: {col_preview})")

    print("\n" + "-" * 65)
    print("SAMPLE TABLE DATA:")
    print("-" * 65)

    # 1. Admins
    print("\n[admins]")
    cursor.execute("SELECT id, name, email, is_active FROM admins LIMIT 5;")
    for r in cursor.fetchall():
        print(f"  ID: {r[0]} | Name: {r[1]} | Email: {r[2]} | Active: {bool(r[3])}")

    # 2. Properties
    print("\n[properties (latest 3)]")
    cursor.execute("SELECT id, property_code, title, bhk, rent, property_status, publication_status FROM properties ORDER BY id DESC LIMIT 3;")
    for r in cursor.fetchall():
        print(f"  ID: {r[0]} | Code: {r[1]} | {r[2][:30]}... | {r[3]} | Rs.{r[4]} | Status: {r[5]} ({r[6]})")

    # 3. Customers
    print("\n[customers (latest 3)]")
    cursor.execute("SELECT id, name, mobile, email, preferred_bhk FROM customers ORDER BY id DESC LIMIT 3;")
    rows = cursor.fetchall()
    if rows:
        for r in rows:
            print(f"  ID: {r[0]} | Name: {r[1]} | Mobile: {r[2]} | Email: {r[3]} | Preferred: {r[4]}")
    else:
        print("  (No customers yet)")

    # 4. Enquiries
    print("\n[enquiries (latest 3)]")
    cursor.execute("SELECT id, customer_id, property_id, property_code, status, created_at FROM enquiries ORDER BY id DESC LIMIT 3;")
    rows = cursor.fetchall()
    if rows:
        for r in rows:
            print(f"  ID: {r[0]} | Cust ID: {r[1]} | Prop: {r[3]} | Status: {r[4]} | Created: {r[5]}")
    else:
        print("  (No enquiries yet)")

    # 5. Visits
    print("\n[visits (latest 3)]")
    cursor.execute("SELECT id, customer_id, property_code, scheduled_date, scheduled_time, status FROM visits ORDER BY id DESC LIMIT 3;")
    rows = cursor.fetchall()
    if rows:
        for r in rows:
            print(f"  ID: {r[0]} | Cust ID: {r[1]} | Prop: {r[2]} | Date: {r[3]} {r[4]} | Status: {r[5]}")
    else:
        print("  (No visits yet)")

    print("\n" + "=" * 65)
    conn.close()

if __name__ == "__main__":
    check_database()
