# [Image Tracer](https://remagofficial.github.io/image-tracer/)

Image Tracer is a small browser-based tracing tool for turning raster images into simple SVG artwork. Upload an image, trace shapes on top of it, organize the result into layers, and export the finished vector overlay as an `.svg` file.

## What the web app does

- Uploads an image into a canvas workspace
- Traces polygons with straight, smooth, or complex curve segments
- Fills existing polygons with the selected color
- Samples colors from the source image with the eyedropper
- Combines closed shapes using boolean operations (union, intersect, subtract)
- Organizes artwork into editable vector layers
- Supports undo/redo, zooming, panning, dark mode, grid snapping, and SVG export

## Using the app

1. Open the app in your browser.
2. Load an image with **Image → Choose File**.
3. Use **Trace** mode to place points and close a polygon.
4. Switch between **Straight**, **Smooth**, and **Complex** for the next segment while tracing.
5. Use **Fill** to recolor a polygon or **Eyedropper** to sample a color from the image.
6. Use **Shift/Ctrl/Cmd + click** to multi-select drawn closed shapes, then use the **Boolean** panel:
	- Selections can include shapes from different layers.
	- **Union** merges all selected shapes.
	- **Intersect** keeps only overlapping regions.
	- **Subtract** removes later-selected shapes from the first selected shape (order matters).
	- The result is placed on the same layer as the first selected shape.
7. In **edit mode**, use the green center handle to move shapes/text. Text also has corner handles to scale from its bounding box.
8. Use **Show grid** in the **View** panel if you want snap guidance while drawing and resizing.
9. The grid size is editable in pixels and snapping adapts to zoom: large cell gaps snap to all 9 grid points, medium gaps disable center snapping, and very small gaps snap only to corners.
10. Manage layers from the **Vector Layers** panel.
11. Click **Export SVG** to download the traced result. If you want to convert all text to SVG paths (for maximum compatibility), enable the **Convert text to paths** option before exporting. 
	- **Flatten + simplify paths on export** is enabled by default for cleaner SVG output. Disable it if you need exact original path geometry.
	- ⚠️ **Warning:** Converting text to paths may make the SVG file very large, especially for long or multi-line text.
	- To convert text to paths, you must load the matching font file (TTF/OTF/WOFF) using the font file input. Browser/system fonts cannot be converted unless you provide the font file.
	- If a font is missing, the export will warn you and leave the text as `<text>` elements.


### Helpful shortcuts

- `?` — open keyboard shortcuts help
- `Ctrl/Cmd + Z` — undo
- `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` — redo
- `Escape` — cancel the current trace or exit edit mode
- `Delete` / `Backspace` — delete all currently selected shapes
- `H` — toggle edit handles while editing
- `Space` + drag or middle mouse drag — pan
- Mouse wheel — zoom

## Local setup

This project is a static web app with no build step.

### Option 1: open the file directly

Open `index.html` in a browser.

### Option 2: serve it locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.


## Exporting text as paths

If you enable **Convert text to paths** in the export panel, all text will be converted to SVG `<path>` elements using the loaded font file. This is useful for maximum compatibility, but:

- **SVG file size can increase dramatically** for long or complex text.
- You must load the font file for any non-standard font you use. System/browser fonts (like Arial, Times, etc.) cannot be converted unless you provide the font file.
- If a font is missing, the export will warn you and leave the text as `<text>`.

## Project structure

- `index.html` — app layout
- `style.css` — app styling
- `app.js` — tracing, editing, layers, and export logic
