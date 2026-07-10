#!/usr/bin/env python3
"""
Core design utilities for UI/UX Pro Max skill.
Provides color manipulation, spacing calculations, and accessibility utilities.
"""

import colorsys
import csv
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def load_data_file(filename: str) -> List[Dict[str, str]]:
    """Load a CSV data file from the skill data directory."""
    data_dir = Path(__file__).parent.parent / "data"
    filepath = data_dir / filename
    
    if not filepath.exists():
        return []
    
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def get_color_palette() -> List[Dict[str, str]]:
    """Get the defined color palette."""
    return load_data_file("colors.csv")


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB values to hex color string."""
    return f"#{r:02x}{g:02x}{b:02x}"


def get_contrast_ratio(color1: str, color2: str) -> float:
    """Calculate contrast ratio between two colors (WCAG)."""
    def luminance(hex_color: str) -> float:
        r, g, b = [x / 255.0 for x in hex_to_rgb(hex_color)]
        r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
        g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
        b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    l1, l2 = luminance(color1), luminance(color2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def is_wcag_compliant(foreground: str, background: str, level: str = "AA") -> bool:
    """Check if color combination meets WCAG accessibility standards."""
    ratio = get_contrast_ratio(foreground, background)
    if level == "AAA":
        return ratio >= 7
    return ratio >= 4.5


def get_spacing_scale() -> List[int]:
    """Get the spacing scale in pixels."""
    return [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]


def rem_to_px(rem: float, base: int = 16) -> int:
    """Convert rem units to pixels."""
    return int(rem * base)


def px_to_rem(px: float, base: int = 16) -> float:
    """Convert pixels to rem units."""
    return round(px / base, 3)


if __name__ == "__main__":
    # Demo usage
    palette = get_color_palette()
    print(f"Loaded {len(palette)} colors from palette")
    
    if palette:
        primary = palette[0].get("hex", "#000000")
        white = "#FFFFFF"
        ratio = get_contrast_ratio(primary, white)
        print(f"Contrast ratio between {primary} and {white}: {ratio:.2f}")
        print(f"WCAG AA compliant: {is_wcag_compliant(primary, white)}")
