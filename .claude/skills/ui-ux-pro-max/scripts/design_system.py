#!/usr/bin/env python3
"""
Design system management for UI/UX Pro Max skill.
Handles component library, design tokens, and style guide enforcement.
"""

import csv
import json
from pathlib import Path
from typing import Any, Dict, List, Optional


class DesignSystem:
    """Manages design system tokens, components, and style rules."""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent / "data"
        self.colors = self._load_colors()
        self.typography = self._load_typography()
        self.spacing = self._load_spacing()
        self.icons = self._load_icons()
    
    def _load_colors(self) -> List[Dict[str, str]]:
        """Load color definitions."""
        filepath = self.data_dir / "colors.csv"
        if not filepath.exists():
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))
    
    def _load_typography(self) -> List[Dict[str, str]]:
        """Load typography scale."""
        filepath = self.data_dir / "typography.csv"
        if not filepath.exists():
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))
    
    def _load_spacing(self) -> List[int]:
        """Get standard spacing scale."""
        return [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
    
    def _load_icons(self) -> List[Dict[str, str]]:
        """Load icon definitions."""
        filepath = self.data_dir / "icons.csv"
        if not filepath.exists():
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))
    
    def get_color(self, name: str) -> Optional[str]:
        """Get a color by name."""
        for color in self.colors:
            if color.get("name") == name:
                return color.get("hex")
        return None
    
    def get_font_size(self, level: str) -> Optional[str]:
        """Get font size for a typography level."""
        for t in self.typography:
            if t.get("level") == level:
                return t.get("size")
        return None
    
    def validate_component(self, component_name: str, styles: Dict[str, Any]) -> List[str]:
        """Validate a component's styles against the design system."""
        issues = []
        
        # Check if colors are from the design system
        if "color" in styles:
            color = styles["color"]
            if not any(c.get("hex") == color for c in self.colors):
                issues.append(f"Color {color} is not in the design system palette")
        
        # Check font sizes
        if "fontSize" in styles:
            font_size = styles["fontSize"]
            if not any(t.get("size") == str(font_size) for t in self.typography):
                issues.append(f"Font size {font_size} is not in the typography scale")
        
        return issues
    
    def export_tokens(self) -> Dict[str, Any]:
        """Export design tokens as a dictionary."""
        return {
            "colors": self.colors,
            "typography": self.typography,
            "spacing": self.spacing,
            "icons": self.icons,
        }
    
    def export_tokens_json(self) -> str:
        """Export design tokens as JSON string."""
        return json.dumps(self.export_tokens(), indent=2)


# Global instance
design_system = DesignSystem()


def get_design_system() -> DesignSystem:
    """Get the global design system instance."""
    return design_system


if __name__ == "__main__":
    ds = get_design_system()
    print("Design System Tokens:")
    print(ds.export_tokens_json())
