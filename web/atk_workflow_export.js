// File: custom_nodes/comfyui-ATk-nodes/web/atk_workflow_export.js

import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

let getDrawTextConfig = null;

class WorkflowImage {
	getBounds() {
		// Calculate the min max bounds for the nodes on the graph
		const bounds = app.graph._nodes.reduce(
			(p, n) => {
				if (n.pos[0] < p[0]) p[0] = n.pos[0];
				if (n.pos[1] < p[1]) p[1] = n.pos[1];
				const bounds = n.getBounding();
				const r = n.pos[0] + bounds[2];
				const b = n.pos[1] + bounds[3];
				if (r > p[2]) p[2] = r;
				if (b > p[3]) p[3] = b;
				return p;
			},
			[99999, 99999, -99999, -99999]
		);

		bounds[0] -= 100;
		bounds[1] -= 100;
		bounds[2] += 100;
		bounds[3] += 100;
		return bounds;
	}

	saveState() {
		this.state = {
			scale: app.canvas.ds.scale,
			width: app.canvas.canvas.width,
			height: app.canvas.canvas.height,
			offset: [...app.canvas.ds.offset],
			transform: app.canvas.canvas.getContext("2d").getTransform(),
			// Save background settings
			clearBackgroundColor: app.canvas.clear_background_color,
			bgColor: app.canvas.canvas.style.backgroundColor || '',
			canvasElementBgColor: app.canvasEl.style.backgroundColor || '',
			// Save CSS size
			canvasStyleWidth: app.canvas.canvas.style.width,
			canvasStyleHeight: app.canvas.canvas.style.height
		};
	}

	restoreState() {
		app.canvas.ds.scale = this.state.scale;
		app.canvas.canvas.width = this.state.width;
		app.canvas.canvas.height = this.state.height;
		app.canvas.ds.offset = this.state.offset;
		app.canvas.canvas.getContext("2d").setTransform(this.state.transform);
		// Restore background settings
		app.canvas.clear_background_color = this.state.clearBackgroundColor;
		app.canvas.canvas.style.backgroundColor = this.state.bgColor;
		app.canvasEl.style.backgroundColor = this.state.canvasElementBgColor;
		// Restore CSS size
		app.canvas.canvas.style.width = this.state.canvasStyleWidth;
		app.canvas.canvas.style.height = this.state.canvasStyleHeight;
	}

	updateView(bounds, zoomFactor = 1) {
		// Renders always at scale 1, then scales the final image
		const scale = window.devicePixelRatio || 1;
		app.canvas.ds.scale = 1; // Always 1 to maintain correct text
		app.canvas.canvas.width = (bounds[2] - bounds[0]) * scale;
		app.canvas.canvas.height = (bounds[3] - bounds[1]) * scale;
		app.canvas.ds.offset = [-bounds[0], -bounds[1]];
		app.canvas.canvas.getContext("2d").setTransform(scale, 0, 0, scale, 0, 0);
	}

	getDrawTextConfig(_, widget) {
		return {
			x: 10,
			y: widget.last_y + 10,
			resetTransform: false,
		};
	}

	// Method to scale the image AFTER rendering WITH transparency handling
	async scaleCanvas(originalCanvas, zoomFactor, transparentBackground = false) {
		if (zoomFactor === 1) {
			return originalCanvas;
		}

		// Create a new canvas with scaled dimensions
		const scaledCanvas = document.createElement("canvas");
		scaledCanvas.width = originalCanvas.width * zoomFactor;
		scaledCanvas.height = originalCanvas.height * zoomFactor;
		
		const ctx = scaledCanvas.getContext("2d");
		
		// If transparency requested, DO NOT fill the background
		if (!transparentBackground) {
			// Only if NOT transparent, fill with background color
			ctx.fillStyle = app.canvas.clear_background_color || "#353535";
			ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
		}
		// Otherwise leave transparent (canvas is already transparent by default)
		
		// Disable anti-aliasing for cleaner scaling
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		
		// Scale the image
		ctx.drawImage(originalCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
		
		return scaledCanvas;
	}

	// Corrects the registration method for ComfyUI Portable (uses CustomColorPalettes)
	async registerATkThemes() {
		try {
			const themes = this.getATkThemes();
			
			// ComfyUI Portable uses Comfy.CustomColorPalettes (not Comfy.ColorPalettes)
			if (app.ui?.settings) {
				// Get existing custom palettes
				let customPalettes = app.ui.settings.getSettingValue("Comfy.CustomColorPalettes") || {};
				let updated = false;
				
				for (const [id, theme] of Object.entries(themes)) {
					// Check if theme already exists
					if (!customPalettes[id]) {
						// Add theme to custom palettes
						customPalettes[id] = theme;
						updated = true;
						console.log(`✅ Added ATk theme to CustomColorPalettes: ${theme.name}`);
					} else {
						console.log(`📋 ATk theme already exists in CustomColorPalettes: ${theme.name}`);
					}
				}
				
				// Save updated palettes if there are changes
				if (updated) {
					try {
						await app.ui.settings.setSettingValue("Comfy.CustomColorPalettes", customPalettes);
						console.log("💾 ATk themes saved to Comfy.CustomColorPalettes");
						
						// Force save settings
						if (app.ui.settings.store) {
							await app.ui.settings.store();
						}
					} catch (saveError) {
						console.warn("Error saving CustomColorPalettes:", saveError);
					}
				}
			}
			
			// Backup method: colorPalettes in memory
			if (app.ui && app.ui.colorPalettes) {
				for (const [id, theme] of Object.entries(themes)) {
					if (!app.ui.colorPalettes[id]) {
						app.ui.colorPalettes[id] = theme;
						console.log(`📝 Added ${theme.name} to memory palettes`);
					}
				}
			}
			
		} catch (error) {
			console.warn("Error registering ATk themes:", error);
		}
	}

	// Search themes in ComfyUI settings (updated for CustomColorPalettes)
	async findThemeInSettings(themeId) {
		try {
			// Search in custom palettes (CustomColorPalettes)
			if (app.ui?.settings) {
				const customPalettes = app.ui.settings.getSettingValue("Comfy.CustomColorPalettes");
				if (customPalettes && customPalettes[themeId]) {
					console.log(`🔍 Found theme in CustomColorPalettes: ${customPalettes[themeId].name}`);
					return customPalettes[themeId];
				}
				
				// Fallback: search in standard palettes (if they exist)
				const palettes = app.ui.settings.getSettingValue("Comfy.ColorPalettes");
				if (palettes && Array.isArray(palettes)) {
					const theme = palettes.find(p => p.id === themeId);
					if (theme) {
						console.log(`🔍 Found theme in ColorPalettes: ${theme.name}`);
						return theme;
					}
				}
			}
			
			// Search in memory
			if (app.ui?.colorPalettes?.[themeId]) {
				console.log(`🔍 Found theme in memory: ${themeId}`);
				return app.ui.colorPalettes[themeId];
			}
			
			return null;
		} catch (error) {
			console.warn("Error searching theme in settings:", error);
			return null;
		}
	}

	getATkThemes() {
		return {
			"ATk_dark_theme": {
				"id": "ATk_dark_theme",
				"name": "ATk Dark (Trans)",
				"colors": {
					"node_slot": {
						"CLIP": "#FFD500",
						"CLIP_VISION": "#A8DADC",
						"CLIP_VISION_OUTPUT": "#ad7452",
						"CONDITIONING": "#FFA931",
						"CONTROL_NET": "#6EE7B7",
						"IMAGE": "#64B5F6",
						"LATENT": "#FF9CF9",
						"MASK": "#81C784",
						"MODEL": "#B39DDB",
						"STYLE_MODEL": "#C2FFAE",
						"VAE": "#FF6E6E",
						"NOISE": "#B0B0B0",
						"GUIDER": "#66FFFF",
						"SAMPLER": "#ECB4B4",
						"SIGMAS": "#CDFFCD",
						"TAESD": "#DCC274"
					},
					"litegraph_base": {
						"BACKGROUND_IMAGE": "none",
						"CLEAR_BACKGROUND_COLOR": "transparent",
						"NODE_TITLE_COLOR": "#999",
						"NODE_SELECTED_TITLE_COLOR": "#FFF",
						"NODE_TEXT_SIZE": 14,
						"NODE_TEXT_COLOR": "#AAA",
						"NODE_TEXT_HIGHLIGHT_COLOR": "#FFF",
						"NODE_SUBTEXT_SIZE": 12,
						"NODE_DEFAULT_COLOR": "#333",
						"NODE_DEFAULT_BGCOLOR": "#353535",
						"NODE_DEFAULT_BOXCOLOR": "#666",
						"NODE_DEFAULT_SHAPE": 2,
						"NODE_BOX_OUTLINE_COLOR": "#FFF",
						"NODE_BYPASS_BGCOLOR": "#FF00FF",
						"NODE_ERROR_COLOUR": "#E00",
						"DEFAULT_SHADOW_COLOR": "rgba(0,0,0,0.5)",
						"DEFAULT_GROUP_FONT": 24,
						"WIDGET_BGCOLOR": "#222",
						"WIDGET_OUTLINE_COLOR": "#666",
						"WIDGET_TEXT_COLOR": "#DDD",
						"WIDGET_SECONDARY_TEXT_COLOR": "#999",
						"WIDGET_DISABLED_TEXT_COLOR": "#666",
						"LINK_COLOR": "#9A9",
						"EVENT_LINK_COLOR": "#A86",
						"CONNECTING_LINK_COLOR": "#AFA",
						"BADGE_FG_COLOR": "#FFF",
						"BADGE_BG_COLOR": "#0F1F0F"
					},
					"comfy_base": {
						"fg-color": "#fff",
						"bg-color": "transparent",
						"comfy-menu-bg": "#353535",
						"comfy-menu-secondary-bg": "#303030",
						"comfy-input-bg": "#222",
						"input-text": "#ddd",
						"descrip-text": "#999",
						"drag-text": "#ccc",
						"error-text": "#ff4444",
						"border-color": "#4e4e4e",
						"tr-even-bg-color": "#222",
						"tr-odd-bg-color": "#353535",
						"content-bg": "#4e4e4e",
						"content-fg": "#fff",
						"content-hover-bg": "#222",
						"content-hover-fg": "#fff",
						"bar-shadow": "rgba(16, 16, 16, 0.5) 0 0 0.5rem"
					}
				}
			},
			"ATk_light_theme": {
				"id": "ATk_light_theme",
				"name": "ATk Light (Trans)",
				"light_theme": true,
				"colors": {
					"node_slot": {
						"CLIP": "#FFA726",
						"CLIP_VISION": "#5C6BC0",
						"CLIP_VISION_OUTPUT": "#8D6E63",
						"CONDITIONING": "#EF5350",
						"CONTROL_NET": "#66BB6A",
						"IMAGE": "#42A5F5",
						"LATENT": "#AB47BC",
						"MASK": "#9CCC65",
						"MODEL": "#7E57C2",
						"STYLE_MODEL": "#D4E157",
						"VAE": "#FF7043",
						"NOISE": "#B0B0B0",
						"GUIDER": "#66FFFF",
						"SAMPLER": "#ECB4B4",
						"SIGMAS": "#CDFFCD",
						"TAESD": "#DCC274"
					},
					"litegraph_base": {
						"BACKGROUND_IMAGE": "none",
						"CLEAR_BACKGROUND_COLOR": "transparent",
						"NODE_TITLE_COLOR": "#222",
						"NODE_SELECTED_TITLE_COLOR": "#000",
						"NODE_TEXT_SIZE": 14,
						"NODE_TEXT_COLOR": "#444",
						"NODE_TEXT_HIGHLIGHT_COLOR": "#1e293b",
						"NODE_SUBTEXT_SIZE": 12,
						"NODE_DEFAULT_COLOR": "#F7F7F7",
						"NODE_DEFAULT_BGCOLOR": "#F5F5F5",
						"NODE_DEFAULT_BOXCOLOR": "#CCC",
						"NODE_DEFAULT_SHAPE": 2,
						"NODE_BOX_OUTLINE_COLOR": "#000",
						"NODE_BYPASS_BGCOLOR": "#FF00FF",
						"NODE_ERROR_COLOUR": "#E00",
						"DEFAULT_SHADOW_COLOR": "rgba(0,0,0,0.1)",
						"DEFAULT_GROUP_FONT": 24,
						"WIDGET_BGCOLOR": "#D4D4D4",
						"WIDGET_OUTLINE_COLOR": "#999",
						"WIDGET_TEXT_COLOR": "#222",
						"WIDGET_SECONDARY_TEXT_COLOR": "#555",
						"WIDGET_DISABLED_TEXT_COLOR": "#999",
						"LINK_COLOR": "#4CAF50",
						"EVENT_LINK_COLOR": "#FF9800",
						"CONNECTING_LINK_COLOR": "#2196F3",
						"BADGE_FG_COLOR": "#000",
						"BADGE_BG_COLOR": "#FFF"
					},
					"comfy_base": {
						"fg-color": "#222",
						"bg-color": "transparent",
						"comfy-menu-bg": "#F5F5F5",
						"comfy-menu-hover-bg": "#ccc",
						"comfy-menu-secondary-bg": "#EEE",
						"comfy-input-bg": "#C9C9C9",
						"input-text": "#222",
						"descrip-text": "#444",
						"drag-text": "#555",
						"error-text": "#F44336",
						"border-color": "#888",
						"tr-even-bg-color": "#f9f9f9",
						"tr-odd-bg-color": "#fff",
						"content-bg": "#e0e0e0",
						"content-fg": "#222",
						"content-hover-bg": "#adadad",
						"content-hover-fg": "#222",
						"bar-shadow": "rgba(16, 16, 16, 0.25) 0 0 0.5rem"
					}
				}
			}
		};
	}

	// Modified method to use specific selected theme (ComfyUI Portable version)
	async setTransparentBackground(selectedTheme = "auto") {
		try {
			// Save current theme
			this.originalTheme = await this.getCurrentTheme();
			
			let transparentTheme = null;
			
			if (selectedTheme === "dark") {
				// First search in settings, then use integrated one
				transparentTheme = await this.findThemeInSettings("ATk_dark_theme");
				if (!transparentTheme) {
					transparentTheme = this.getATkThemes()["ATk_dark_theme"];
					console.log("Using integrated ATk Dark theme");
				}
			} else if (selectedTheme === "light") {
				// First search in settings, then use integrated one
				transparentTheme = await this.findThemeInSettings("ATk_light_theme");
				if (!transparentTheme) {
					transparentTheme = this.getATkThemes()["ATk_light_theme"];
					console.log("Using integrated ATk Light theme");
				}
			} else {
				// Auto: search existing transparent theme
				transparentTheme = await this.findTransparentTheme();
				if (!transparentTheme) {
					// Fallback to integrated dark
					transparentTheme = this.getATkThemes()["ATk_dark_theme"];
					console.log("No transparent theme found, using integrated ATk Dark as fallback");
				}
			}
			
			if (transparentTheme) {
				console.log("Applying transparent theme:", transparentTheme.name || transparentTheme.id);
				const success = await this.applyExistingTheme(transparentTheme);
				if (!success) {
					console.warn("Theme application failed, using direct transparency");
					this.applyDirectTransparency();
				}
			} else {
				console.log("No transparent theme available, using direct transparency");
				this.applyDirectTransparency();
			}
			
		} catch (error) {
			console.warn("Error setting transparent background:", error);
			// Fallback to direct method
			this.applyDirectTransparency();
		}
	}

	// Search for existing transparent theme
	async findTransparentTheme() {
		try {
			// Method 1: Search in loaded ComfyUI themes
			if (app.ui?.colorPalettes) {
				const palettes = app.ui.colorPalettes;
				
				// Search themes with names indicating transparency
				const transparentNames = [
					"dark_trans", "Dark (Transparent Background)", 
					"transparent", "dark transparent", "Dark Transparent"
				];
				
				for (const [id, palette] of Object.entries(palettes)) {
					if (transparentNames.some(name => 
						id.toLowerCase().includes(name.toLowerCase()) || 
						palette.name?.toLowerCase().includes(name.toLowerCase())
					)) {
						console.log("Found transparent theme by name:", id, palette.name);
						return { id, ...palette };
					}
				}
				
				// Search themes with transparent CLEAR_BACKGROUND_COLOR
				for (const [id, palette] of Object.entries(palettes)) {
					if (palette.colors?.litegraph_base?.CLEAR_BACKGROUND_COLOR === "transparent") {
						console.log("Found transparent theme by color:", id);
						return { id, ...palette };
					}
				}
			}
			
			// Method 2: Search in saved settings
			if (localStorage) {
				const savedPalettes = localStorage.getItem("Comfy.ColorPalettes");
				if (savedPalettes) {
					const palettes = JSON.parse(savedPalettes);
					for (const palette of palettes) {
						if (palette.colors?.litegraph_base?.CLEAR_BACKGROUND_COLOR === "transparent") {
							console.log("Found transparent theme in localStorage:", palette.id);
							return palette;
						}
					}
				}
			}
			
			return null;
		} catch (error) {
			console.warn("Error finding transparent theme:", error);
			return null;
		}
	}

	// Corrected version for ComfyUI Portable and CustomColorPalettes
	async applyExistingTheme(theme) {
		try {
			console.log(`🎨 Applying theme: ${theme.name || theme.id}`);
			
			// First ensure theme is available in CustomColorPalettes
			if (app.ui?.settings) {
				const customPalettes = app.ui.settings.getSettingValue("Comfy.CustomColorPalettes") || {};
				
				if (!customPalettes[theme.id]) {
					console.log(`📝 Adding theme to CustomColorPalettes: ${theme.id}`);
					customPalettes[theme.id] = theme;
					try {
						await app.ui.settings.setSettingValue("Comfy.CustomColorPalettes", customPalettes);
						console.log("💾 Theme added to CustomColorPalettes");
					} catch (saveError) {
						console.warn("Could not save to CustomColorPalettes, continuing with manual application");
					}
				}
				
				// Try to apply theme via API
				try {
					console.log("🔄 Applying theme via API");
					await app.ui.settings.setSettingValue("Comfy.ColorPalette", theme.id);
					await new Promise(resolve => setTimeout(resolve, 400));
					
					// Verify if it works
					if (app.canvas.clear_background_color === "transparent") {
						console.log("✅ API application successful!");
						return true;
					}
				} catch (apiError) {
					console.log("⚠️ API failed, using manual application:", apiError.message);
				}
			}
			
			// Fallback: Manual application (more reliable)
			console.log("🔧 Applying theme manually");
			this.applyColorsDirectly(theme.colors);
			
			// Verify with a short delay
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Check if transparency was applied
			const bgColor = app.canvas.clear_background_color;
			const isTransparent = bgColor === "transparent" || 
								bgColor === "#00000000" || 
								bgColor === "rgba(0,0,0,0)";
			
			if (isTransparent) {
				console.log("✅ Manual application successful!");
				return true;
			} else {
				console.warn(`❌ Application failed. Background is: ${bgColor}`);
				return false;
			}
			
		} catch (error) {
			console.warn("Error applying theme:", error);
			return false;
		}
	}

	// Fallback: apply transparency directly
	applyDirectTransparency() {
		console.log("Applying direct transparency fallback");
		app.canvas.clear_background_color = "transparent";
		app.canvas.canvas.style.backgroundColor = "transparent";
		app.canvasEl.style.backgroundColor = "transparent";
		
		// Force LiteGraph too
		if (window.LiteGraph) {
			window.LiteGraph.CLEAR_BACKGROUND_COLOR = "transparent";
			window.LiteGraph.BACKGROUND_IMAGE = "none";
		}
		
		// CSS Variables
		document.documentElement.style.setProperty('--bg-color', 'transparent');
	}

	// Get current theme
	async getCurrentTheme() {
		try {
			if (app.ui?.settings?.getSettingValue) {
				const currentPalette = app.ui.settings.getSettingValue("Comfy.ColorPalette");
				console.log("Current theme ID:", currentPalette);
				return { id: currentPalette };
			}
			return { id: "default" };
		} catch (error) {
			console.warn("Error getting current theme:", error);
			return { id: "default" };
		}
	}

	// Apply colors directly
	applyColorsDirectly(colors) {
		if (colors?.litegraph_base) {
			const lg = colors.litegraph_base;
			if (lg.CLEAR_BACKGROUND_COLOR !== undefined) {
				app.canvas.clear_background_color = lg.CLEAR_BACKGROUND_COLOR;
				if (window.LiteGraph) {
					window.LiteGraph.CLEAR_BACKGROUND_COLOR = lg.CLEAR_BACKGROUND_COLOR;
				}
			}
			if (lg.BACKGROUND_IMAGE !== undefined && window.LiteGraph) {
				window.LiteGraph.BACKGROUND_IMAGE = lg.BACKGROUND_IMAGE;
			}
		}
		
		if (colors?.comfy_base) {
			const comfy = colors.comfy_base;
			Object.keys(comfy).forEach(key => {
				const cssVar = `--${key}`;
				document.documentElement.style.setProperty(cssVar, comfy[key]);
			});
		}
	}

	// Restore original theme
	async restoreOriginalTheme() {
		if (this.originalTheme?.id) {
			try {
				console.log("Restoring original theme:", this.originalTheme.id);
				if (app.ui?.settings?.setSettingValue) {
					await app.ui.settings.setSettingValue("Comfy.ColorPalette", this.originalTheme.id);
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			} catch (error) {
				console.warn("Error restoring theme:", error);
			}
		}
	}

	async export(options = {}) {
		const { 
			zoomFactor = 1, 
			transparentBackground = false, 
			selectedTheme = "auto",
			filename = "workflow"
		} = options;
		
		console.log("Exporting with zoom:", zoomFactor, "transparent:", transparentBackground, "theme:", selectedTheme);
		
		// Save the current state of the canvas
		this.saveState();
		
		try {
			// Apply transparent theme if requested with selected theme
			if (transparentBackground) {
				await this.setTransparentBackground(selectedTheme);
			}
			
			// Update to render the whole workflow (ALWAYS at zoom 1)
			this.updateView(this.getBounds(), 1);

			// Flag that we are saving and render the canvas
			getDrawTextConfig = this.getDrawTextConfig;
			app.canvas.draw(true, true);
			getDrawTextConfig = null;

			// Get the original canvas
			const originalCanvas = app.canvas.canvas;
			
			// Scale the canvas if necessary
			const finalCanvas = await this.scaleCanvas(originalCanvas, zoomFactor, transparentBackground);

			// Generate a blob of the final scaled image
			const blob = await this.getBlobFromCanvas(finalCanvas, JSON.stringify(app.graph.serialize()));

			// Download the generated image
			this.download(blob, filename);
			
		} finally {
			// Always restore state and theme even if something fails
			this.restoreState();
			
			// Restore original theme if it was modified
			if (transparentBackground && this.originalTheme) {
				await this.restoreOriginalTheme();
			}
			
			app.canvas.draw(true, true);
		}
	}

	// Method that uses final canvas instead of app.canvasEl WITH better transparency handling
	async getBlobFromCanvas(canvas, workflow) {
		return new Promise((resolve) => {
			// Determine correct MIME type for transparency
			let mimeType = `image/${this.extension}`;
			let quality = this.extension === "jpg" ? 0.95 : 1.0;
			
			// For PNG, make sure it supports transparency
			if (this.extension === "png") {
				// Don't specify any background color, let PNG maintain transparency
				canvas.toBlob(async (blob) => {
					if (workflow && this.extension === "png") {
						// Only for PNG, embed the workflow
						const buffer = await blob.arrayBuffer();
						const typedArr = new Uint8Array(buffer);
						const view = new DataView(buffer);

						const data = new TextEncoder().encode(`tEXtworkflow\0${workflow}`);
						const chunk = this.joinArrayBuffer(this.n2b(data.byteLength - 4), data, this.n2b(this.crc32(data)));

						const sz = view.getUint32(8) + 20;
						const result = this.joinArrayBuffer(typedArr.subarray(0, sz), chunk, typedArr.subarray(sz));

						blob = new Blob([result], { type: "image/png" });
					}
					resolve(blob);
				}, mimeType, quality);
			} else {
				// For other formats, use normal method
				canvas.toBlob(resolve, mimeType, quality);
			}
		});
	}

	download(blob, filename = "workflow") {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		Object.assign(a, {
			href: url,
			download: `${filename}.${this.extension}`,
			style: "display: none",
		});
		document.body.append(a);
		a.click();
		setTimeout(function () {
			a.remove();
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

class PngWorkflowImage extends WorkflowImage {
	extension = "png";

	n2b(n) {
		return new Uint8Array([(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
	}

	joinArrayBuffer(...bufs) {
		const result = new Uint8Array(bufs.reduce((totalSize, buf) => totalSize + buf.byteLength, 0));
		bufs.reduce((offset, buf) => {
			result.set(buf, offset);
			return offset + buf.byteLength;
		}, 0);
		return result;
	}

	crc32(data) {
		const crcTable =
			PngWorkflowImage.crcTable ||
			(PngWorkflowImage.crcTable = (() => {
				let c;
				const crcTable = [];
				for (let n = 0; n < 256; n++) {
					c = n;
					for (let k = 0; k < 8; k++) {
						c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
					}
					crcTable[n] = c;
				}
				return crcTable;
			})());
		let crc = 0 ^ -1;
		for (let i = 0; i < data.byteLength; i++) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
		}
		return (crc ^ -1) >>> 0;
	}
}

class WebpWorkflowImage extends WorkflowImage {
	extension = "webp";
}

class JpgWorkflowImage extends WorkflowImage {
	extension = "jpg";

	async getBlobFromCanvas(canvas, workflow) {
		return new Promise((resolve) => {
			// For JPG, handle transparency by converting to white
			if (app.canvas.clear_background_color === "transparent") {
				// Create a canvas with white background for JPG
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = canvas.width;
				tempCanvas.height = canvas.height;
				const tempCtx = tempCanvas.getContext("2d");
				
				// Fill with white for JPG (doesn't support transparency)
				tempCtx.fillStyle = "#FFFFFF";
				tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
				
				// Draw the original canvas on top
				tempCtx.drawImage(canvas, 0, 0);
				
				tempCanvas.toBlob(resolve, "image/jpeg", 0.95);
			} else {
				canvas.toBlob(resolve, "image/jpeg", 0.95);
			}
		});
	}
}

// Create export dialog
function createExportDialog() {
	const dialog = document.createElement("div");
	dialog.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #2a2a2a;
		border: 1px solid #555;
		border-radius: 8px;
		padding: 20px;
		z-index: 10000;
		color: white;
		font-family: Arial, sans-serif;
		box-shadow: 0 4px 20px rgba(0,0,0,0.5);
		min-width: 350px;
	`;

	dialog.innerHTML = `
		<h3 style="margin: 0 0 20px 0; color: #fff; text-align: center;">🎨 ATk Workflow Export</h3>
		
		<div style="margin-bottom: 15px;">
			<label style="display: block; margin-bottom: 5px; font-weight: bold;">Format:</label>
			<select id="format-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
				<option value="png">PNG (Best quality + transparency)</option>
				<option value="jpg">JPG (Smaller file size)</option>
				<option value="webp">WebP (Modern format)</option>
			</select>
		</div>
		
		<div style="margin-bottom: 15px;">
			<label style="display: block; margin-bottom: 5px; font-weight: bold;">Filename:</label>
			<input type="text" id="filename-input" value="workflow" placeholder="Enter filename..." 
				style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px; box-sizing: border-box;">
		</div>
		
		<div style="margin-bottom: 15px;">
			<label style="display: block; margin-bottom: 5px; font-weight: bold;">Resolution:</label>
			<select id="zoom-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
				<option value="1">1x - Original</option>
				<option value="2">2x - Double size</option>
				<option value="3">3x - Triple size</option>
				<option value="4">4x - Quadruple size</option>
			</select>
			<small style="color: #aaa; display: block; margin-top: 5px;">
				Renders at 1x then scales up for perfect text positioning
			</small>
		</div>
		
		<div style="margin-bottom: 15px;">
			<label style="display: flex; align-items: center; cursor: pointer; font-weight: bold;">
				<input type="checkbox" id="transparent-check" style="margin-right: 8px; transform: scale(1.2);">
				Transparent Background
			</label>
		</div>
		
		<div id="theme-selection" style="margin-bottom: 20px; display: none;">
			<label style="display: block; margin-bottom: 5px; font-weight: bold; color: #4CAF50;">🎨 ATk Theme for Export:</label>
			<select id="theme-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
				<option value="auto">🔍 Auto-detect existing transparent theme</option>
				<option value="dark">🌙 ATk Dark (Transparent)</option>
				<option value="light">☀️ ATk Light (Transparent)</option>
			</select>
			<small style="color: #aaa; display: block; margin-top: 5px;">
				Choose theme for transparent background export. Bundled ATk themes guarantee compatibility.
			</small>
		</div>
		
		<div style="display: flex; gap: 10px; justify-content: flex-end;">
			<button id="cancel-btn" style="padding: 10px 20px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
			<button id="export-btn" style="padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Export</button>
		</div>
	`;

	document.body.appendChild(dialog);

	// Create overlay
	const overlay = document.createElement("div");
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.7);
		z-index: 9999;
	`;
	document.body.appendChild(overlay);

	const formatSelect = dialog.querySelector("#format-select");
	const filenameInput = dialog.querySelector("#filename-input");
	const zoomSelect = dialog.querySelector("#zoom-select");
	const transparentCheck = dialog.querySelector("#transparent-check");
	const themeSelection = dialog.querySelector("#theme-selection");
	const themeSelect = dialog.querySelector("#theme-select");
	const cancelBtn = dialog.querySelector("#cancel-btn");
	const exportBtn = dialog.querySelector("#export-btn");

	// Focus on filename input
	filenameInput.focus();
	filenameInput.select();

	// Show/hide theme selection based on transparent checkbox
	transparentCheck.addEventListener('change', () => {
		themeSelection.style.display = transparentCheck.checked ? 'block' : 'none';
	});

	const close = () => {
		document.body.removeChild(dialog);
		document.body.removeChild(overlay);
	};

	cancelBtn.onclick = close;
	overlay.onclick = close;

	// Handle keyboard shortcuts
	dialog.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			close();
		} else if (e.key === 'Enter' && e.target !== exportBtn) {
			exportBtn.click();
		}
	});

	exportBtn.onclick = () => {
		const format = formatSelect.value;
		const filename = filenameInput.value.trim() || "workflow";
		const zoom = parseInt(zoomSelect.value);
		const transparent = transparentCheck.checked;
		const selectedTheme = themeSelect.value;

		const formatMap = {
			png: PngWorkflowImage,
			jpg: JpgWorkflowImage,
			webp: WebpWorkflowImage
		};

		// Sanitize filename (remove invalid characters)
		const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_');

		try {
			const exporter = new formatMap[format]();
			exporter.export({ 
				zoomFactor: zoom, 
				transparentBackground: transparent,
				selectedTheme: selectedTheme,
				filename: sanitizedFilename
			});
		} catch (error) {
			console.error("Export error:", error);
			alert(`❌ Export failed: ${error.message}\n\nPlease check the console for more details.`);
		}
		
		close();
	};
}

app.registerExtension({
	name: "atk.WorkflowExport",
	init() {
		// Text rendering function
		function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var words = text.split(" "),
				line = "",
				i,
				test,
				metrics;

			for (i = 0; i < words.length; i++) {
				test = words[i];
				metrics = context.measureText(test);
				while (metrics.width > maxWidth) {
					test = test.substring(0, test.length - 1);
					metrics = context.measureText(test);
				}
				if (words[i] != test) {
					words.splice(i + 1, 0, words[i].substr(test.length));
					words[i] = test;
				}

				test = line + words[i] + " ";
				metrics = context.measureText(test);

				if (metrics.width > maxWidth && i > 0) {
					context.fillText(line, x, y);
					line = words[i] + " ";
					y += lineHeight;
				} else {
					line = test;
				}
			}

			context.fillText(line, x, y);
		}

		const stringWidget = ComfyWidgets.STRING;
		// Override for text rendering
		ComfyWidgets.STRING = function () {
			const w = stringWidget.apply(this, arguments);
			if (w.widget && w.widget.type === "customtext") {
				const draw = w.widget.draw;
				w.widget.draw = function (ctx) {
					draw.apply(this, arguments);
					if (this.inputEl.hidden) return;

					if (getDrawTextConfig) {
						const config = getDrawTextConfig(ctx, this);
						const t = ctx.getTransform();
						ctx.save();
						if (config.resetTransform) {
							ctx.resetTransform();
						}

						const style = document.defaultView.getComputedStyle(this.inputEl, null);
						const x = config.x;
						const y = config.y;
						const domWrapper = this.inputEl.closest(".dom-widget") ?? this.inputEl;
						let w = parseInt(domWrapper.style.width);
						if (w === 0) {
							w = this.node.size[0] - 20;
						}
						const h = parseInt(domWrapper.style.height);
						ctx.fillStyle = style.getPropertyValue("background-color");
						ctx.fillRect(x, y, w, h);

						ctx.fillStyle = style.getPropertyValue("color");
						ctx.font = style.getPropertyValue("font");

						const line = t.d * 12;
						const split = this.inputEl.value.split("\n");
						let start = y;
						for (const l of split) {
							start += line;
							wrapText(ctx, l, x + 4, start, w, line);
						}

						ctx.restore();
					}
				};
			}
			return w;
		};
	},
	setup() {
		// Auto-register ATk themes when ComfyUI loads
		setTimeout(async () => {
			try {
				const exporter = new WorkflowImage();
				await exporter.registerATkThemes();
				console.log("🎨 ATk themes auto-registration completed");
				
				// Verify themes were saved in CustomColorPalettes
				if (app.ui?.settings) {
					const customPalettes = app.ui.settings.getSettingValue("Comfy.CustomColorPalettes");
					if (customPalettes) {
						const atkThemes = Object.values(customPalettes).filter(p => p.id?.startsWith("ATk_"));
						console.log(`📊 Found ${atkThemes.length} ATk themes in CustomColorPalettes:`, atkThemes.map(t => t.name));
						
						// Log structure for debug
						console.log("🔍 CustomColorPalettes structure:", Object.keys(customPalettes));
					}
				}
			} catch (error) {
				console.warn("Failed to auto-register ATk themes:", error);
			}
		}, 2000); // Longer time for ComfyUI Portable

		// Add ATk Menu to canvas menu options
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);

			options.push(null, {
				content: "⚗️ ATk Menu",
				submenu: {
					options: [
						{
							content: "🎨 Workflow Export",
							callback: () => {
								createExportDialog();
							},
						},
					],
				},
			});
			return options;
		};
	},
});