# custom_nodes/comfyui-ATk-nodes/__init__.py

"""
ATk Nodes - Ambrosinus ToolKit for ComfyUI
Custom nodes and extensions collection

Author: Luciano Ambrosini (Ambrosinus)
Version: 1.0.0
License: MIT
GitHub: https://github.com/lucianoambrosini/ComfyUI-ATk-Nodes
"""

from .install import install_themes

# Install themes automatically
install_themes()

# Node Metadata
WEB_DIRECTORY = "./web"
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

# Metadata for ComfyUI Manager
__version__ = "1.0.0"
__author__ = "Luciano Ambrosini (Ambrosinus)"
__description__ = "Advanced workflow export and professional themes for ComfyUI"
__license__ = "MIT"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]