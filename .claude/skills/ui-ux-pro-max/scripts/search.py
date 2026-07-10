#!/usr/bin/env python3
"""
Component and style search utilities for UI/UX Pro Max skill.
"""

import csv
import re
from pathlib import Path
from typing import Dict, List, Optional


def search_icons(query: str) -> List[Dict[str, str]]:
    """Search for icons by name or keyword."""
    data_dir = Path(__file__).parent.parent / "data"
    filepath = data_dir / "icons.csv"
    
    if not filepath.exists():
        return []
    
    results = []
    query_lower = query.lower()
    
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").lower()
            tags = row.get("tags", "").lower()
            if query_lower in name or query_lower in tags:
                results.append(row)
    
    return results


def search_colors(query: str) -> List[Dict[str, str]]:
    """Search for colors by name or hex value."""
    data_dir = Path(__file__).parent.parent / "data"
    filepath = data_dir / "colors.csv"
    
    if not filepath.exists():
        return []
    
    results = []
    query_lower = query.lower()
    
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").lower()
            hex_val = row.get("hex", "").lower()
            if query_lower in name or query_lower in hex_val:
                results.append(row)
    
    return results


def find_component_usage(component_name: str, source_dir: str) -> List[str]:
    """Find all usages of a component in source code."""
    usages = []
    src_path = Path(source_dir)
    
    if not src_path.exists():
        return usages
    
    pattern = re.compile(rf'<{component_name}[^/]*/?>' + rf'|</{component_name}>')
    
    for file_path in src_path.rglob("*.tsx"):
        content = file_path.read_text(encoding="utf-8")
        if pattern.search(content):
            # Count occurrences
            count = len(pattern.findall(content))
            usages.append(f"{file_path}: {count} usage(s)")
    
    return usages


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        query = sys.argv[1]
        print(f"Searching icons for: {query}")
        icons = search_icons(query)
        for icon in icons[:5]:
            print(f"  - {icon.get('name', 'unknown')}: {icon.get('hex', 'N/A')}")
    else:
        print("Usage: python search.py <query>")
