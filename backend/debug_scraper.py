"""Debug script to inspect the actual HTML structure"""
import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://stake.vaulto.ai"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get(BASE_URL, headers=headers, timeout=10)
soup = BeautifulSoup(response.content, 'html.parser')

# Find all tables
tables = soup.find_all('table')
print(f"Found {len(tables)} tables")

for table_idx, table in enumerate(tables):
    print(f"\n=== Table {table_idx} ===")
    rows = table.find_all('tr')
    print(f"Rows: {len(rows)}")
    
    # Print first 5 rows
    for row_idx, row in enumerate(rows[:5]):
        cells = row.find_all(['td', 'th'])
        print(f"\nRow {row_idx} ({len(cells)} cells):")
        for cell_idx, cell in enumerate(cells):
            text = cell.get_text(strip=True)
            print(f"  Cell {cell_idx}: '{text}'")
            
# Look for script tags that might contain data
scripts = soup.find_all('script')
print(f"\n=== Found {len(scripts)} script tags ===")
for script_idx, script in enumerate(scripts[:3]):
    script_content = script.string
    if script_content and ('pool' in script_content.lower() or 'tvl' in script_content.lower()):
        print(f"\nScript {script_idx} (first 500 chars):")
        print(script_content[:500])

# Save HTML for inspection
with open('/tmp/debug_page.html', 'w', encoding='utf-8') as f:
    f.write(soup.prettify())
print("\n=== Saved HTML to /tmp/debug_page.html ===")
