# ComfyUI-ATk-Nodes

**Ambrosinus ToolKit** - A comprehensive collection of custom nodes and workflow enhancements for ComfyUI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![ComfyUI](https://img.shields.io/badge/ComfyUI-Compatible-orange.svg)

<br>
<br>

<div align="center">
<img src="https://ambrosinus.altervista.org/blog/wp-content/uploads/2025/06/ATk_ComfyUI_menu_01.png" width="30%" height="30%">
<img src="https://ambrosinus.altervista.org/blog/wp-content/uploads/2025/06/ATk_ComfyUI_menu_02.png" width="25%" height="25%">
<img src="https://ambrosinus.altervista.org/blog/wp-content/uploads/2025/06/ATk_ComfyUI_menu_03.png" width="35%" height="35%">
</div>

<br>
<br>

## 🎞 Short video demo
<br>
<div align="center">
<a href="https://youtu.be/7WMHFhJ98fk" target="_blank"><img src="https://ambrosinus.altervista.org/blog/wp-content/uploads/2025/06/ATk_ComfyUI_Export_WF_timestamp.jpg" alt="Luciano Ambrosini EDD 24" width="45%" height="45%"></a>
</div>



## ✨ Features

### 🎯 **Advanced Workflow Export**
- **Simple Context Menu Access**: Right-click → "⚗️ ATk Menu" → "🎨 Workflow Export"
- **Intuitive Modal Dialog**: Modern dark UI with easy option selection
- **Multiple Export Formats**: PNG, JPG, WebP with embedded workflow metadata
- **Smart Scaling**: 1x, 2x, 3x, 4x resolution options with perfect text rendering
- **Transparent Background Support**: Professional transparent exports with custom themes

### 🎨 **Built-in Professional Themes**
- **ATk Dark (Transparent)**: Modern dark theme optimized for transparent exports
- **ATk Light (Transparent)**: Clean light theme with transparency support
- **Auto-Installation**: Themes are automatically installed and registered in ComfyUI
- **Smart Theme Detection**: Automatically finds and applies existing transparent themes
> [!NOTE]
> If you encounter any errors I recommend you to install them through ComfyUI settings by importing them from the theme folder
> <div align="left">
> <img src="https://ambrosinus.altervista.org/blog/wp-content/uploads/2025/06/install_them_manually_01.png" width="40%" height="40%">
> </div>
<br>

### 📐 **Export Options**
- **Resolution Scaling**: Choose from 1x to 4x zoom levels
- **Background Control**: Toggle transparent background on/off
- **Theme Selection**: Choose specific ATk theme for export or auto-detect existing ones
- **Custom Filenames**: Set custom names for exported files
- **Workflow Embedding**: Workflow data automatically embedded in PNG files

### 💡 **Technical Highlights**
- **Perfect Text Rendering**: Renders at 1x then scales for crisp text at any resolution
- **Non-Destructive**: Temporarily applies settings without affecting your current workspace
- **Format Optimization**: 
  - PNG: Full transparency support with embedded workflow
  - JPG: Automatic white background conversion for compatibility
  - WebP: Modern format with optimal compression
- **ComfyUI Portable Compatible**: Works seamlessly with all ComfyUI distributions

## 🚀 Installation

### Method 1: Git Clone (Recommended)

1. **Navigate to your ComfyUI custom_nodes directory:**
   ```bash
   cd /path/to/ComfyUI/custom_nodes/
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ComfyUI-ATk-Nodes.git
   ```

3. **Restart ComfyUI**
   - The plugin will automatically install and register ATk themes

### Method 2: Manual Download

1. **Download the ZIP file** from the [Releases page](https://github.com/yourusername/ComfyUI-ATk-Nodes/releases)

2. **Extract to custom_nodes:**
   ```
   ComfyUI/
   └── custom_nodes/
       └── ComfyUI-ATk-Nodes/
           ├── __init__.py
           ├── install.py
           ├── web/
           │   └── atk_workflow_export.js
           └── themes/
               ├── ATk_dark_theme.json
               └── ATk_light_theme.json
   ```

3. **Restart ComfyUI**

### Method 3: ComfyUI Manager

1. **Open ComfyUI Manager**
2. **Search for "ATk-Nodes"**
3. **Click Install**
4. **Restart ComfyUI**

## 📖 Usage

### Basic Workflow Export

1. **Right-click** on the ComfyUI canvas
2. **Select** "⚗️ ATk Menu" → "🎨 Workflow Export"
3. **Configure your export options:**
   - **Format**: Choose PNG, JPG, or WebP
   - **Filename**: Enter desired filename
   - **Resolution**: Select zoom level (1x-4x)
   - **Transparent Background**: Check for transparency
4. **Click Export**

### Advanced Features

#### **Transparent Background Export**
- Enable "Transparent Background" checkbox
- Choose ATk theme:
  - **Auto-detect**: Finds existing transparent themes
  - **ATk Dark**: Uses built-in dark transparent theme
  - **ATk Light**: Uses built-in light transparent theme

#### **High-Resolution Export**
- Select 2x, 3x, or 4x for high-DPI displays
- Text remains crisp at all resolutions
- Perfect for presentations and documentation

#### **Format Selection Guide**
- **PNG**: Best for transparency, workflow embedding, highest quality
- **JPG**: Smaller file sizes, no transparency (converts to white background)
- **WebP**: Modern format, good compression, transparency support

## 🎨 ATk Themes

The plugin includes two professionally designed themes optimized for workflow exports:

### ATk Dark (Transparent)
- Modern dark color scheme
- Transparent background
- High contrast for readability
- Optimized node colors

### ATk Light (Transparent)
- Clean light interface
- Transparent background
- Professional appearance
- Clear visual hierarchy

**Note**: Themes are automatically installed to `ComfyUI/user/color_palettes/` and registered in ComfyUI settings.

## 🔧 Technical Details

### Requirements
- ComfyUI (any recent version)
- Modern web browser with Canvas support
- No additional dependencies required

### Compatibility
- ✅ ComfyUI Standard
- ✅ ComfyUI Portable
- ✅ All major operating systems
- ✅ All modern browsers

### File Structure
```
ComfyUI-ATk-Nodes/
├── __init__.py              # Main plugin initialization
├── install.py               # Theme auto-installation
├── requirements.txt         # Dependencies (empty - no requirements)
├── README.md               # This documentation
├── web/
│   └── atk_workflow_export.js  # Main export functionality
└── themes/
    ├── ATk_dark_theme.json     # Dark transparent theme
    └── ATk_light_theme.json    # Light transparent theme
```

## 🔍 Troubleshooting

### Common Issues

**Q: Themes not appearing in ComfyUI**
- **A**: Restart ComfyUI after installation. Themes are auto-installed on first load.

**Q: Export dialog not appearing**
- **A**: Make sure you right-click on the canvas (not on a node) and look for "⚗️ ATk Menu".

**Q: Transparent background not working**
- **A**: Enable "Transparent Background" checkbox and select an ATk theme. PNG format recommended for transparency.

**Q: High resolution exports are blurry**
- **A**: ATk-Nodes renders at 1x then scales up to maintain text sharpness. This is the intended behavior.

### Debug Information
Check the browser console (F12) for detailed logging:
- Theme registration status
- Export process steps
- Error messages if any

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Clone your fork to `ComfyUI/custom_nodes/`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues
Please include:
- ComfyUI version
- Browser information
- Steps to reproduce
- Console error messages (if any)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ComfyUI team for the amazing framework
- Community contributors and testers
- Users providing feedback and suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/lucianoambrosini/ComfyUI-ATk-Nodes/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lucianoambrosini/ComfyUI-ATk-Nodes/discussions)
- **Documentation**: This README and inline code comments

---

**Created with ❤️ by Luciano Ambrosini (Ambrosinus)**

*If you find this plugin useful, please consider giving it a ⭐ on GitHub!*
