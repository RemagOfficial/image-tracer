const imageLoader = document.getElementById('imageLoader');
const imageCanvas = document.getElementById('imageCanvas');
const svgOverlay = document.getElementById('svgOverlay');
const toggleImageBtn = document.getElementById('toggleImageBtn');
const traceToolBtn = document.getElementById('traceToolBtn');
const lineToolBtn = document.getElementById('lineToolBtn');
const textToolBtn = document.getElementById('textToolBtn');
const rectToolBtn = document.getElementById('rectToolBtn');
const ellipseToolBtn = document.getElementById('ellipseToolBtn');
const circleToolBtn = document.getElementById('circleToolBtn');
const fillToolBtn = document.getElementById('fillToolBtn');
const eyedropperBtn = document.getElementById('eyedropperBtn');
const cancelTraceBtn = document.getElementById('cancelTraceBtn');
const modeLabel = document.getElementById('modeLabel');
const colorPreview = document.getElementById('colorPreview');
const colorPicker = document.getElementById('colorPicker');
const colorValue = document.getElementById('colorValue');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomRange = document.getElementById('zoomRange');
const zoomLabel = document.getElementById('zoomLabel');
const darkModeBtn = document.getElementById('darkModeBtn');
const addLayerBtn = document.getElementById('addLayerBtn');
const toggleSvgBtn = document.getElementById('toggleSvgBtn');
const layersList = document.getElementById('layersList');
const exportBtn = document.getElementById('exportBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const helpBtn = document.getElementById('helpBtn');
const helpOverlay = document.getElementById('helpOverlay');
const helpCloseBtn = document.getElementById('helpCloseBtn');
const canvasWrapper = document.getElementById('canvasWrapper');
const canvasViewport = document.getElementById('canvasViewport');
const curveSelector = document.getElementById('curveSelector');
const curveLineBtn = document.getElementById('curveLineBtn');
const curveQuadBtn = document.getElementById('curveQuadBtn');
const curveCubicBtn = document.getElementById('curveCubicBtn');
const textInput = document.getElementById('textInput');
const textFontSelect = document.getElementById('textFontSelect');
const textSizeInput = document.getElementById('textSizeInput');
const fontFileInput = document.getElementById('fontFileInput');
const convertTextToPathsCheck = document.getElementById('convertTextToPathsCheck');
const fillTypeSolidBtn = document.getElementById('fillTypeSolidBtn');
const fillTypeLinearBtn = document.getElementById('fillTypeLinearBtn');
const fillTypeRadialBtn = document.getElementById('fillTypeRadialBtn');
const gradientControls = document.getElementById('gradientControls');
const gradStopsList = document.getElementById('gradStopsList');
const addGradStopBtn = document.getElementById('addGradStopBtn');
const linearAngleRow = document.getElementById('linearAngleRow');
const gradAngleEl = document.getElementById('gradAngle');
const strokeEnabledCheck = document.getElementById('strokeEnabledCheck');
const strokeColorPreview = document.getElementById('strokeColorPreview');
const strokeColorPicker = document.getElementById('strokeColorPicker');
const strokeWidthInput = document.getElementById('strokeWidthInput');

const ctx = imageCanvas.getContext('2d');
const svgNS = 'http://www.w3.org/2000/svg';

let img = new window.Image();
let currentTool = 'trace';
let previousTool = 'trace';
let tracing = false;
let currentPoints = [];
let currentCurveTypes = [];
let currentControls = [];
let nextCurveType = 'line';
let polylineDrawing = false;
let polylinePoints = [];
let polylineHoverPoint = null;
let shapeDrawing = false;
let shapeStartPoint = null;
let shapeHoverPoint = null;
let hoverPoint = null;
let pickedColor = '#000000';
let fillType = 'solid'; // 'solid' | 'linear' | 'radial'
let gradStops = [{ color: '#000000', offset: 0 }, { color: '#ffffff', offset: 100 }];
let gradAngleValue = 0;
let svgDefs = null;
let gradIdCounter = 0;
let strokeEnabled = true;
let strokeColor = '#1f1f1f';
let strokeWidth = 1;
let imageVisible = true;
let svgVisible = true;
let darkModeEnabled = false;
let zoomLevel = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.1;
let baseCanvasWidth = 800;
let baseCanvasHeight = 600;

let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartPanX = 0;
let panStartPanY = 0;
let spaceHeld = false;
let editingPath = null;
let selectedPath = null;
let editHandles = [];
let handlesVisible = true;

let layers = [];
let activeLayerId = null;
let layerCounter = 0;

let undoStack = [];
let redoStack = [];
let isRestoringState = false;
let helpOpen = false;
const loadedFontMap = new Map();
const loadedFontFaceUrls = new Map();

const tempPolyline = document.createElementNS(svgNS, 'polyline');
tempPolyline.setAttribute('fill', 'none');
tempPolyline.setAttribute('stroke-width', '2');
tempPolyline.style.pointerEvents = 'none';

const tempPolylineOuter = document.createElementNS(svgNS, 'polyline');
tempPolylineOuter.setAttribute('fill', 'none');
tempPolylineOuter.setAttribute('stroke', '#FFFFFF');
tempPolylineOuter.setAttribute('stroke-width', '6');
tempPolylineOuter.style.pointerEvents = 'none';

const tempCircle = document.createElementNS(svgNS, 'circle');
tempCircle.setAttribute('r', '8');
tempCircle.setAttribute('fill', 'none');
tempCircle.setAttribute('stroke', '#000000');
tempCircle.setAttribute('stroke-width', '2');
tempCircle.setAttribute('stroke-opacity', '1');
tempCircle.style.pointerEvents = 'none';

const tempCircleOuter = document.createElementNS(svgNS, 'circle');
tempCircleOuter.setAttribute('r', '8');
tempCircleOuter.setAttribute('fill', 'none');
tempCircleOuter.setAttribute('stroke', '#FFFFFF');
tempCircleOuter.setAttribute('stroke-width', '4');
tempCircleOuter.setAttribute('stroke-opacity', '1');
tempCircleOuter.style.pointerEvents = 'none';

const tempShapePath = document.createElementNS(svgNS, 'path');
tempShapePath.setAttribute('fill', 'none');
tempShapePath.setAttribute('stroke', '#000000');
tempShapePath.setAttribute('stroke-width', '2');
tempShapePath.setAttribute('stroke-dasharray', '6 4');
tempShapePath.style.pointerEvents = 'none';

const tempGroup = document.createElementNS(svgNS, 'g');
tempGroup.setAttribute('id', 'tempGroup');
tempGroup.style.pointerEvents = 'none';
tempGroup.appendChild(tempShapePath);
tempGroup.appendChild(tempPolylineOuter);
tempGroup.appendChild(tempPolyline);
tempGroup.appendChild(tempCircleOuter);
tempGroup.appendChild(tempCircle);
svgOverlay.appendChild(tempGroup);

function hexFromRgb(rgbText) {
  const match = rgbText.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  const [r, g, b] = match.slice(0, 3).map((n) => Number.parseInt(n, 10));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function setPickedColor(color) {
  pickedColor = color;
  const hex = color.startsWith('rgb') ? hexFromRgb(color) : color;
  colorValue.textContent = hex;
  colorPicker.value = hex;
  updateColorPreview();
}

function updateColorPreview() {
  if (fillType === 'solid') {
    colorPreview.style.background = pickedColor;
  } else {
    const sorted = [...gradStops].sort((a, b) => a.offset - b.offset);
    const stopStr = sorted.map((s) => `${s.color} ${s.offset}%`).join(', ');
    if (fillType === 'linear') {
      colorPreview.style.background = `linear-gradient(${gradAngleValue}deg, ${stopStr})`;
    } else {
      colorPreview.style.background = `radial-gradient(circle, ${stopStr})`;
    }
  }
}

function setFillType(type) {
  fillType = type;
  fillTypeSolidBtn.classList.toggle('active', type === 'solid');
  fillTypeLinearBtn.classList.toggle('active', type === 'linear');
  fillTypeRadialBtn.classList.toggle('active', type === 'radial');
  gradientControls.style.display = type === 'solid' ? 'none' : '';
  linearAngleRow.style.display = type === 'linear' ? '' : 'none';
  if (type !== 'solid') renderGradStopsUI();
  updateColorPreview();
}

function getCurrentFill() {
  if (fillType === 'solid') return pickedColor;
  return {
    type: fillType,
    stops: gradStops.map((s) => ({ offset: s.offset, color: s.color })),
    angle: gradAngleValue
  };
}

function renderGradStopsUI() {
  gradStopsList.innerHTML = '';
  gradStops.forEach((stop, i) => {
    const row = document.createElement('div');
    row.className = 'gradStopRow';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = stop.color;
    colorInput.title = `Stop ${i + 1} color`;
    colorInput.addEventListener('input', (e) => {
      gradStops[i].color = e.target.value;
      updateColorPreview();
    });

    const offsetInput = document.createElement('input');
    offsetInput.type = 'range';
    offsetInput.min = '0';
    offsetInput.max = '100';
    offsetInput.value = String(stop.offset);
    offsetInput.className = 'gradOffsetRange';

    const label = document.createElement('span');
    label.className = 'gradOffsetLabel';
    label.textContent = `${stop.offset}%`;

    offsetInput.addEventListener('input', (e) => {
      gradStops[i].offset = Number(e.target.value);
      label.textContent = `${gradStops[i].offset}%`;
      updateColorPreview();
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '\u2715';
    removeBtn.className = 'gradStopRemoveBtn';
    removeBtn.title = 'Remove stop';
    removeBtn.disabled = gradStops.length <= 2;
    removeBtn.addEventListener('click', () => {
      if (gradStops.length > 2) {
        gradStops.splice(i, 1);
        renderGradStopsUI();
        updateColorPreview();
      }
    });

    row.appendChild(colorInput);
    row.appendChild(offsetInput);
    row.appendChild(label);
    row.appendChild(removeBtn);
    gradStopsList.appendChild(row);
  });
}

function ensureDefs() {
  if (!svgDefs) {
    svgDefs = document.createElementNS(svgNS, 'defs');
    svgOverlay.insertBefore(svgDefs, svgOverlay.firstChild);
  }
  return svgDefs;
}

function createGradientInDefs(gradData) {
  const defs = ensureDefs();
  gradIdCounter++;
  const id = `grad-${Date.now()}-${gradIdCounter}`;
  let gradEl;
  if (gradData.type === 'linear') {
    gradEl = document.createElementNS(svgNS, 'linearGradient');
    const angle = gradData.angle || 0;
    const rad = (angle * Math.PI) / 180;
    gradEl.setAttribute('x1', String(0.5 - Math.cos(rad) * 0.5));
    gradEl.setAttribute('y1', String(0.5 - Math.sin(rad) * 0.5));
    gradEl.setAttribute('x2', String(0.5 + Math.cos(rad) * 0.5));
    gradEl.setAttribute('y2', String(0.5 + Math.sin(rad) * 0.5));
    gradEl.setAttribute('gradientUnits', 'objectBoundingBox');
  } else {
    gradEl = document.createElementNS(svgNS, 'radialGradient');
    gradEl.setAttribute('cx', '50%');
    gradEl.setAttribute('cy', '50%');
    gradEl.setAttribute('r', '50%');
  }
  gradEl.setAttribute('id', id);
  (gradData.stops || []).forEach((stop) => {
    const stopEl = document.createElementNS(svgNS, 'stop');
    stopEl.setAttribute('offset', `${stop.offset}%`);
    stopEl.setAttribute('stop-color', stop.color);
    gradEl.appendChild(stopEl);
  });
  defs.appendChild(gradEl);
  return id;
}

function applyFill(shape, fill) {
  const tag = shape.tagName.toLowerCase();
  const isStrokeBased = tag === 'line' || tag === 'polyline';
  const attr = isStrokeBased ? 'stroke' : 'fill';
  const oldGradId = shape.getAttribute('data-grad-id');
  if (oldGradId) {
    svgDefs?.querySelector(`[id="${oldGradId}"]`)?.remove();
    shape.removeAttribute('data-grad-id');
    shape.removeAttribute('data-gradient');
  }
  if (!fill || typeof fill === 'string') {
    shape.setAttribute(attr, fill || '#000000');
  } else {
    const gradId = createGradientInDefs(fill);
    shape.setAttribute(attr, `url(#${gradId})`);
    shape.setAttribute('data-grad-id', gradId);
    shape.setAttribute('data-gradient', JSON.stringify(fill));
  }
}

function applyStrokeToShape(shape) {
  const tag = shape.tagName.toLowerCase();
  if (tag === 'line' || tag === 'polyline') {
    // line/polyline color is controlled by fill tool; stroke panel controls width only.
    shape.setAttribute('stroke-width', String(strokeWidth));
  } else {
    shape.setAttribute('stroke', strokeEnabled ? strokeColor : 'none');
    shape.setAttribute('stroke-width', String(strokeWidth));
  }
}

function updateStrokePreview() {
  if (!strokeColorPreview) return;
  strokeColorPreview.style.background = strokeEnabled ? strokeColor : 'transparent';
  strokeColorPreview.style.opacity = strokeEnabled ? '1' : '0.3';
}

function restoreStroke(shape, polygon) {
  const tag = shape.tagName.toLowerCase();
  if (tag === 'line' || tag === 'polyline') {
    shape.setAttribute('stroke-width', String(polygon.strokeWidth || 2));
  } else {
    shape.setAttribute('stroke', polygon.stroke || 'none');
    shape.setAttribute('stroke-width', String(polygon.strokeWidth || 1));
  }
}

function setDarkMode(enabled) {
  darkModeEnabled = enabled;
  document.body.classList.toggle('dark', enabled);
  darkModeBtn.textContent = enabled ? 'Disable Dark Mode' : 'Enable Dark Mode';
}

function setSelectedPath(path) {
  if (selectedPath === path) return;
  if (selectedPath) selectedPath.classList.remove('selectedPolygon');
  selectedPath = path || null;
  if (selectedPath) selectedPath.classList.add('selectedPolygon');
}

function getLayerForPath(path) {
  if (!path) return null;
  return layers.find((layer) => layer.group === path.parentNode) || null;
}

function isPathLocked(path) {
  const layer = getLayerForPath(path);
  return !!(layer && layer.locked);
}

function updateHistoryButtons() {
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

function getShapeFill(shape, attr) {
  const gradJSON = shape.getAttribute('data-gradient');
  if (gradJSON) {
    try { return { gradient: JSON.parse(gradJSON) }; } catch (_) { /* ignore */ }
  }
  return { color: shape.getAttribute(attr) || '#000000' };
}

function serializeState() {
  return {
    layerCounter,
    activeLayerId,
    layers: layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: !!layer.locked,
      polygons: Array.from(layer.group.querySelectorAll('path, rect, ellipse, circle, line, polyline, polygon, text')).map((shape) => {
        const type = shape.tagName.toLowerCase();
        if (type === 'text') {
          return {
            type,
            content: shape.textContent || '',
            x: Number.parseFloat(shape.getAttribute('x') || '0'),
            y: Number.parseFloat(shape.getAttribute('y') || '0'),
            ...getShapeFill(shape, 'fill'),
            stroke: shape.getAttribute('stroke') || 'none',
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1'),
            fontFamily: shape.getAttribute('font-family') || 'Arial',
            fontSize: Number.parseFloat(shape.getAttribute('font-size') || '48'),
            fontWeight: shape.getAttribute('font-weight') || '400',
            fontStyle: shape.getAttribute('font-style') || 'normal'
          };
        }
        if (type === 'line') {
          return {
            type,
            ...getShapeFill(shape, 'stroke'),
            x1: Number.parseFloat(shape.getAttribute('x1') || '0'),
            y1: Number.parseFloat(shape.getAttribute('y1') || '0'),
            x2: Number.parseFloat(shape.getAttribute('x2') || '0'),
            y2: Number.parseFloat(shape.getAttribute('y2') || '0'),
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '2')
          };
        }
        if (type === 'polyline' || type === 'polygon') {
          const pointsText = shape.getAttribute('points') || '';
          const points = pointsText
            .trim()
            .split(/\s+/)
            .map((pair) => pair.split(',').map((n) => Number.parseFloat(n)))
            .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
          return {
            type,
            ...getShapeFill(shape, type === 'polyline' ? 'stroke' : 'fill'),
            points,
            ...(type === 'polyline'
              ? { strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '2') }
              : {
                stroke: shape.getAttribute('stroke') || 'none',
                strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1')
              })
          };
        }
        if (type === 'rect') {
          return {
            type,
            ...getShapeFill(shape, 'fill'),
            x: Number.parseFloat(shape.getAttribute('x') || '0'),
            y: Number.parseFloat(shape.getAttribute('y') || '0'),
            width: Number.parseFloat(shape.getAttribute('width') || '0'),
            height: Number.parseFloat(shape.getAttribute('height') || '0'),
            stroke: shape.getAttribute('stroke') || 'none',
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1')
          };
        }
        if (type === 'ellipse') {
          return {
            type,
            ...getShapeFill(shape, 'fill'),
            cx: Number.parseFloat(shape.getAttribute('cx') || '0'),
            cy: Number.parseFloat(shape.getAttribute('cy') || '0'),
            rx: Number.parseFloat(shape.getAttribute('rx') || '0'),
            ry: Number.parseFloat(shape.getAttribute('ry') || '0'),
            stroke: shape.getAttribute('stroke') || 'none',
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1')
          };
        }
        if (type === 'circle') {
          return {
            type,
            ...getShapeFill(shape, 'fill'),
            cx: Number.parseFloat(shape.getAttribute('cx') || '0'),
            cy: Number.parseFloat(shape.getAttribute('cy') || '0'),
            r: Number.parseFloat(shape.getAttribute('r') || '0'),
            stroke: shape.getAttribute('stroke') || 'none',
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1')
          };
        }
        return {
          type: 'path',
          points: JSON.parse(shape.getAttribute('data-points') || '[]'),
          curveTypes: JSON.parse(shape.getAttribute('data-curve-types') || '[]'),
          controls: JSON.parse(shape.getAttribute('data-controls') || '[]'),
          ...getShapeFill(shape, 'fill'),
          stroke: shape.getAttribute('stroke') || 'none',
          strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1')
        };
      })
    }))
  };
}

function pushHistoryState() {
  if (isRestoringState) return;
  undoStack.push(serializeState());
  if (undoStack.length > 120) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}

function createPathElement(points, curveTypes, controls, color) {
  const path = document.createElementNS(svgNS, 'path');
  const safeControls = controls || [];
  path.setAttribute('d', buildPathData(points, curveTypes, safeControls, true));
  path.style.cursor = 'pointer';
  path.setAttribute('data-points', JSON.stringify(points));
  path.setAttribute('data-curve-types', JSON.stringify(curveTypes));
  path.setAttribute('data-controls', JSON.stringify(safeControls));
  applyFill(path, color);
  applyStrokeToShape(path);
  bindPathInteractions(path);
  return path;
}

function createRectElement(x, y, width, height, color) {
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.style.cursor = 'pointer';
  applyFill(rect, color);
  applyStrokeToShape(rect);
  bindPathInteractions(rect);
  return rect;
}

function createEllipseElement(cx, cy, rx, ry, color) {
  const ellipse = document.createElementNS(svgNS, 'ellipse');
  ellipse.setAttribute('cx', String(cx));
  ellipse.setAttribute('cy', String(cy));
  ellipse.setAttribute('rx', String(rx));
  ellipse.setAttribute('ry', String(ry));
  ellipse.style.cursor = 'pointer';
  applyFill(ellipse, color);
  applyStrokeToShape(ellipse);
  bindPathInteractions(ellipse);
  return ellipse;
}

function createCircleElement(cx, cy, r, color) {
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', String(cx));
  circle.setAttribute('cy', String(cy));
  circle.setAttribute('r', String(r));
  circle.style.cursor = 'pointer';
  applyFill(circle, color);
  applyStrokeToShape(circle);
  bindPathInteractions(circle);
  return circle;
}

function createTextElement(content, x, y, color, fontFamily, fontSize, fontWeight = '400', fontStyle = 'normal') {
  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', String(x));
  text.setAttribute('y', String(y));
  text.setAttribute('font-family', fontFamily || 'Arial');
  text.setAttribute('font-size', String(fontSize || 48));
  text.setAttribute('font-weight', fontWeight);
  text.setAttribute('font-style', fontStyle);
  text.style.cursor = 'pointer';
  text.style.userSelect = 'none';
  text.textContent = content;
  applyFill(text, color);
  applyStrokeToShape(text);
  bindPathInteractions(text);
  return text;
}

function createLineElement(x1, y1, x2, y2, color) {
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('fill', 'none');
  line.style.cursor = 'pointer';
  applyFill(line, color);
  applyStrokeToShape(line);
  bindPathInteractions(line);
  return line;
}

function createPolylineElement(points, color) {
  const polyline = document.createElementNS(svgNS, 'polyline');
  polyline.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
  polyline.setAttribute('fill', 'none');
  polyline.style.cursor = 'pointer';
  applyFill(polyline, color);
  applyStrokeToShape(polyline);
  bindPathInteractions(polyline);
  return polyline;
}

function createPolygonElement(points, color) {
  const polygon = document.createElementNS(svgNS, 'polygon');
  polygon.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '));
  polygon.style.cursor = 'pointer';
  applyFill(polygon, color);
  applyStrokeToShape(polygon);
  bindPathInteractions(polygon);
  return polygon;
}

function restoreState(state) {
  if (!state || !Array.isArray(state.layers)) return;

  isRestoringState = true;
  exitEditMode();
  setSelectedPath(null);

  layers.forEach((layer) => layer.group.remove());
  layers = [];

  if (svgDefs) svgDefs.innerHTML = '';

  layerCounter = state.layerCounter || 0;

  state.layers.forEach((savedLayer) => {
    const group = document.createElementNS(svgNS, 'g');
    group.setAttribute('data-layer-id', savedLayer.id);
    group.setAttribute('aria-label', savedLayer.name);
    group.style.display = savedLayer.visible ? '' : 'none';

    const layer = {
      id: savedLayer.id,
      name: savedLayer.name,
      visible: savedLayer.visible,
      locked: !!savedLayer.locked,
      group
    };

    layers.push(layer);

    savedLayer.polygons.forEach((polygon) => {
      const type = polygon.type || 'path';
      const fill = polygon.gradient || polygon.color || '#000000';
      let shape = null;

      if (type === 'rect') {
        shape = createRectElement(
          polygon.x || 0,
          polygon.y || 0,
          polygon.width || 0,
          polygon.height || 0,
          fill
        );
      } else if (type === 'ellipse') {
        shape = createEllipseElement(
          polygon.cx || 0,
          polygon.cy || 0,
          polygon.rx || 0,
          polygon.ry || 0,
          fill
        );
      } else if (type === 'circle') {
        shape = createCircleElement(
          polygon.cx || 0,
          polygon.cy || 0,
          polygon.r || 0,
          fill
        );
      } else if (type === 'line') {
        shape = createLineElement(
          polygon.x1 || 0,
          polygon.y1 || 0,
          polygon.x2 || 0,
          polygon.y2 || 0,
          fill
        );
      } else if (type === 'polyline') {
        shape = createPolylineElement(
          polygon.points || [],
          fill
        );
      } else if (type === 'polygon') {
        shape = createPolygonElement(
          polygon.points || [],
          fill
        );
      } else if (type === 'text') {
        shape = createTextElement(
          polygon.content || '',
          polygon.x || 0,
          polygon.y || 0,
          fill,
          polygon.fontFamily || 'Arial',
          polygon.fontSize || 48,
          polygon.fontWeight || '400',
          polygon.fontStyle || 'normal'
        );
      } else {
        shape = createPathElement(
          polygon.points || [],
          polygon.curveTypes || [],
          polygon.controls || [],
          fill
        );
      }

      restoreStroke(shape, polygon);
      group.appendChild(shape);
    });
  });

  for (let i = layers.length - 1; i >= 0; i--) {
    svgOverlay.insertBefore(layers[i].group, tempGroup);
  }

  activeLayerId = layers.some((layer) => layer.id === state.activeLayerId)
    ? state.activeLayerId
    : (layers[0]?.id || null);

  renderLayersList();
  isRestoringState = false;
  updateHistoryButtons();
}

function undo() {
  if (undoStack.length === 0) return;
  const previous = undoStack.pop();
  redoStack.push(serializeState());
  restoreState(previous);
  updateHistoryButtons();
}

function redo() {
  if (redoStack.length === 0) return;
  const next = redoStack.pop();
  undoStack.push(serializeState());
  restoreState(next);
  updateHistoryButtons();
}

function toggleHelp(force) {
  helpOpen = (force !== undefined) ? force : !helpOpen;
  helpOverlay.style.display = helpOpen ? 'flex' : 'none';
}

function removePolygon(path, recordHistory = true) {
  if (!path) return;
  if (recordHistory) pushHistoryState();
  if (editingPath === path) exitEditMode();
  if (selectedPath === path) setSelectedPath(null);
  path.remove();
  renderLayersList();
}

function applyTransform() {
  canvasWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function centerImage() {
  const vw = canvasViewport.clientWidth;
  const vh = canvasViewport.clientHeight;
  panX = Math.round((vw - baseCanvasWidth * zoomLevel) / 2);
  panY = Math.round((vh - baseCanvasHeight * zoomLevel) / 2);
  applyTransform();
}

function setZoom(value, originX, originY) {
  const oldZoom = zoomLevel;
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  zoomLevel = Number.parseFloat(clamped.toFixed(4));

  if (originX !== undefined && originY !== undefined) {
    panX = originX - (originX - panX) * (zoomLevel / oldZoom);
    panY = originY - (originY - panY) * (zoomLevel / oldZoom);
  }

  applyTransform();
  const pct = Math.round(zoomLevel * 100);
  zoomLabel.textContent = `Zoom: ${pct}%`;
  zoomResetBtn.textContent = `${pct}%`;
  zoomRange.value = String(zoomLevel);

  if (editingPath) {
    renderEditHandles(editingPath);
  }
}

function getToolLabel(tool) {
  if (tool === 'trace') return 'Trace';
  if (tool === 'line') return 'Line';
  if (tool === 'text') return 'Text';
  if (tool === 'rect') return 'Rectangle';
  if (tool === 'ellipse') return 'Ellipse';
  if (tool === 'circle') return 'Circle';
  if (tool === 'fill') return 'Fill';
  return 'Eyedropper';
}

function isShapeTool(tool) {
  return tool === 'rect' || tool === 'ellipse' || tool === 'circle';
}

function updateToolButtons() {
  traceToolBtn.classList.toggle('active', currentTool === 'trace');
  lineToolBtn.classList.toggle('active', currentTool === 'line');
  textToolBtn.classList.toggle('active', currentTool === 'text');
  rectToolBtn.classList.toggle('active', currentTool === 'rect');
  ellipseToolBtn.classList.toggle('active', currentTool === 'ellipse');
  circleToolBtn.classList.toggle('active', currentTool === 'circle');
  fillToolBtn.classList.toggle('active', currentTool === 'fill');
  eyedropperBtn.classList.toggle('active', currentTool === 'eyedropper');
  modeLabel.textContent = `Mode: ${getToolLabel(currentTool)}`;
}

function updateInteractionState() {
  if (!svgVisible || currentTool === 'eyedropper') {
    svgOverlay.style.pointerEvents = 'none';
  } else {
    svgOverlay.style.pointerEvents = 'auto';
  }
}

function setCurveType(type) {
  nextCurveType = type;
  curveLineBtn.classList.toggle('active', type === 'line');
  curveQuadBtn.classList.toggle('active', type === 'quadratic');
  curveCubicBtn.classList.toggle('active', type === 'cubic');
}

function setTool(tool) {
  if (tool !== 'eyedropper') {
    previousTool = tool;
  }
  if (currentTool !== tool) {
    cancelCurrentTrace();
  }
  currentTool = tool;
  updateToolButtons();
  updateInteractionState();
}

function cancelCurrentTrace() {
  tracing = false;
  polylineDrawing = false;
  polylinePoints = [];
  polylineHoverPoint = null;
  shapeDrawing = false;
  shapeStartPoint = null;
  shapeHoverPoint = null;
  currentPoints = [];
  currentCurveTypes = [];
  currentControls = [];
  nextCurveType = 'line';
  hoverPoint = null;
  curveSelector.style.display = 'none';
  tempShapePath.setAttribute('d', '');
  renderTempPath();
}

function buildRectGeometry(startPoint, endPoint) {
  const [sx, sy] = startPoint;
  const [ex, ey] = endPoint;
  const left = Math.min(sx, ex);
  const right = Math.max(sx, ex);
  const top = Math.min(sy, ey);
  const bottom = Math.max(sy, ey);

  return {
    points: [
      [left, top],
      [right, top],
      [right, bottom],
      [left, bottom]
    ],
    curveTypes: ['line', 'line', 'line', 'line'],
    controls: [null, null, null, null]
  };
}

function buildEllipseGeometry(startPoint, endPoint) {
  const [sx, sy] = startPoint;
  const [ex, ey] = endPoint;
  const left = Math.min(sx, ex);
  const right = Math.max(sx, ex);
  const top = Math.min(sy, ey);
  const bottom = Math.max(sy, ey);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;
  const k = 0.5522847498307936;

  return {
    points: [
      [cx, cy - ry],
      [cx + rx, cy],
      [cx, cy + ry],
      [cx - rx, cy]
    ],
    curveTypes: ['cubic', 'cubic', 'cubic', 'cubic'],
    controls: [
      {
        cp1: { x: cx - rx, y: cy - ry * k },
        cp2: { x: cx - rx * k, y: cy - ry }
      },
      {
        cp1: { x: cx + rx * k, y: cy - ry },
        cp2: { x: cx + rx, y: cy - ry * k }
      },
      {
        cp1: { x: cx + rx, y: cy + ry * k },
        cp2: { x: cx + rx * k, y: cy + ry }
      },
      {
        cp1: { x: cx - rx * k, y: cy + ry },
        cp2: { x: cx - rx, y: cy + ry * k }
      }
    ]
  };
}

function buildCircleGeometry(startPoint, endPoint) {
  const [sx, sy] = startPoint;
  const [ex, ey] = endPoint;
  const dx = ex - sx;
  const dy = ey - sy;
  const size = Math.min(Math.abs(dx), Math.abs(dy));
  const endX = sx + (dx < 0 ? -size : size);
  const endY = sy + (dy < 0 ? -size : size);
  return buildEllipseGeometry([sx, sy], [endX, endY]);
}

function getShapeGeometry(startPoint, endPoint) {
  if (currentTool === 'rect') return buildRectGeometry(startPoint, endPoint);
  if (currentTool === 'circle') return buildCircleGeometry(startPoint, endPoint);
  return buildEllipseGeometry(startPoint, endPoint);
}

function renderTempShapePath() {
  if (!shapeDrawing || !shapeStartPoint || !shapeHoverPoint || !isShapeTool(currentTool)) {
    tempShapePath.setAttribute('d', '');
    return;
  }

  const geometry = getShapeGeometry(shapeStartPoint, shapeHoverPoint);
  tempShapePath.setAttribute('d', buildPathData(geometry.points, geometry.curveTypes, geometry.controls, true));
  tempShapePath.setAttribute('stroke', pickedColor);
}

function finishShapeDrawing() {
  if (!shapeDrawing || !shapeStartPoint || !shapeHoverPoint || !isShapeTool(currentTool)) {
    cancelCurrentTrace();
    return;
  }

  const width = Math.abs(shapeHoverPoint[0] - shapeStartPoint[0]);
  const height = Math.abs(shapeHoverPoint[1] - shapeStartPoint[1]);
  if (width < 2 || height < 2) {
    cancelCurrentTrace();
    return;
  }

  const left = Math.min(shapeStartPoint[0], shapeHoverPoint[0]);
  const right = Math.max(shapeStartPoint[0], shapeHoverPoint[0]);
  const top = Math.min(shapeStartPoint[1], shapeHoverPoint[1]);
  const bottom = Math.max(shapeStartPoint[1], shapeHoverPoint[1]);
  const shapeWidth = right - left;
  const shapeHeight = bottom - top;

  pushHistoryState();
  if (currentTool === 'rect') {
    addRect(left, top, shapeWidth, shapeHeight, getCurrentFill());
  } else if (currentTool === 'circle') {
    const dx = shapeHoverPoint[0] - shapeStartPoint[0];
    const dy = shapeHoverPoint[1] - shapeStartPoint[1];
    const size = Math.min(Math.abs(dx), Math.abs(dy));
    const endX = shapeStartPoint[0] + (dx < 0 ? -size : size);
    const endY = shapeStartPoint[1] + (dy < 0 ? -size : size);
    const cx = (shapeStartPoint[0] + endX) / 2;
    const cy = (shapeStartPoint[1] + endY) / 2;
    addCircle(cx, cy, size / 2, getCurrentFill());
  } else {
    addEllipse(left + shapeWidth / 2, top + shapeHeight / 2, shapeWidth / 2, shapeHeight / 2, getCurrentFill());
  }
  cancelCurrentTrace();
}

function exitEditMode() {
  if (!editingPath) return;
  editingPath.classList.remove('editingPolygon');
  editHandles.forEach((h) => h.element.remove());
  editHandles = [];
  editingPath = null;
  document.removeEventListener('mousemove', handleEditDrag);
  document.removeEventListener('mouseup', handleEditEnd);
}

function syncTextControlsFromElement(textEl) {
  if (!textEl || textEl.tagName.toLowerCase() !== 'text') return;
  if (textInput) textInput.value = textEl.textContent || '';
  if (textFontSelect) {
    const family = textEl.getAttribute('font-family') || 'Arial';
    if (!Array.from(textFontSelect.options).some((opt) => opt.value === family)) {
      const option = document.createElement('option');
      option.value = family;
      option.textContent = family;
      textFontSelect.appendChild(option);
    }
    textFontSelect.value = family;
  }
  if (textSizeInput) textSizeInput.value = String(Number.parseFloat(textEl.getAttribute('font-size') || '48') || 48);
}

function applyTextControlsToEditingText(recordHistory) {
  if (!editingPath || editingPath.tagName.toLowerCase() !== 'text') return;
  if (recordHistory) pushHistoryState();
  const newText = textInput ? textInput.value : (editingPath.textContent || '');
  const newFamily = textFontSelect ? textFontSelect.value : (editingPath.getAttribute('font-family') || 'Arial');
  const newSize = Math.max(6, Number.parseFloat(textSizeInput?.value || '48') || 48);
  editingPath.textContent = newText;
  editingPath.setAttribute('font-family', newFamily);
  editingPath.setAttribute('font-size', String(newSize));
  renderLayersList();
}

function updateShapeCornerHandles(path) {
  if (!path) return;
  const shapeType = path.tagName.toLowerCase();
  if (shapeType === 'path') return;

  const controlSize = 12 / zoomLevel;
  const halfControlSize = controlSize / 2;
  const box = (() => {
    if (shapeType === 'rect') {
      const x = Number.parseFloat(path.getAttribute('x') || '0');
      const y = Number.parseFloat(path.getAttribute('y') || '0');
      const width = Number.parseFloat(path.getAttribute('width') || '0');
      const height = Number.parseFloat(path.getAttribute('height') || '0');
      return { left: x, top: y, right: x + width, bottom: y + height };
    }
    const cx = Number.parseFloat(path.getAttribute('cx') || '0');
    const cy = Number.parseFloat(path.getAttribute('cy') || '0');
    if (shapeType === 'ellipse') {
      const rx = Number.parseFloat(path.getAttribute('rx') || '0');
      const ry = Number.parseFloat(path.getAttribute('ry') || '0');
      return { left: cx - rx, top: cy - ry, right: cx + rx, bottom: cy + ry };
    }
    const r = Number.parseFloat(path.getAttribute('r') || '0');
    return { left: cx - r, top: cy - r, right: cx + r, bottom: cy + r };
  })();

  const corners = [
    [box.left, box.top],
    [box.right, box.top],
    [box.right, box.bottom],
    [box.left, box.bottom]
  ];

  editHandles.forEach((handle) => {
    if (handle.data.type !== 'bbox-corner') return;
    const cornerPt = corners[handle.data.corner];
    if (!cornerPt) return;
    handle.element.setAttribute('x', String(cornerPt[0] - halfControlSize));
    handle.element.setAttribute('y', String(cornerPt[1] - halfControlSize));
    handle.element.setAttribute('width', String(controlSize));
    handle.element.setAttribute('height', String(controlSize));
  });
}

function handleEditDrag(e) {
  if (!editingPath || editHandles.length === 0) return;
  const currentDrag = editHandles.find((h) => h.isDragging);
  if (!currentDrag) return;
  
  const rect = canvasViewport.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoomLevel;
  const y = (e.clientY - rect.top - panY) / zoomLevel;
  const shapeType = editingPath.tagName.toLowerCase();

  if (shapeType === 'text') {
    if (currentDrag.data.type !== 'text-anchor') return;
    editingPath.setAttribute('x', String(x));
    editingPath.setAttribute('y', String(y));
    currentDrag.element.setAttribute('cx', String(x));
    currentDrag.element.setAttribute('cy', String(y));
    return;
  }

  if (shapeType === 'line' || shapeType === 'polyline' || shapeType === 'polygon') {
    if (currentDrag.data.type !== 'shape-point') return;

    const pointIdx = currentDrag.data.pointIdx;
    let points = [];
    if (shapeType === 'line') {
      points = [
        [Number.parseFloat(editingPath.getAttribute('x1') || '0'), Number.parseFloat(editingPath.getAttribute('y1') || '0')],
        [Number.parseFloat(editingPath.getAttribute('x2') || '0'), Number.parseFloat(editingPath.getAttribute('y2') || '0')]
      ];
    } else {
      points = (editingPath.getAttribute('points') || '')
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map((n) => Number.parseFloat(n)))
        .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
    }

    if (pointIdx < 0 || pointIdx >= points.length) return;
    points[pointIdx] = [x, y];

    if (shapeType === 'line') {
      editingPath.setAttribute('x1', String(points[0][0]));
      editingPath.setAttribute('y1', String(points[0][1]));
      editingPath.setAttribute('x2', String(points[1][0]));
      editingPath.setAttribute('y2', String(points[1][1]));
    } else {
      editingPath.setAttribute('points', points.map(([px, py]) => `${px},${py}`).join(' '));
    }

    currentDrag.element.setAttribute('cx', String(x));
    currentDrag.element.setAttribute('cy', String(y));
    return;
  }

  if (shapeType === 'rect' || shapeType === 'ellipse' || shapeType === 'circle') {
    if (currentDrag.data.type !== 'bbox-corner') return;

    const corner = currentDrag.data.corner;
    let opposite = currentDrag.data.anchor;
    if (!opposite) {
      const currentBox = (() => {
        if (shapeType === 'rect') {
          const bx = Number.parseFloat(editingPath.getAttribute('x') || '0');
          const by = Number.parseFloat(editingPath.getAttribute('y') || '0');
          const bw = Number.parseFloat(editingPath.getAttribute('width') || '0');
          const bh = Number.parseFloat(editingPath.getAttribute('height') || '0');
          return { left: bx, top: by, right: bx + bw, bottom: by + bh };
        }
        const cx = Number.parseFloat(editingPath.getAttribute('cx') || '0');
        const cy = Number.parseFloat(editingPath.getAttribute('cy') || '0');
        if (shapeType === 'ellipse') {
          const rx = Number.parseFloat(editingPath.getAttribute('rx') || '0');
          const ry = Number.parseFloat(editingPath.getAttribute('ry') || '0');
          return { left: cx - rx, top: cy - ry, right: cx + rx, bottom: cy + ry };
        }
        const r = Number.parseFloat(editingPath.getAttribute('r') || '0');
        return { left: cx - r, top: cy - r, right: cx + r, bottom: cy + r };
      })();
      const corners = [
        [currentBox.left, currentBox.top],
        [currentBox.right, currentBox.top],
        [currentBox.right, currentBox.bottom],
        [currentBox.left, currentBox.bottom]
      ];
      opposite = { x: corners[(corner + 2) % 4][0], y: corners[(corner + 2) % 4][1] };
      currentDrag.data.anchor = opposite;
    }

    let newDragX = x;
    let newDragY = y;
    if (shapeType === 'circle') {
      const dx = x - opposite.x;
      const dy = y - opposite.y;
      const size = Math.max(Math.abs(dx), Math.abs(dy));
      newDragX = opposite.x + (dx >= 0 ? size : -size);
      newDragY = opposite.y + (dy >= 0 ? size : -size);
    }

    const left = Math.min(newDragX, opposite.x);
    const right = Math.max(newDragX, opposite.x);
    const top = Math.min(newDragY, opposite.y);
    const bottom = Math.max(newDragY, opposite.y);

    if (shapeType === 'rect') {
      editingPath.setAttribute('x', String(left));
      editingPath.setAttribute('y', String(top));
      editingPath.setAttribute('width', String(Math.max(1, right - left)));
      editingPath.setAttribute('height', String(Math.max(1, bottom - top)));
    } else if (shapeType === 'ellipse') {
      editingPath.setAttribute('cx', String((left + right) / 2));
      editingPath.setAttribute('cy', String((top + bottom) / 2));
      editingPath.setAttribute('rx', String(Math.max(0.5, (right - left) / 2)));
      editingPath.setAttribute('ry', String(Math.max(0.5, (bottom - top) / 2)));
    } else if (shapeType === 'circle') {
      const size = Math.max(right - left, bottom - top);
      editingPath.setAttribute('cx', String((left + right) / 2));
      editingPath.setAttribute('cy', String((top + bottom) / 2));
      editingPath.setAttribute('r', String(Math.max(0.5, size / 2)));
    }

    updateShapeCornerHandles(editingPath);
    return;
  }
  
  const { type, pointIdx, controlType } = currentDrag.data;
  let points = JSON.parse(editingPath.getAttribute('data-points'));
  let curveTypes = JSON.parse(editingPath.getAttribute('data-curve-types'));
  let controls = JSON.parse(editingPath.getAttribute('data-controls'));
  
  if (type === 'point') {
    points[pointIdx] = [x, y];
  } else if (type === 'control') {
    if (!controls[pointIdx]) controls[pointIdx] = {};
    if (controlType === 'cp') {
      controls[pointIdx].cp = { x, y };
    } else if (controlType === 'cp1') {
      controls[pointIdx].cp1 = { x, y };
    } else if (controlType === 'cp2') {
      controls[pointIdx].cp2 = { x, y };
    }
  }
  
  editingPath.setAttribute('data-points', JSON.stringify(points));
  editingPath.setAttribute('data-controls', JSON.stringify(controls));
  const pathData = buildPathData(points, curveTypes, controls, true);
  editingPath.setAttribute('d', pathData);

  if (type === 'point') {
    currentDrag.element.setAttribute('cx', String(x));
    currentDrag.element.setAttribute('cy', String(y));
  } else {
    const controlSize = 12 / zoomLevel;
    const halfControlSize = controlSize / 2;
    currentDrag.element.setAttribute('x', String(x - halfControlSize));
    currentDrag.element.setAttribute('y', String(y - halfControlSize));
    currentDrag.element.setAttribute('width', String(controlSize));
    currentDrag.element.setAttribute('height', String(controlSize));
  }
}

function handleEditEnd(e) {
  if (!editingPath) return;
  editHandles.forEach((h) => {
    h.isDragging = false;
    if (h.data && h.data.type === 'bbox-corner') {
      delete h.data.anchor;
    }
  });
}

function renderEditHandles(path) {
  editHandles.forEach((h) => h.element.remove());
  editHandles = [];
  if (!handlesVisible) return;

  const shapeType = path.tagName.toLowerCase();
  if (shapeType === 'text') {
    const pointRadius = 10 / zoomLevel;
    const x = Number.parseFloat(path.getAttribute('x') || '0');
    const y = Number.parseFloat(path.getAttribute('y') || '0');
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', String(pointRadius));
    circle.setAttribute('fill', '#3b82f6');
    circle.setAttribute('stroke', '#1f2937');
    circle.setAttribute('stroke-width', '1');
    circle.style.cursor = 'grab';
    circle.style.pointerEvents = 'auto';

    circle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === circle);
      if (handle) {
        pushHistoryState();
        handle.isDragging = true;
      }
    });

    tempGroup.appendChild(circle);
    editHandles.push({ element: circle, data: { type: 'text-anchor' }, isDragging: false });
    return;
  }

  if (shapeType === 'line' || shapeType === 'polyline' || shapeType === 'polygon') {
    const pointRadius = 10 / zoomLevel;
    let points = [];
    if (shapeType === 'line') {
      points = [
        [Number.parseFloat(path.getAttribute('x1') || '0'), Number.parseFloat(path.getAttribute('y1') || '0')],
        [Number.parseFloat(path.getAttribute('x2') || '0'), Number.parseFloat(path.getAttribute('y2') || '0')]
      ];
    } else {
      points = (path.getAttribute('points') || '')
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(',').map((n) => Number.parseFloat(n)))
        .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
    }

    points.forEach((pt, idx) => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', String(pt[0]));
      circle.setAttribute('cy', String(pt[1]));
      circle.setAttribute('r', String(pointRadius));
      circle.setAttribute('fill', '#3b82f6');
      circle.setAttribute('stroke', '#1f2937');
      circle.setAttribute('stroke-width', '1');
      circle.style.cursor = 'grab';
      circle.style.pointerEvents = 'auto';

      circle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const handle = editHandles.find((h) => h.element === circle);
        if (handle) {
          pushHistoryState();
          handle.isDragging = true;
        }
      });

      tempGroup.appendChild(circle);
      editHandles.push({ element: circle, data: { type: 'shape-point', pointIdx: idx }, isDragging: false });
    });
    return;
  }

  if (shapeType === 'rect' || shapeType === 'ellipse' || shapeType === 'circle') {
    const controlSize = 12 / zoomLevel;
    const halfControlSize = controlSize / 2;
    const box = (() => {
      if (shapeType === 'rect') {
        const x = Number.parseFloat(path.getAttribute('x') || '0');
        const y = Number.parseFloat(path.getAttribute('y') || '0');
        const width = Number.parseFloat(path.getAttribute('width') || '0');
        const height = Number.parseFloat(path.getAttribute('height') || '0');
        return { left: x, top: y, right: x + width, bottom: y + height };
      }
      const cx = Number.parseFloat(path.getAttribute('cx') || '0');
      const cy = Number.parseFloat(path.getAttribute('cy') || '0');
      if (shapeType === 'ellipse') {
        const rx = Number.parseFloat(path.getAttribute('rx') || '0');
        const ry = Number.parseFloat(path.getAttribute('ry') || '0');
        return { left: cx - rx, top: cy - ry, right: cx + rx, bottom: cy + ry };
      }
      const r = Number.parseFloat(path.getAttribute('r') || '0');
      return { left: cx - r, top: cy - r, right: cx + r, bottom: cy + r };
    })();

    const corners = [
      [box.left, box.top],
      [box.right, box.top],
      [box.right, box.bottom],
      [box.left, box.bottom]
    ];

    corners.forEach((cornerPt, cornerIdx) => {
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(cornerPt[0] - halfControlSize));
      sq.setAttribute('y', String(cornerPt[1] - halfControlSize));
      sq.setAttribute('width', String(controlSize));
      sq.setAttribute('height', String(controlSize));
      sq.setAttribute('fill', '#3b82f6');
      sq.setAttribute('stroke', '#1f2937');
      sq.setAttribute('stroke-width', '1');
      sq.style.cursor = 'nwse-resize';
      sq.style.pointerEvents = 'auto';

      sq.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const handle = editHandles.find((h) => h.element === sq);
        if (handle) {
          pushHistoryState();
          const oppositePt = corners[(cornerIdx + 2) % 4];
          handle.data.anchor = { x: oppositePt[0], y: oppositePt[1] };
          handle.isDragging = true;
        }
      });

      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'bbox-corner', corner: cornerIdx }, isDragging: false });
    });
    return;
  }

  const points = JSON.parse(path.getAttribute('data-points'));
  const controls = JSON.parse(path.getAttribute('data-controls')) || [];
  const pointRadius = 10 / zoomLevel;
  const controlSize = 12 / zoomLevel;
  const halfControlSize = controlSize / 2;
  
  points.forEach((pt, idx) => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', String(pt[0]));
    circle.setAttribute('cy', String(pt[1]));
    circle.setAttribute('r', String(pointRadius));
    circle.setAttribute('fill', '#3b82f6');
    circle.setAttribute('stroke', '#1f2937');
    circle.setAttribute('stroke-width', '1');
    circle.style.cursor = 'grab';
    circle.style.pointerEvents = 'auto';
    
    circle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === circle);
      if (handle) {
        pushHistoryState();
        handle.isDragging = true;
      }
    });
    
    tempGroup.appendChild(circle);
    editHandles.push({ element: circle, data: { type: 'point', pointIdx: idx }, isDragging: false });
  });
  
  controls.forEach((ctrl, idx) => {
    if (!ctrl) return;
    
    if (ctrl.cp) {
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(ctrl.cp.x - halfControlSize));
      sq.setAttribute('y', String(ctrl.cp.y - halfControlSize));
      sq.setAttribute('width', String(controlSize));
      sq.setAttribute('height', String(controlSize));
      sq.setAttribute('fill', '#ef4444');
      sq.setAttribute('stroke', '#1f2937');
      sq.setAttribute('stroke-width', '1');
      sq.style.cursor = 'grab';
      sq.style.pointerEvents = 'auto';
      
      sq.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const handle = editHandles.find((h) => h.element === sq);
        if (handle) {
          pushHistoryState();
          handle.isDragging = true;
        }
      });
      
      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'control', pointIdx: idx, controlType: 'cp' }, isDragging: false });
    }
    
    if (ctrl.cp1) {
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(ctrl.cp1.x - halfControlSize));
      sq.setAttribute('y', String(ctrl.cp1.y - halfControlSize));
      sq.setAttribute('width', String(controlSize));
      sq.setAttribute('height', String(controlSize));
      sq.setAttribute('fill', '#f97316');
      sq.setAttribute('stroke', '#1f2937');
      sq.setAttribute('stroke-width', '1');
      sq.style.cursor = 'grab';
      sq.style.pointerEvents = 'auto';
      
      sq.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const handle = editHandles.find((h) => h.element === sq);
        if (handle) {
          pushHistoryState();
          handle.isDragging = true;
        }
      });
      
      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'control', pointIdx: idx, controlType: 'cp1' }, isDragging: false });
    }
    
    if (ctrl.cp2) {
      const sq = document.createElementNS(svgNS, 'rect');
      sq.setAttribute('x', String(ctrl.cp2.x - halfControlSize));
      sq.setAttribute('y', String(ctrl.cp2.y - halfControlSize));
      sq.setAttribute('width', String(controlSize));
      sq.setAttribute('height', String(controlSize));
      sq.setAttribute('fill', '#06b6d4');
      sq.setAttribute('stroke', '#1f2937');
      sq.setAttribute('stroke-width', '1');
      sq.style.cursor = 'grab';
      sq.style.pointerEvents = 'auto';
      
      sq.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const handle = editHandles.find((h) => h.element === sq);
        if (handle) {
          pushHistoryState();
          handle.isDragging = true;
        }
      });
      
      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'control', pointIdx: idx, controlType: 'cp2' }, isDragging: false });
    }
  });
}

function enterEditMode(path) {
  exitEditMode();
  setSelectedPath(path);
  editingPath = path;
  editingPath.classList.add('editingPolygon');
  if (editingPath.tagName.toLowerCase() === 'text') {
    syncTextControlsFromElement(editingPath);
  }
  renderEditHandles(path);
  document.addEventListener('mousemove', handleEditDrag);
  document.addEventListener('mouseup', handleEditEnd);
}

function buildPathData(points, curveTypes, controls, closed) {
  if (points.length === 0) return '';
  
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const curveType = curveTypes[i - 1] || 'line';
    
    if (curveType === 'quadratic' && controls[i]) {
      const { cp } = controls[i];
      path += ` Q ${cp.x} ${cp.y} ${x} ${y}`;
    } else if (curveType === 'cubic' && controls[i]) {
      const { cp1, cp2 } = controls[i];
      path += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  if (closed) {
    const curveType = curveTypes[curveTypes.length - 1] || 'line';
    const [x, y] = points[0];
    
    if (curveType === 'quadratic' && controls[0]) {
      const { cp } = controls[0];
      path += ` Q ${cp.x} ${cp.y} ${x} ${y}`;
    } else if (curveType === 'cubic' && controls[0]) {
      const { cp1, cp2 } = controls[0];
      path += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
    path += ' Z';
  }
  
  return path;
}

function getActiveLayer() {
  return layers.find((layer) => layer.id === activeLayerId) || null;
}

function setActiveLayer(layerId) {
  activeLayerId = layerId;
  renderLayersList();
}

function bindPathInteractions(shape) {
  shape.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;

    if (currentTool === 'fill') {
      if (isPathLocked(shape)) return;
      const currentFill = getCurrentFill();
      const tag = shape.tagName.toLowerCase();
      const fillAttr = (tag === 'line' || tag === 'polyline') ? 'stroke' : 'fill';
      const hasGradient = shape.getAttribute('data-gradient');
      const solidMatch = typeof currentFill === 'string' && !hasGradient && shape.getAttribute(fillAttr) === currentFill;
      if (!solidMatch || typeof currentFill !== 'string') {
        pushHistoryState();
        applyFill(shape, currentFill);
      }
      e.stopPropagation();
      return;
    }

    if (currentTool === 'eyedropper') return;
    if (isPathLocked(shape)) return;

    setSelectedPath(shape);
    e.stopPropagation();
  });

  shape.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPathLocked(shape)) return;

    const tag = shape.tagName.toLowerCase();
    if (!['path', 'rect', 'ellipse', 'circle', 'line', 'polyline', 'polygon', 'text'].includes(tag)) return;

    if (selectedPath !== shape) {
      setSelectedPath(shape);
      return;
    }

    if (editingPath === shape) {
      exitEditMode();
    } else {
      enterEditMode(shape);
    }
  });
}

function createLayer(name) {
  layerCounter += 1;
  const id = `layer-${layerCounter}`;
  const layerName = name || `Layer ${layerCounter}`;
  const group = document.createElementNS(svgNS, 'g');
  group.setAttribute('data-layer-id', id);
  group.setAttribute('aria-label', layerName);
  svgOverlay.insertBefore(group, tempGroup);

  layers.unshift({
    id,
    name: layerName,
    visible: true,
    locked: false,
    group
  });

  setActiveLayer(id);
  return id;
}

function setLayerVisibility(layerId, visible) {
  const layer = layers.find((item) => item.id === layerId);
  if (!layer) return;
  pushHistoryState();
  layer.visible = visible;
  layer.group.style.display = visible ? '' : 'none';
  renderLayersList();
}

function setLayerLocked(layerId, locked) {
  const layer = layers.find((item) => item.id === layerId);
  if (!layer) return;
  pushHistoryState();
  layer.locked = locked;

  if (layer.locked && editingPath && getLayerForPath(editingPath)?.id === layerId) {
    exitEditMode();
  }

  renderLayersList();
}

function moveLayer(layerId, dir) {
  const idx = layers.findIndex((l) => l.id === layerId);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= layers.length) return;

  pushHistoryState();

  const tmp = layers[idx];
  layers[idx] = layers[newIdx];
  layers[newIdx] = tmp;

  // Rebuild SVG DOM order: layers[0] = top of stack = last before tempGroup
  for (let i = layers.length - 1; i >= 0; i--) {
    svgOverlay.insertBefore(layers[i].group, tempGroup);
  }

  renderLayersList();
}

function deleteLayer(layerId) {
  const idx = layers.findIndex((l) => l.id === layerId);
  if (idx === -1) return;

  pushHistoryState();

  const layer = layers[idx];
  if (editingPath && getLayerForPath(editingPath)?.id === layerId) exitEditMode();
  if (selectedPath && getLayerForPath(selectedPath)?.id === layerId) setSelectedPath(null);

  layer.group.remove();
  layers.splice(idx, 1);
  if (activeLayerId === layerId) {
    activeLayerId = layers.length > 0 ? layers[Math.max(0, idx - 1)].id : null;
  }
  if (layers.length === 0) createLayer('Layer 1');
  else renderLayersList();
}

function renderLayersList() {
  layersList.innerHTML = '';

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const item = document.createElement('li');
    item.className = 'layerItem';

    const row = document.createElement('div');
    row.className = 'layerRow';

    const activeWrap = document.createElement('label');
    const activeRadio = document.createElement('input');
    activeRadio.type = 'radio';
    activeRadio.name = 'activeLayer';
    activeRadio.checked = layer.id === activeLayerId;
    activeRadio.addEventListener('change', () => setActiveLayer(layer.id));
    activeWrap.appendChild(activeRadio);

    const name = document.createElement('span');
    name.className = 'layerName';
    name.textContent = layer.name;

    const visibleWrap = document.createElement('label');
    const visibleCheck = document.createElement('input');
    visibleCheck.type = 'checkbox';
    visibleCheck.checked = layer.visible;
    visibleCheck.title = 'Layer visibility';
    visibleCheck.addEventListener('change', () => setLayerVisibility(layer.id, visibleCheck.checked));
    visibleWrap.appendChild(visibleCheck);

    const lockWrap = document.createElement('label');
    lockWrap.className = 'layerLockLabel';
    lockWrap.title = 'Lock layer to prevent accidental edits';
    const lockCheck = document.createElement('input');
    lockCheck.type = 'checkbox';
    lockCheck.checked = !!layer.locked;
    lockCheck.addEventListener('change', () => setLayerLocked(layer.id, lockCheck.checked));
    lockWrap.appendChild(lockCheck);
    lockWrap.appendChild(document.createTextNode('Lock'));

    const reorderBtns = document.createElement('div');
    reorderBtns.className = 'layerReorderBtns';

    const upBtn = document.createElement('button');
    upBtn.className = 'layerReorderBtn';
    upBtn.textContent = '▲';
    upBtn.title = 'Move layer up';
    upBtn.disabled = i === 0;
    upBtn.addEventListener('click', () => moveLayer(layer.id, -1));

    const downBtn = document.createElement('button');
    downBtn.className = 'layerReorderBtn';
    downBtn.textContent = '▼';
    downBtn.title = 'Move layer down';
    downBtn.disabled = i === layers.length - 1;
    downBtn.addEventListener('click', () => moveLayer(layer.id, 1));

    reorderBtns.appendChild(upBtn);
    reorderBtns.appendChild(downBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'layerDeleteBtn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete layer';
    deleteBtn.disabled = layers.length === 1;
    deleteBtn.addEventListener('click', () => deleteLayer(layer.id));

    row.appendChild(activeWrap);
    row.appendChild(name);
    row.appendChild(reorderBtns);
    row.appendChild(visibleWrap);
    row.appendChild(lockWrap);
    row.appendChild(deleteBtn);
    item.appendChild(row);

    const polygons = Array.from(layer.group.querySelectorAll('path, rect, ellipse, circle, line, polyline, polygon, text'));
    if (polygons.length > 0) {
      const polygonsList = document.createElement('div');
      polygonsList.className = 'layerPolygonsList';

      polygons.forEach((polygon, idx) => {
        const polygonRow = document.createElement('div');
        polygonRow.className = 'layerPolygonRow';

        const polygonLabel = document.createElement('span');
        polygonLabel.className = 'layerPolygonName';
        const shapeType = polygon.tagName.toLowerCase();
        const displayType = shapeType === 'rect'
          ? 'Rectangle'
          : (shapeType === 'ellipse'
            ? 'Ellipse'
            : (shapeType === 'circle'
              ? 'Circle'
              : (shapeType === 'line'
                ? 'Line'
                : (shapeType === 'polyline'
                  ? 'Polyline'
                  : (shapeType === 'text' ? 'Text' : 'Polygon')))));
        polygonLabel.textContent = `${displayType} ${idx + 1}`;
        polygonLabel.title = 'Click polygon in canvas to select, then right-click to edit';

        const polygonDeleteBtn = document.createElement('button');
        polygonDeleteBtn.className = 'layerPolygonDeleteBtn';
        polygonDeleteBtn.textContent = 'Delete';
        polygonDeleteBtn.title = `Delete Polygon ${idx + 1}`;
        polygonDeleteBtn.disabled = !!layer.locked;
        polygonDeleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          removePolygon(polygon, true);
        });

        polygonRow.appendChild(polygonLabel);
        polygonRow.appendChild(polygonDeleteBtn);
        polygonsList.appendChild(polygonRow);
      });

      item.appendChild(polygonsList);
    }

    layersList.appendChild(item);
  }
}

function addPolygon(points, curveTypes, controls, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const safeCurveTypes = Array.isArray(curveTypes) ? curveTypes : [];
  const isStraightOnly = safeCurveTypes.every((t) => t === 'line');

  if (isStraightOnly) {
    const polygon = createPolygonElement(points, color);
    activeLayer.group.appendChild(polygon);
    setSelectedPath(polygon);
  } else {
    const path = createPathElement(points, curveTypes, controls, color);
    activeLayer.group.appendChild(path);
    setSelectedPath(path);
  }

  renderLayersList();
}

function addRect(x, y, width, height, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const rect = createRectElement(x, y, width, height, color);
  activeLayer.group.appendChild(rect);
  setSelectedPath(rect);
  renderLayersList();
}

function addEllipse(cx, cy, rx, ry, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const ellipse = createEllipseElement(cx, cy, rx, ry, color);
  activeLayer.group.appendChild(ellipse);
  setSelectedPath(ellipse);
  renderLayersList();
}

function addCircle(cx, cy, r, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const circle = createCircleElement(cx, cy, r, color);
  activeLayer.group.appendChild(circle);
  setSelectedPath(circle);
  renderLayersList();
}

function addLine(x1, y1, x2, y2, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const line = createLineElement(x1, y1, x2, y2, color);
  activeLayer.group.appendChild(line);
  setSelectedPath(line);
  renderLayersList();
}

function addPolyline(points, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const polyline = createPolylineElement(points, color);
  activeLayer.group.appendChild(polyline);
  setSelectedPath(polyline);
  renderLayersList();
}

function addPolygonShape(points, color) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const polygon = createPolygonElement(points, color);
  activeLayer.group.appendChild(polygon);
  setSelectedPath(polygon);
  renderLayersList();
}

function addText(content, x, y, color, fontFamily, fontSize) {
  const activeLayer = getActiveLayer();
  if (!activeLayer || activeLayer.locked) return;

  const text = createTextElement(content, x, y, color, fontFamily, fontSize);
  activeLayer.group.appendChild(text);
  setSelectedPath(text);
  renderLayersList();
}

function renderTempPath() {
  if (polylineDrawing && polylinePoints.length > 0) {
    let pointsStr = polylinePoints.map(([x, y]) => `${x},${y}`).join(' ');
    if (polylineHoverPoint) {
      pointsStr += ` ${polylineHoverPoint[0]},${polylineHoverPoint[1]}`;
    }
    tempPolylineOuter.setAttribute('points', pointsStr);
    tempPolyline.setAttribute('points', pointsStr);
    tempPolyline.setAttribute('stroke', pickedColor);

    const [fx, fy] = polylinePoints[0];
    tempCircle.style.display = '';
    tempCircleOuter.style.display = '';
    tempCircle.setAttribute('cx', String(fx));
    tempCircle.setAttribute('cy', String(fy));
    tempCircleOuter.setAttribute('cx', String(fx));
    tempCircleOuter.setAttribute('cy', String(fy));
    const radius = 8 / zoomLevel;
    tempCircle.setAttribute('r', String(radius));
    tempCircleOuter.setAttribute('r', String(radius));
    return;
  }

  if (!tracing || currentPoints.length === 0) {
    tempPolylineOuter.setAttribute('points', '');
    tempPolyline.setAttribute('points', '');
    tempCircle.style.display = 'none';
    tempCircleOuter.style.display = 'none';
    return;
  }

  let pointsStr = currentPoints.map(([x, y]) => `${x},${y}`).join(' ');
  if (hoverPoint) {
    pointsStr += ` ${hoverPoint[0]},${hoverPoint[1]}`;
  }
  tempPolylineOuter.setAttribute('points', pointsStr);
  tempPolyline.setAttribute('points', pointsStr);
  tempPolyline.setAttribute('stroke', pickedColor);

  const [fx, fy] = currentPoints[0];
  tempCircle.style.display = '';
  tempCircleOuter.style.display = '';
  tempCircle.setAttribute('cx', String(fx));
  tempCircle.setAttribute('cy', String(fy));
  tempCircleOuter.setAttribute('cx', String(fx));
  tempCircleOuter.setAttribute('cy', String(fy));
  const radius = 8 / zoomLevel;
  tempCircle.setAttribute('r', String(radius));
  tempCircleOuter.setAttribute('r', String(radius));
}

function getSvgPoint(e) {
  const rect = canvasViewport.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoomLevel;
  const y = (e.clientY - rect.top - panY) / zoomLevel;
  return [x, y];
}

function handleTraceClick(point) {
  const [x, y] = point;
  if (!tracing) {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.locked) return;

    tracing = true;
    currentPoints = [[x, y]];
    currentCurveTypes = [];
    currentControls = [null];
    nextCurveType = 'line';
    hoverPoint = null;
    curveSelector.style.display = '';
    setCurveType('line');
    renderTempPath();
    return;
  }

  const [fx, fy] = currentPoints[0];
  if (currentPoints.length > 2 && Math.hypot(x - fx, y - fy) < 10) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      const firstPoint = currentPoints[0];
      currentCurveTypes.push(nextCurveType);
    
      if (nextCurveType === 'quadratic') {
        const cpx = (lastPoint[0] + firstPoint[0]) / 2;
        const cpy = (lastPoint[1] + firstPoint[1]) / 2;
        if (!currentControls[0]) currentControls[0] = {};
        currentControls[0].cp = { x: cpx, y: cpy };
      } else if (nextCurveType === 'cubic') {
        const cp1x = lastPoint[0] + (firstPoint[0] - lastPoint[0]) / 3;
        const cp1y = lastPoint[1] + (firstPoint[1] - lastPoint[1]) / 3;
        const cp2x = lastPoint[0] + (firstPoint[0] - lastPoint[0]) * 2 / 3;
        const cp2y = lastPoint[1] + (firstPoint[1] - lastPoint[1]) * 2 / 3;
        if (!currentControls[0]) currentControls[0] = {};
        currentControls[0].cp1 = { x: cp1x, y: cp1y };
        currentControls[0].cp2 = { x: cp2x, y: cp2y };
      }

    pushHistoryState();
    addPolygon(currentPoints, currentCurveTypes, currentControls, getCurrentFill());
    cancelCurrentTrace();
    return;
  }

  currentPoints.push([x, y]);
  currentCurveTypes.push(nextCurveType);
  
  const prev = currentPoints[currentPoints.length - 2];
  const curr = [x, y];

  if (nextCurveType === 'quadratic') {
    const cpx = (prev[0] + curr[0]) / 2;
    const cpy = (prev[1] + curr[1]) / 2;
    currentControls.push({ cp: { x: cpx, y: cpy } });
  } else if (nextCurveType === 'cubic') {
    const cp1x = prev[0] + (curr[0] - prev[0]) / 3;
    const cp1y = prev[1] + (curr[1] - prev[1]) / 3;
    const cp2x = prev[0] + (curr[0] - prev[0]) * 2 / 3;
    const cp2y = prev[1] + (curr[1] - prev[1]) * 2 / 3;
    currentControls.push({ cp1: { x: cp1x, y: cp1y }, cp2: { x: cp2x, y: cp2y } });
  } else {
    currentControls.push(null);
  }
  
  hoverPoint = null;
  renderTempPath();
}

function finishPolylineDrawing(closed) {
  if (!polylineDrawing) {
    cancelCurrentTrace();
    return;
  }
  if (polylinePoints.length < 2) {
    cancelCurrentTrace();
    return;
  }

  pushHistoryState();
  if (closed && polylinePoints.length >= 3) {
    addPolygonShape(polylinePoints, getCurrentFill());
  } else if (polylinePoints.length === 2) {
    const [p1, p2] = polylinePoints;
    addLine(p1[0], p1[1], p2[0], p2[1], getCurrentFill());
  } else {
    addPolyline(polylinePoints, getCurrentFill());
  }
  cancelCurrentTrace();
}

function handlePolylineClick(point) {
  const [x, y] = point;
  if (!polylineDrawing) {
    polylineDrawing = true;
    polylinePoints = [[x, y]];
    polylineHoverPoint = null;
    renderTempPath();
    return;
  }

  const [fx, fy] = polylinePoints[0];
  if (polylinePoints.length > 2 && Math.hypot(x - fx, y - fy) < 10) {
    finishPolylineDrawing(true);
    return;
  }

  polylinePoints.push([x, y]);
  polylineHoverPoint = null;
  renderTempPath();
}

function setCanvasSize(width, height) {
  imageCanvas.width = width;
  imageCanvas.height = height;
  imageCanvas.style.width = `${width}px`;
  imageCanvas.style.height = `${height}px`;
  svgOverlay.setAttribute('width', String(width));
  svgOverlay.setAttribute('height', String(height));
  svgOverlay.style.width = `${width}px`;
  svgOverlay.style.height = `${height}px`;
  canvasWrapper.style.width = `${width}px`;
  canvasWrapper.style.height = `${height}px`;
  baseCanvasWidth = width;
  baseCanvasHeight = height;
  requestAnimationFrame(centerImage);
}

function handleImage(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      setCanvasSize(img.width, img.height);
      ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function expandBounds(bounds, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function getExportBounds() {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  };

  layers.forEach((layer) => {
    const shapes = layer.group.querySelectorAll('path, rect, ellipse, circle, line, polyline, polygon, text');
    shapes.forEach((shape) => {
      const type = shape.tagName.toLowerCase();

      if (type === 'text') {
        const x = Number.parseFloat(shape.getAttribute('x') || '0');
        const y = Number.parseFloat(shape.getAttribute('y') || '0');
        const fontSize = Number.parseFloat(shape.getAttribute('font-size') || '48');
        const textValue = shape.textContent || '';
        const approxWidth = textValue.length * fontSize * 0.62;
        const top = y - fontSize;
        expandBounds(bounds, x, top);
        expandBounds(bounds, x + approxWidth, y);
        return;
      }

      if (type === 'line') {
        const x1 = Number.parseFloat(shape.getAttribute('x1') || '0');
        const y1 = Number.parseFloat(shape.getAttribute('y1') || '0');
        const x2 = Number.parseFloat(shape.getAttribute('x2') || '0');
        const y2 = Number.parseFloat(shape.getAttribute('y2') || '0');
        expandBounds(bounds, x1, y1);
        expandBounds(bounds, x2, y2);
        return;
      }

      if (type === 'polyline' || type === 'polygon') {
        const pointsText = shape.getAttribute('points') || '';
        pointsText
          .trim()
          .split(/\s+/)
          .forEach((pair) => {
            const [px, py] = pair.split(',').map((n) => Number.parseFloat(n));
            expandBounds(bounds, px, py);
          });
        return;
      }

      if (type === 'rect') {
        const x = Number.parseFloat(shape.getAttribute('x') || '0');
        const y = Number.parseFloat(shape.getAttribute('y') || '0');
        const w = Number.parseFloat(shape.getAttribute('width') || '0');
        const h = Number.parseFloat(shape.getAttribute('height') || '0');
        expandBounds(bounds, x, y);
        expandBounds(bounds, x + w, y + h);
        return;
      }

      if (type === 'ellipse') {
        const cx = Number.parseFloat(shape.getAttribute('cx') || '0');
        const cy = Number.parseFloat(shape.getAttribute('cy') || '0');
        const rx = Number.parseFloat(shape.getAttribute('rx') || '0');
        const ry = Number.parseFloat(shape.getAttribute('ry') || '0');
        expandBounds(bounds, cx - rx, cy - ry);
        expandBounds(bounds, cx + rx, cy + ry);
        return;
      }

      if (type === 'circle') {
        const cx = Number.parseFloat(shape.getAttribute('cx') || '0');
        const cy = Number.parseFloat(shape.getAttribute('cy') || '0');
        const r = Number.parseFloat(shape.getAttribute('r') || '0');
        expandBounds(bounds, cx - r, cy - r);
        expandBounds(bounds, cx + r, cy + r);
        return;
      }

      const points = JSON.parse(shape.getAttribute('data-points') || '[]');
      const controls = JSON.parse(shape.getAttribute('data-controls') || '[]');
      if (Array.isArray(points) && points.length > 0) {
        points.forEach(([x, y]) => expandBounds(bounds, x, y));
      }
      if (Array.isArray(controls) && controls.length > 0) {
        controls.forEach((control) => {
          if (!control) return;
          if (control.cp) expandBounds(bounds, control.cp.x, control.cp.y);
          if (control.cp1) expandBounds(bounds, control.cp1.x, control.cp1.y);
          if (control.cp2) expandBounds(bounds, control.cp2.x, control.cp2.y);
        });
      }
    });
  });

  if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY) || !Number.isFinite(bounds.maxX) || !Number.isFinite(bounds.maxY)) {
    return null;
  }

  return bounds;
}

function exportSvg() {
  const bounds = getExportBounds();
  if (!bounds) return;

  const padding = 1;
  const exportMinX = bounds.minX - padding;
  const exportMinY = bounds.minY - padding;
  const exportWidth = Math.max(1, bounds.maxX - bounds.minX + padding * 2);
  const exportHeight = Math.max(1, bounds.maxY - bounds.minY + padding * 2);

  const clone = svgOverlay.cloneNode(true);
  const cloneTemp = clone.querySelector('#tempGroup');
  if (cloneTemp) cloneTemp.remove();

  if (convertTextToPathsCheck && convertTextToPathsCheck.checked) {
    const textElements = Array.from(clone.querySelectorAll('text'));
    const missingFonts = new Set();
    const skippedBuiltinFonts = new Set();
    let convertedTextCount = 0;
    const webSafeFonts = new Set([
      'arial', 'trebuchet ms', 'georgia', 'times new roman', 'courier new',
      'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'
    ]);

    const normalizeFamilyName = (familyName) => familyName
      .replace(/^['"]|['"]$/g, '')
      .trim()
      .toLowerCase();

    const getFamilyCandidates = (familyName) => String(familyName || '')
      .split(',')
      .map((part) => normalizeFamilyName(part))
      .filter(Boolean);

    const loadedFonts = Array.from(loadedFontMap.entries()).map(([name, font]) => ({
      name,
      font,
      normalizedName: normalizeFamilyName(name)
    }));

    const resolveLoadedFont = (familyName) => {
      const candidates = getFamilyCandidates(familyName);
      for (const candidate of candidates) {
        const exactMatch = loadedFonts.find((entry) => entry.normalizedName === candidate);
        if (exactMatch) return exactMatch.font;

        const partialMatch = loadedFonts.find((entry) => (
          entry.normalizedName.includes(candidate)
          || candidate.includes(entry.normalizedName)
        ));
        if (partialMatch) return partialMatch.font;
      }
      return null;
    };

    textElements.forEach((textEl) => {
      const family = textEl.getAttribute('font-family') || 'Arial';
      const candidates = getFamilyCandidates(family);
      const font = resolveLoadedFont(family);
      if (!font) {
        const allWebSafe = candidates.length > 0 && candidates.every((name) => webSafeFonts.has(name));
        if (!allWebSafe) {
          missingFonts.add(family);
        } else {
          skippedBuiltinFonts.add(family);
        }
        return;
      }

      const x = Number.parseFloat(textEl.getAttribute('x') || '0');
      const y = Number.parseFloat(textEl.getAttribute('y') || '0');
      const fontSize = Number.parseFloat(textEl.getAttribute('font-size') || '48');
      const textValue = textEl.textContent || '';
      const fill = textEl.getAttribute('fill') || '#000000';
      const stroke = textEl.getAttribute('stroke') || 'none';
      const strokeWidth = textEl.getAttribute('stroke-width') || '1';

      const pathData = font.getPath(textValue, x, y, fontSize).toPathData(3);
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', fill);
      path.setAttribute('stroke', stroke);
      path.setAttribute('stroke-width', strokeWidth);
      textEl.replaceWith(path);
      convertedTextCount++;
    });

    if (missingFonts.size > 0) {
      window.alert(`Could not convert text to paths for fonts: ${Array.from(missingFonts).join(', ')}. Load those fonts via the font file input first.`);
    }

    if (skippedBuiltinFonts.size > 0) {
      window.alert(
        `Some text stayed as <text> because those fonts are browser/system fonts without outline data available to JavaScript: ${Array.from(skippedBuiltinFonts).join(', ')}. `
        + 'To convert them to paths, load the matching .ttf/.otf font file first.'
      );
    }

    if (textElements.length > 0 && convertedTextCount === 0) {
      window.alert('No text was converted to paths in this export. Load the font files used by your text via the font file input, then export again.');
    }
  }

  const translatedGroup = document.createElementNS(svgNS, 'g');
  translatedGroup.setAttribute('transform', `translate(${-exportMinX} ${-exportMinY})`);
  while (clone.firstChild) {
    translatedGroup.appendChild(clone.firstChild);
  }
  clone.appendChild(translatedGroup);

  clone.setAttribute('width', String(exportWidth));
  clone.setAttribute('height', String(exportHeight));
  clone.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);
  clone.style.width = `${exportWidth}px`;
  clone.style.height = `${exportHeight}px`;

  const svgData = clone.outerHTML;
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'traced.svg';
  a.click();
  URL.revokeObjectURL(url);
}

imageLoader.addEventListener('change', handleImage);

traceToolBtn.addEventListener('click', () => setTool('trace'));
lineToolBtn.addEventListener('click', () => setTool('line'));
textToolBtn.addEventListener('click', () => setTool('text'));
rectToolBtn.addEventListener('click', () => setTool('rect'));
ellipseToolBtn.addEventListener('click', () => setTool('ellipse'));
circleToolBtn.addEventListener('click', () => setTool('circle'));
fillToolBtn.addEventListener('click', () => setTool('fill'));
eyedropperBtn.addEventListener('click', () => {
  if (currentTool === 'eyedropper') {
    setTool(previousTool);
  } else {
    setTool('eyedropper');
  }
});

curveLineBtn.addEventListener('click', () => setCurveType('line'));
curveQuadBtn.addEventListener('click', () => setCurveType('quadratic'));
curveCubicBtn.addEventListener('click', () => setCurveType('cubic'));

cancelTraceBtn.addEventListener('click', cancelCurrentTrace);
document.addEventListener('keydown', (e) => {
  const target = e.target;
  const isTypingTarget = target instanceof HTMLElement
    && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
  const key = e.key.toLowerCase();

  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (key === 'y') {
      e.preventDefault();
      redo();
      return;
    }
  }

  if (key === 'h' && editingPath) {
    e.preventDefault();
    handlesVisible = !handlesVisible;
    renderEditHandles(editingPath);
    return;
  }

  if (e.key === '?') {
    e.preventDefault();
    toggleHelp();
    return;
  }

  if (e.key === 'Enter' && polylineDrawing) {
    e.preventDefault();
    finishPolylineDrawing(false);
    return;
  }

  if (e.key === 'Escape') {
    if (helpOpen) {
      toggleHelp(false);
      return;
    }
    if (tracing || shapeDrawing || polylineDrawing) {
      cancelCurrentTrace();
    } else if (editingPath) {
      exitEditMode();
    } else {
      cancelCurrentTrace();
    }
  }

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTypingTarget) {
    if (editingPath) {
      e.preventDefault();
      removePolygon(editingPath, true);
    } else if (selectedPath) {
      e.preventDefault();
      removePolygon(selectedPath, true);
    }
  }

  if (e.code === 'Space' && !e.repeat && !isTypingTarget) {
    e.preventDefault();
    spaceHeld = true;
    canvasViewport.style.cursor = 'grab';
  }
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    spaceHeld = false;
    if (!isPanning) canvasViewport.style.cursor = '';
  }
});

imageCanvas.addEventListener('click', (e) => {
  if (currentTool !== 'eyedropper') return;
  const rect = imageCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * (imageCanvas.width / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (imageCanvas.height / rect.height));
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  setPickedColor(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
  setTool(previousTool);
});

if (fontFileInput) {
  fontFileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!window.opentype) {
      window.alert('opentype.js is not available, so font loading and text-to-path conversion are disabled.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const font = window.opentype.parse(buffer);
      const family = (font.names && (font.names.fullName?.en || font.names.fontFamily?.en))
        || file.name.replace(/\.[^/.]+$/, '');

      loadedFontMap.set(family, font);

      if (!Array.from(textFontSelect.options).some((opt) => opt.value === family)) {
        const option = document.createElement('option');
        option.value = family;
        option.textContent = family;
        textFontSelect.appendChild(option);
      }

      let fontUrl = loadedFontFaceUrls.get(family);
      if (!fontUrl) {
        fontUrl = URL.createObjectURL(file);
        loadedFontFaceUrls.set(family, fontUrl);
        const styleEl = document.createElement('style');
        styleEl.textContent = `@font-face { font-family: "${family}"; src: url("${fontUrl}"); }`;
        document.head.appendChild(styleEl);
      }

      textFontSelect.value = family;
    } catch (err) {
      window.alert('Could not load font file for text-to-path conversion.');
    }
  });
}

if (textInput) {
  textInput.addEventListener('input', () => {
    applyTextControlsToEditingText(false);
  });
}

if (textFontSelect) {
  textFontSelect.addEventListener('change', () => {
    applyTextControlsToEditingText(true);
  });
}

if (textSizeInput) {
  textSizeInput.addEventListener('input', () => {
    applyTextControlsToEditingText(false);
    if (editingPath && editingPath.tagName.toLowerCase() === 'text') {
      renderEditHandles(editingPath);
    }
  });
}

canvasViewport.addEventListener('mousemove', (e) => {
  if (isPanning) return;

  if (polylineDrawing) {
    polylineHoverPoint = getSvgPoint(e);
    renderTempPath();
    return;
  }

  if (shapeDrawing) {
    shapeHoverPoint = getSvgPoint(e);
    renderTempShapePath();
    return;
  }

  if (!tracing) return;
  hoverPoint = getSvgPoint(e);
  renderTempPath();
});

canvasViewport.addEventListener('mouseleave', () => {
  hoverPoint = null;
  if (polylineDrawing) polylineHoverPoint = null;
  renderTempPath();
});

canvasViewport.addEventListener('dblclick', (e) => {
  if (currentTool !== 'line' || !polylineDrawing) return;
  e.preventDefault();
  if (polylinePoints.length >= 2) {
    finishPolylineDrawing(false);
  }
});

toggleImageBtn.addEventListener('click', () => {
  imageVisible = !imageVisible;
  imageCanvas.style.display = imageVisible ? '' : 'none';
  toggleImageBtn.textContent = imageVisible ? 'Hide Image' : 'Show Image';
});

toggleSvgBtn.addEventListener('click', () => {
  svgVisible = !svgVisible;
  svgOverlay.style.display = svgVisible ? '' : 'none';
  toggleSvgBtn.textContent = svgVisible ? 'Hide SVG' : 'Show SVG';
  updateInteractionState();
});

addLayerBtn.addEventListener('click', () => {
  pushHistoryState();
  createLayer();
});

zoomOutBtn.addEventListener('click', () => {
  setZoom(zoomLevel / 1.2);
});

zoomInBtn.addEventListener('click', () => {
  setZoom(zoomLevel * 1.2);
});

zoomResetBtn.addEventListener('click', () => {
  setZoom(1);
  centerImage();
});

zoomRange.addEventListener('input', (e) => {
  const value = Number.parseFloat(e.target.value);
  if (!Number.isNaN(value)) {
    setZoom(value);
  }
});

darkModeBtn.addEventListener('click', () => {
  setDarkMode(!darkModeEnabled);
});

canvasViewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvasViewport.getBoundingClientRect();
  const originX = e.clientX - rect.left;
  const originY = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  setZoom(zoomLevel * factor, originX, originY);
}, { passive: false });

canvasViewport.addEventListener('mousedown', (e) => {
  if (e.button === 1 || (e.button === 0 && spaceHeld)) {
    e.preventDefault();
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panStartPanX = panX;
    panStartPanY = panY;
    canvasViewport.style.cursor = 'grabbing';
    return;
  }
  if (e.button !== 0) return;

  if (editingPath && !editHandles.some((h) => h.element === e.target)) {
    exitEditMode();
    return;
  }

  if (!tracing && !polylineDrawing) {
    setSelectedPath(null);
  }

  if (currentTool === 'eyedropper') return;
  if (currentTool === 'fill') return;

  const activeLayer = getActiveLayer();
  if (activeLayer && activeLayer.locked) return;

  const point = getSvgPoint(e);
  if (currentTool === 'text') {
    const textValue = (textInput && textInput.value.trim()) ? textInput.value : 'Text';
    const fontFamily = textFontSelect ? textFontSelect.value : 'Arial';
    const fontSize = Math.max(6, Number.parseFloat(textSizeInput?.value || '48') || 48);
    pushHistoryState();
    addText(textValue, point[0], point[1], getCurrentFill(), fontFamily, fontSize);
    return;
  }

  if (currentTool === 'line') {
    handlePolylineClick(point);
    return;
  }

  if (isShapeTool(currentTool)) {
    shapeDrawing = true;
    shapeStartPoint = point;
    shapeHoverPoint = point;
    renderTempShapePath();
    return;
  }

  handleTraceClick(point);
});

document.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  panX = panStartPanX + (e.clientX - panStartX);
  panY = panStartPanY + (e.clientY - panStartY);
  applyTransform();
});

document.addEventListener('mouseup', (e) => {
  if (isPanning && (e.button === 1 || e.button === 0)) {
    isPanning = false;
    canvasViewport.style.cursor = spaceHeld ? 'grab' : '';
    return;
  }

  if (e.button === 0 && shapeDrawing) {
    finishShapeDrawing();
  }
});

exportBtn.addEventListener('click', exportSvg);
if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);
if (helpBtn) helpBtn.addEventListener('click', () => toggleHelp());
colorPreview.addEventListener('click', () => {
  if (fillType === 'solid') colorPicker.click();
});
colorPicker.addEventListener('input', (e) => setPickedColor(e.target.value));
if (helpCloseBtn) helpCloseBtn.addEventListener('click', () => toggleHelp(false));
if (helpOverlay) helpOverlay.addEventListener('click', (e) => { if (e.target === helpOverlay) toggleHelp(false); });

fillTypeSolidBtn.addEventListener('click', () => setFillType('solid'));
fillTypeLinearBtn.addEventListener('click', () => setFillType('linear'));
fillTypeRadialBtn.addEventListener('click', () => setFillType('radial'));

addGradStopBtn.addEventListener('click', () => {
  const sorted = [...gradStops].sort((a, b) => a.offset - b.offset);
  let bestIdx = 0;
  let bestGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].offset - sorted[i].offset;
    if (gap > bestGap) { bestGap = gap; bestIdx = i; }
  }
  const newOffset = Math.round((sorted[bestIdx].offset + sorted[bestIdx + 1].offset) / 2);
  gradStops.push({ color: '#888888', offset: newOffset });
  gradStops.sort((a, b) => a.offset - b.offset);
  renderGradStopsUI();
  updateColorPreview();
});

gradAngleEl.addEventListener('input', (e) => {
  gradAngleValue = Number(e.target.value) || 0;
  updateColorPreview();
});

if (strokeEnabledCheck) {
  strokeEnabledCheck.addEventListener('change', (e) => {
    strokeEnabled = e.target.checked;
    updateStrokePreview();
  });
}

if (strokeColorPreview && strokeColorPicker) {
  strokeColorPreview.addEventListener('click', () => strokeColorPicker.click());
}

if (strokeColorPicker) {
  strokeColorPicker.addEventListener('input', (e) => {
    strokeColor = e.target.value;
    updateStrokePreview();
  });
}

if (strokeWidthInput) {
  strokeWidthInput.addEventListener('input', (e) => {
    strokeWidth = Math.max(0, Number(e.target.value) || 0);
  });
}

// TODO: Workflow polish: add a shortcut cheat sheet, confirmation dialogs for destructive actions, and autosave drafts to localStorage.
renderGradStopsUI();
updateStrokePreview();
setPickedColor('#000000');
createLayer('Layer 1');
setTool('trace');
setDarkMode(true);
setCanvasSize(800, 600);
toggleImageBtn.textContent = 'Hide Image';
toggleSvgBtn.textContent = 'Hide SVG';
updateHistoryButtons();
