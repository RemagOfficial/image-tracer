# Image Tracer

Image Tracer is a small browser-based tracing tool for turning raster images into simple SVG artwork. Upload an image, trace shapes on top of it, organize the result into layers, and export the finished vector overlay as an `.svg` file.

## What the web app does

- Uploads an image into a canvas workspace
- Traces polygons with straight, smooth, or complex curve segments
- Fills existing polygons with the selected color
- Samples colors from the source image with the eyedropper
- Organizes artwork into editable vector layers
- Supports undo/redo, zooming, panning, dark mode, and SVG export

## Using the app

1. Open the app in your browser.
2. Load an image with **Image → Choose File**.
3. Use **Trace** mode to place points and close a polygon.
4. Switch between **Straight**, **Smooth**, and **Complex** for the next segment while tracing.
5. Use **Fill** to recolor a polygon or **Eyedropper** to sample a color from the image.
6. Manage layers from the **Vector Layers** panel.
7. Click **Export SVG** to download the traced result.

### Helpful shortcuts

- `?` — open keyboard shortcuts help
- `Ctrl/Cmd + Z` — undo
- `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` — redo
- `Escape` — cancel the current trace or exit edit mode
- `Delete` — delete the selected polygon
- `H` — toggle edit handles while editing
- `Space` + drag or middle mouse drag — pan
- Mouse wheel — zoom

## Local setup

This project is a static web app with no build step.

### Option 1: open the file directly

Open `/home/runner/work/image-tracer/image-tracer/index.html` in a browser.

### Option 2: serve it locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

This repository includes a GitHub Actions workflow that deploys the static site to GitHub Pages.

After merging to `main`:

1. Go to **Settings → Pages** in GitHub.
2. Set **Source** to **GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow will publish the site automatically on pushes to `main` or when run manually.

## Project structure

- `/home/runner/work/image-tracer/image-tracer/index.html` — app layout
- `/home/runner/work/image-tracer/image-tracer/style.css` — app styling
- `/home/runner/work/image-tracer/image-tracer/app.js` — tracing, editing, layers, and export logic
