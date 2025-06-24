import os
import shutil
import json

def install_themes():
    """Installa automaticamente i temi ATk in ComfyUI"""
    try:
        # Trova la cartella di ComfyUI
        import folder_paths
        comfyui_dir = folder_paths.base_path
        
        # Cartella dei temi utente
        user_themes_dir = os.path.join(comfyui_dir, "user", "color_palettes")
        os.makedirs(user_themes_dir, exist_ok=True)
        
        # Cartella dei nostri temi
        current_dir = os.path.dirname(__file__)
        themes_dir = os.path.join(current_dir, "themes")
        
        # Copia i temi
        for theme_file in ["ATk_dark_theme.json", "ATk_light_theme.json"]:
            src = os.path.join(themes_dir, theme_file)
            dst = os.path.join(user_themes_dir, theme_file)
            
            if os.path.exists(src):
                shutil.copy2(src, dst)
                print(f"✅ Installed ATk theme: {theme_file}")
        
        print("🎨 ATk themes installed successfully!")
        
    except Exception as e:
        print(f"❌ Error installing themes: {e}")

# Esegui l'installazione quando il modulo viene importato
install_themes()