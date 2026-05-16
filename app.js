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
const gridEnabledCheck = document.getElementById('gridEnabledCheck');
const gridSizeInput = document.getElementById('gridSizeInput');
const optimizeExportPathsCheck = document.getElementById('optimizeExportPathsCheck');
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
const booleanUnionBtn = document.getElementById('booleanUnionBtn');
const booleanIntersectBtn = document.getElementById('booleanIntersectBtn');
const booleanSubtractBtn = document.getElementById('booleanSubtractBtn');

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
let gridEnabled = false;
let gridSizeValue = 32;
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
let selectedPaths = [];
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
const gridGroup = document.createElementNS(svgNS, 'svg');
gridGroup.setAttribute('id', 'gridGroup');
gridGroup.setAttribute('x', '0');
gridGroup.setAttribute('y', '0');
gridGroup.setAttribute('preserveAspectRatio', 'none');
gridGroup.setAttribute('aria-hidden', 'true');
gridGroup.style.position = 'absolute';
gridGroup.style.top = '0';
gridGroup.style.left = '0';
gridGroup.style.overflow = 'visible';
gridGroup.style.pointerEvents = 'none';
const gridContentGroup = document.createElementNS(svgNS, 'g');
gridGroup.appendChild(gridContentGroup);
svgOverlay.appendChild(gridGroup);
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

function getGridConfig() {
  const size = Math.max(6, Number.parseFloat(gridSizeInput?.value || String(gridSizeValue)) || gridSizeValue);
  const screenCellSize = size * zoomLevel;
  const screenGap = screenCellSize / 2;
  let mode = 'corners';
  if (screenGap >= 20) mode = 'all';
  else if (screenGap >= 8) mode = 'no-center';
  return {
    enabled: !!gridEnabledCheck?.checked && gridEnabled,
    size,
    halfSize: size / 2,
    screenCellSize,
    screenGap,
    mode
  };
}

function gridPointAllowed(ix, iy, mode) {
  const evenX = Math.abs(ix) % 2 === 0;
  const evenY = Math.abs(iy) % 2 === 0;
  const oddX = !evenX;
  const oddY = !evenY;
  if (mode === 'all') return true;
  if (mode === 'no-center') return !(oddX && oddY);
  return evenX && evenY;
}

function snapPointToGrid(point) {
  const config = getGridConfig();
  if (!config.enabled) return point;

  const [x, y] = point;
  const step = config.halfSize;
  if (!Number.isFinite(step) || step <= 0) return point;

  const baseX = Math.round(x / step);
  const baseY = Math.round(y / step);
  let bestPoint = null;
  let bestScreenDist = Number.POSITIVE_INFINITY;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const ix = baseX + dx;
      const iy = baseY + dy;
      if (!gridPointAllowed(ix, iy, config.mode)) continue;
      const candidateX = ix * step;
      const candidateY = iy * step;
      const screenDist = Math.hypot((candidateX - x) * zoomLevel, (candidateY - y) * zoomLevel);
      if (screenDist < bestScreenDist) {
        bestScreenDist = screenDist;
        bestPoint = [candidateX, candidateY];
      }
    }
  }

  const snapThreshold = Math.min(10, Math.max(3, config.screenGap * 0.5));
  return bestPoint && bestScreenDist <= snapThreshold ? bestPoint : point;
}

function updateGridOverlay() {
  const config = getGridConfig();
  const width = Math.max(0, canvasWrapper.clientWidth || baseCanvasWidth);
  const height = Math.max(0, canvasWrapper.clientHeight || baseCanvasHeight);
  if (!gridGroup) return;
  gridContentGroup.innerHTML = '';

  if (!config.enabled) {
    gridGroup.style.display = 'none';
    return;
  }

  gridGroup.style.display = '';
  gridGroup.setAttribute('width', String(width));
  gridGroup.setAttribute('height', String(height));
  gridGroup.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const size = config.size;
  const halfSize = config.halfSize;
  const tinyGridMode = config.screenCellSize < 18;
  const pointRadius = tinyGridMode ? Math.max(3.25, 14 / Math.max(1, config.screenCellSize)) : 0;

  const makeLine = (x1, y1, x2, y2, stroke, widthValue, dash) => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', String(widthValue));
    line.setAttribute('shape-rendering', 'crispEdges');
    if (dash) line.setAttribute('stroke-dasharray', dash);
    return line;
  };

  const makeDot = (x, y, fill, opacity) => {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', String(pointRadius));
    dot.setAttribute('fill', fill);
    dot.setAttribute('stroke', 'rgba(255,255,255,0.65)');
    dot.setAttribute('stroke-width', String(Math.max(1, pointRadius * 0.3)));
    dot.setAttribute('opacity', String(opacity));
    dot.setAttribute('shape-rendering', 'geometricPrecision');
    return dot;
  };

  if (!tinyGridMode) {
    for (let x = 0; x <= width + 0.0001; x += size) {
      gridContentGroup.appendChild(makeLine(x, 0, x, height, 'rgba(120, 130, 140, 0.34)', 1));
    }
    for (let y = 0; y <= height + 0.0001; y += size) {
      gridContentGroup.appendChild(makeLine(0, y, width, y, 'rgba(120, 130, 140, 0.34)', 1));
    }

    if (config.mode !== 'corners') {
      for (let x = halfSize; x <= width + 0.0001; x += size) {
        gridContentGroup.appendChild(makeLine(x, 0, x, height, 'rgba(120, 130, 140, 0.18)', 1, '3 3'));
      }
      for (let y = halfSize; y <= height + 0.0001; y += size) {
        gridContentGroup.appendChild(makeLine(0, y, width, y, 'rgba(120, 130, 140, 0.18)', 1, '3 3'));
      }
    }
    return;
  }

  for (let gx = 0; gx <= width + 0.0001; gx += size) {
    for (let gy = 0; gy <= height + 0.0001; gy += size) {
      gridContentGroup.appendChild(makeDot(gx, gy, 'rgba(15, 108, 103, 0.95)', 1));
      if (config.mode !== 'corners') {
        gridContentGroup.appendChild(makeDot(gx + halfSize, gy, 'rgba(15, 108, 103, 0.80)', 1));
        gridContentGroup.appendChild(makeDot(gx, gy + halfSize, 'rgba(15, 108, 103, 0.80)', 1));
        if (config.mode === 'all') {
          gridContentGroup.appendChild(makeDot(gx + halfSize, gy + halfSize, 'rgba(239, 108, 47, 0.95)', 1));
        }
      }
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

function updateSelectedPathClasses() {
  selectedPaths.forEach((shape, idx) => {
    shape.classList.add('selectedPolygon');
    shape.classList.toggle('selectedPrimary', idx === 0);
  });
}

function clearSelectedPaths() {
  selectedPaths.forEach((shape) => {
    shape.classList.remove('selectedPolygon');
    shape.classList.remove('selectedPrimary');
  });
  selectedPaths = [];
  selectedPath = null;
}

function setSelectedPath(path) {
  if (selectedPaths.length === 1 && selectedPaths[0] === path) return;
  clearSelectedPaths();
  if (path) {
    selectedPaths = [path];
    selectedPath = path;
    updateSelectedPathClasses();
  }
}

function addPathToSelection(path) {
  if (!path) return;
  if (selectedPaths.includes(path)) return;
  selectedPaths.push(path);
  selectedPath = selectedPaths[0] || null;
  updateSelectedPathClasses();
}

function removePathFromSelection(path) {
  if (!path) return;
  const idx = selectedPaths.indexOf(path);
  if (idx === -1) return;
  path.classList.remove('selectedPolygon');
  path.classList.remove('selectedPrimary');
  selectedPaths.splice(idx, 1);
  selectedPath = selectedPaths[0] || null;
  updateSelectedPathClasses();
}

function togglePathSelection(path) {
  if (!path) return;
  if (selectedPaths.includes(path)) {
    removePathFromSelection(path);
  } else {
    addPathToSelection(path);
  }
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

function readBooleanMetadata(shape) {
  if (!shape) return {};
  const op = shape.getAttribute('data-boolean-op');
  const src = shape.getAttribute('data-boolean-source');
  const meta = {};
  if (op) meta.booleanOp = op;
  if (src) meta.booleanSource = src;
  return meta;
}

function writeBooleanMetadata(shape, meta) {
  if (!shape || !meta) return;
  if (meta.booleanOp) shape.setAttribute('data-boolean-op', meta.booleanOp);
  if (meta.booleanSource) shape.setAttribute('data-boolean-source', meta.booleanSource);
}

function snapshotShapeForBoolean(shape) {
  if (!shape) return null;
  const type = shape.tagName.toLowerCase();
  const base = {
    type,
    fill: shape.getAttribute('fill') || 'none',
    stroke: shape.getAttribute('stroke') || 'none',
    strokeWidth: shape.getAttribute('stroke-width') || '1'
  };

  if (shape.hasAttribute('data-gradient')) {
    base.gradient = shape.getAttribute('data-gradient');
  }

  if (type === 'rect') {
    base.x = shape.getAttribute('x') || '0';
    base.y = shape.getAttribute('y') || '0';
    base.width = shape.getAttribute('width') || '0';
    base.height = shape.getAttribute('height') || '0';
    return base;
  }
  if (type === 'ellipse') {
    base.cx = shape.getAttribute('cx') || '0';
    base.cy = shape.getAttribute('cy') || '0';
    base.rx = shape.getAttribute('rx') || '0';
    base.ry = shape.getAttribute('ry') || '0';
    return base;
  }
  if (type === 'circle') {
    base.cx = shape.getAttribute('cx') || '0';
    base.cy = shape.getAttribute('cy') || '0';
    base.r = shape.getAttribute('r') || '0';
    return base;
  }
  if (type === 'line') {
    base.x1 = shape.getAttribute('x1') || '0';
    base.y1 = shape.getAttribute('y1') || '0';
    base.x2 = shape.getAttribute('x2') || '0';
    base.y2 = shape.getAttribute('y2') || '0';
    return base;
  }
  if (type === 'polyline' || type === 'polygon') {
    base.points = shape.getAttribute('points') || '';
    return base;
  }
  if (type === 'text') {
    base.content = shape.textContent || '';
    base.x = shape.getAttribute('x') || '0';
    base.y = shape.getAttribute('y') || '0';
    base.fontFamily = shape.getAttribute('font-family') || 'Arial';
    base.fontSize = shape.getAttribute('font-size') || '48';
    base.fontWeight = shape.getAttribute('font-weight') || '400';
    base.fontStyle = shape.getAttribute('font-style') || 'normal';
    return base;
  }

  base.d = shape.getAttribute('d') || '';
  if (shape.hasAttribute('data-points')) base.dataPoints = shape.getAttribute('data-points');
  if (shape.hasAttribute('data-curve-types')) base.dataCurveTypes = shape.getAttribute('data-curve-types');
  if (shape.hasAttribute('data-controls')) base.dataControls = shape.getAttribute('data-controls');
  return base;
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
        const hasEditablePoints = shape.hasAttribute('data-points');
        if (hasEditablePoints) {
          return {
            type: 'path',
            pathKind: 'editable',
            points: JSON.parse(shape.getAttribute('data-points') || '[]'),
            curveTypes: JSON.parse(shape.getAttribute('data-curve-types') || '[]'),
            controls: JSON.parse(shape.getAttribute('data-controls') || '[]'),
            ...getShapeFill(shape, 'fill'),
            stroke: shape.getAttribute('stroke') || 'none',
            strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1'),
            ...readBooleanMetadata(shape)
          };
        }

        return {
          type: 'path',
          pathKind: 'raw',
          pathData: shape.getAttribute('d') || '',
          ...getShapeFill(shape, 'fill'),
          stroke: shape.getAttribute('stroke') || 'none',
          strokeWidth: Number.parseFloat(shape.getAttribute('stroke-width') || '1'),
          ...readBooleanMetadata(shape)
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

function createRawPathElement(pathData, color, metadata) {
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', String(pathData || ''));
  path.style.cursor = 'pointer';
  applyFill(path, color);
  applyStrokeToShape(path);
  writeBooleanMetadata(path, metadata);
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
        if (polygon.pathKind === 'raw' || typeof polygon.pathData === 'string') {
          shape = createRawPathElement(
            polygon.pathData || '',
            fill,
            {
              booleanOp: polygon.booleanOp,
              booleanSource: polygon.booleanSource
            }
          );
        } else {
          shape = createPathElement(
            polygon.points || [],
            polygon.curveTypes || [],
            polygon.controls || [],
            fill
          );
          writeBooleanMetadata(shape, {
            booleanOp: polygon.booleanOp,
            booleanSource: polygon.booleanSource
          });
        }
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
  if (selectedPaths.includes(path)) removePathFromSelection(path);
  path.remove();
  renderLayersList();
}

function removePolygons(paths, recordHistory = true) {
  const uniquePaths = Array.from(new Set((paths || []).filter(Boolean)));
  if (uniquePaths.length === 0) return;
  if (recordHistory) pushHistoryState();
  uniquePaths.forEach((shape) => {
    if (editingPath === shape) exitEditMode();
    if (selectedPaths.includes(shape)) removePathFromSelection(shape);
    shape.remove();
  });
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

  const centerX = (box.left + box.right) / 2;
  const centerY = (box.top + box.bottom) / 2;
  editHandles.forEach((handle) => {
    if (handle.data.type !== 'shape-move') return;
    const moveRadius = 10 / zoomLevel;
    handle.element.setAttribute('cx', String(centerX));
    handle.element.setAttribute('cy', String(centerY));
    handle.element.setAttribute('r', String(moveRadius));
  });
}

function updatePolylineLikeHandles(path) {
  if (!path) return;
  const shapeType = path.tagName.toLowerCase();
  if (!['line', 'polyline', 'polygon'].includes(shapeType)) return;

  const pointRadius = 10 / zoomLevel;
  let points = [];
  if (shapeType === 'line') {
    points = [
      [Number.parseFloat(path.getAttribute('x1') || '0'), Number.parseFloat(path.getAttribute('y1') || '0')],
      [Number.parseFloat(path.getAttribute('x2') || '0'), Number.parseFloat(path.getAttribute('y2') || '0')]
    ];
  } else {
    points = parsePointsAttribute(path.getAttribute('points'));
  }

  editHandles.forEach((handle) => {
    if (handle.data.type === 'shape-point') {
      const pt = points[handle.data.pointIdx];
      if (!pt) return;
      handle.element.setAttribute('cx', String(pt[0]));
      handle.element.setAttribute('cy', String(pt[1]));
      handle.element.setAttribute('r', String(pointRadius));
    }
  });

  if (points.length === 0) return;
  const cx = points.reduce((sum, pt) => sum + pt[0], 0) / points.length;
  const cy = points.reduce((sum, pt) => sum + pt[1], 0) / points.length;
  editHandles.forEach((handle) => {
    if (handle.data.type !== 'shape-move') return;
    handle.element.setAttribute('cx', String(cx));
    handle.element.setAttribute('cy', String(cy));
    handle.element.setAttribute('r', String(pointRadius));
  });
}

function updatePathHandles(path) {
  if (!path || path.tagName.toLowerCase() !== 'path') return;
  const points = JSON.parse(path.getAttribute('data-points') || '[]');
  const controls = JSON.parse(path.getAttribute('data-controls') || '[]') || [];
  const pointRadius = 10 / zoomLevel;
  const controlSize = 12 / zoomLevel;
  const halfControlSize = controlSize / 2;

  editHandles.forEach((handle) => {
    if (handle.data.type === 'point') {
      const pt = points[handle.data.pointIdx];
      if (!pt) return;
      handle.element.setAttribute('cx', String(pt[0]));
      handle.element.setAttribute('cy', String(pt[1]));
      handle.element.setAttribute('r', String(pointRadius));
    }
    if (handle.data.type === 'control') {
      const ctrl = controls[handle.data.pointIdx];
      if (!ctrl) return;
      let cp = null;
      if (handle.data.controlType === 'cp') cp = ctrl.cp;
      if (handle.data.controlType === 'cp1') cp = ctrl.cp1;
      if (handle.data.controlType === 'cp2') cp = ctrl.cp2;
      if (!cp) return;
      handle.element.setAttribute('x', String(cp.x - halfControlSize));
      handle.element.setAttribute('y', String(cp.y - halfControlSize));
      handle.element.setAttribute('width', String(controlSize));
      handle.element.setAttribute('height', String(controlSize));
    }
  });

  if (points.length === 0) return;
  const cx = points.reduce((sum, pt) => sum + pt[0], 0) / points.length;
  const cy = points.reduce((sum, pt) => sum + pt[1], 0) / points.length;
  editHandles.forEach((handle) => {
    if (handle.data.type !== 'shape-move') return;
    handle.element.setAttribute('cx', String(cx));
    handle.element.setAttribute('cy', String(cy));
    handle.element.setAttribute('r', String(pointRadius));
  });
}

function getTextBounds(path) {
  try {
    const box = path.getBBox();
    return {
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
      width: box.width,
      height: box.height
    };
  } catch (_) {
    const x = Number.parseFloat(path.getAttribute('x') || '0');
    const y = Number.parseFloat(path.getAttribute('y') || '0');
    const size = Number.parseFloat(path.getAttribute('font-size') || '48') || 48;
    const width = Math.max(1, (path.textContent || '').length * size * 0.6);
    return {
      left: x,
      top: y - size,
      right: x + width,
      bottom: y,
      width,
      height: size
    };
  }
}

function updateTextHandles(path) {
  if (!path || path.tagName.toLowerCase() !== 'text') return;
  const box = getTextBounds(path);
  const controlSize = 12 / zoomLevel;
  const halfControlSize = controlSize / 2;
  const moveRadius = 10 / zoomLevel;

  const corners = [
    [box.left, box.top],
    [box.right, box.top],
    [box.right, box.bottom],
    [box.left, box.bottom]
  ];

  editHandles.forEach((handle) => {
    if (handle.data.type === 'text-bbox-corner') {
      const cornerPt = corners[handle.data.corner];
      if (!cornerPt) return;
      handle.element.setAttribute('x', String(cornerPt[0] - halfControlSize));
      handle.element.setAttribute('y', String(cornerPt[1] - halfControlSize));
      handle.element.setAttribute('width', String(controlSize));
      handle.element.setAttribute('height', String(controlSize));
    }
    if (handle.data.type === 'text-move') {
      handle.element.setAttribute('cx', String((box.left + box.right) / 2));
      handle.element.setAttribute('cy', String((box.top + box.bottom) / 2));
      handle.element.setAttribute('r', String(moveRadius));
    }
  });
}

function getPathBounds(path) {
  if (!path || path.tagName.toLowerCase() !== 'path') return null;
  try {
    const box = path.getBBox();
    return {
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
      width: box.width,
      height: box.height
    };
  } catch (_) {
    return null;
  }
}

function transformPathDataWithPaper(pathData, transformer) {
  if (!window.paper || !window.paper.PaperScope) return null;
  const scope = new window.paper.PaperScope();
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(baseCanvasWidth));
  canvas.height = Math.max(1, Math.round(baseCanvasHeight));
  scope.setup(canvas);

  let shape = null;
  try {
    shape = new scope.CompoundPath(pathData);
  } catch (_) {
    try {
      shape = new scope.Path(pathData);
    } catch (_) {
      scope.project.clear();
      return null;
    }
  }

  transformer(shape, scope);
  const result = String(shape.pathData || '').trim();
  shape.remove();
  scope.project.clear();
  return result || null;
}

function updateGenericPathTransformHandles(path) {
  if (!path || path.tagName.toLowerCase() !== 'path') return;
  if (path.hasAttribute('data-points')) return;
  const box = getPathBounds(path);
  if (!box) return;

  const controlSize = 12 / zoomLevel;
  const halfControlSize = controlSize / 2;
  const moveRadius = 10 / zoomLevel;
  const corners = [
    [box.left, box.top],
    [box.right, box.top],
    [box.right, box.bottom],
    [box.left, box.bottom]
  ];

  editHandles.forEach((handle) => {
    if (handle.data.type === 'path-bbox-corner') {
      const cornerPt = corners[handle.data.corner];
      if (!cornerPt) return;
      handle.element.setAttribute('x', String(cornerPt[0] - halfControlSize));
      handle.element.setAttribute('y', String(cornerPt[1] - halfControlSize));
      handle.element.setAttribute('width', String(controlSize));
      handle.element.setAttribute('height', String(controlSize));
    }
    if (handle.data.type === 'shape-move') {
      handle.element.setAttribute('cx', String((box.left + box.right) / 2));
      handle.element.setAttribute('cy', String((box.top + box.bottom) / 2));
      handle.element.setAttribute('r', String(moveRadius));
    }
  });
}

function handleEditDrag(e) {
  if (!editingPath || editHandles.length === 0) return;
  const currentDrag = editHandles.find((h) => h.isDragging);
  if (!currentDrag) return;
  
  const rect = canvasViewport.getBoundingClientRect();
  const rawX = (e.clientX - rect.left - panX) / zoomLevel;
  const rawY = (e.clientY - rect.top - panY) / zoomLevel;
  const [x, y] = getSnappedSvgPoint([rawX, rawY]);
  const shapeType = editingPath.tagName.toLowerCase();

  if (shapeType === 'path' && !editingPath.hasAttribute('data-points')) {
    if (currentDrag.data.type === 'shape-move') {
      const start = currentDrag.data.start;
      if (!start) return;
      const dx = x - start.pointerX;
      const dy = y - start.pointerY;
      const movedData = transformPathDataWithPaper(start.pathData, (shape, scope) => {
        shape.translate(new scope.Point(dx, dy));
      });
      if (!movedData) return;
      editingPath.setAttribute('d', movedData);
      updateGenericPathTransformHandles(editingPath);
      return;
    }

    if (currentDrag.data.type === 'path-bbox-corner') {
      const start = currentDrag.data.start;
      if (!start || !start.anchor || !start.box) return;

      const cornerIdx = Number.isInteger(currentDrag.data.corner) ? currentDrag.data.corner : 0;
      const startCorners = [
        [start.box.left, start.box.top],
        [start.box.right, start.box.top],
        [start.box.right, start.box.bottom],
        [start.box.left, start.box.bottom]
      ];
      const startCorner = startCorners[cornerIdx];
      if (!startCorner) return;

      const startDx = startCorner[0] - start.anchor.x;
      const startDy = startCorner[1] - start.anchor.y;
      if (Math.abs(startDx) < 1e-6 || Math.abs(startDy) < 1e-6) return;

      // Keep signed scale so dragging past the anchor mirrors/flips the path.
      const sx = (x - start.anchor.x) / startDx;
      const sy = (y - start.anchor.y) / startDy;
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;

      const scaledData = transformPathDataWithPaper(start.pathData, (shape, scope) => {
        shape.scale(sx, sy, new scope.Point(start.anchor.x, start.anchor.y));
      });
      if (!scaledData) return;
      editingPath.setAttribute('d', scaledData);
      updateGenericPathTransformHandles(editingPath);
      return;
    }

    return;
  }

  if (shapeType === 'text') {
    if (currentDrag.data.type === 'text-move') {
      const start = currentDrag.data.start;
      if (!start) return;
      const dx = x - start.pointerX;
      const dy = y - start.pointerY;
      editingPath.setAttribute('x', String(start.textX + dx));
      editingPath.setAttribute('y', String(start.textY + dy));
      updateTextHandles(editingPath);
    } else if (currentDrag.data.type === 'text-bbox-corner') {
      const start = currentDrag.data.start;
      if (!start) return;

      let newDragX = x;
      let newDragY = y;
      const anchor = start.anchor;
      if (!anchor) return;

      const newLeft = Math.min(newDragX, anchor.x);
      const newRight = Math.max(newDragX, anchor.x);
      const newTop = Math.min(newDragY, anchor.y);
      const newBottom = Math.max(newDragY, anchor.y);
      const newWidth = Math.max(1, newRight - newLeft);
      const newHeight = Math.max(1, newBottom - newTop);

      const widthScale = newWidth / Math.max(1, start.box.width);
      const heightScale = newHeight / Math.max(1, start.box.height);
      const scale = Math.max(0.05, Math.max(widthScale, heightScale));

      const newFontSize = Math.max(6, start.fontSize * scale);
      editingPath.setAttribute('font-size', String(newFontSize));

      const startCenterX = (start.box.left + start.box.right) / 2;
      const startCenterY = (start.box.top + start.box.bottom) / 2;
      const targetCenterX = (newLeft + newRight) / 2;
      const targetCenterY = (newTop + newBottom) / 2;
      const centerDx = targetCenterX - startCenterX;
      const centerDy = targetCenterY - startCenterY;

      editingPath.setAttribute('x', String(start.textX + centerDx));
      editingPath.setAttribute('y', String(start.textY + centerDy));
      updateTextHandles(editingPath);
    }
    return;
  }

  if (shapeType === 'line' || shapeType === 'polyline' || shapeType === 'polygon') {
    let points = [];
    if (shapeType === 'line') {
      points = [
        [Number.parseFloat(editingPath.getAttribute('x1') || '0'), Number.parseFloat(editingPath.getAttribute('y1') || '0')],
        [Number.parseFloat(editingPath.getAttribute('x2') || '0'), Number.parseFloat(editingPath.getAttribute('y2') || '0')]
      ];
    } else {
      points = parsePointsAttribute(editingPath.getAttribute('points'));
    }

    if (currentDrag.data.type === 'shape-point') {
      const pointIdx = currentDrag.data.pointIdx;
      if (pointIdx < 0 || pointIdx >= points.length) return;
      points[pointIdx] = [x, y];
    } else if (currentDrag.data.type === 'shape-move') {
      const start = currentDrag.data.start;
      if (!start) return;
      const dx = x - start.pointerX;
      const dy = y - start.pointerY;
      points = start.points.map((pt) => [pt[0] + dx, pt[1] + dy]);
    } else {
      return;
    }

    if (shapeType === 'line') {
      editingPath.setAttribute('x1', String(points[0][0]));
      editingPath.setAttribute('y1', String(points[0][1]));
      editingPath.setAttribute('x2', String(points[1][0]));
      editingPath.setAttribute('y2', String(points[1][1]));
    } else {
      editingPath.setAttribute('points', points.map(([px, py]) => `${px},${py}`).join(' '));
    }

    updatePolylineLikeHandles(editingPath);
    return;
  }

  if (shapeType === 'rect' || shapeType === 'ellipse' || shapeType === 'circle') {
    if (currentDrag.data.type === 'shape-move') {
      const start = currentDrag.data.start;
      if (!start) return;
      const dx = x - start.pointerX;
      const dy = y - start.pointerY;

      if (shapeType === 'rect') {
        editingPath.setAttribute('x', String(start.rect.x + dx));
        editingPath.setAttribute('y', String(start.rect.y + dy));
      } else if (shapeType === 'ellipse') {
        editingPath.setAttribute('cx', String(start.ellipse.cx + dx));
        editingPath.setAttribute('cy', String(start.ellipse.cy + dy));
      } else {
        editingPath.setAttribute('cx', String(start.circle.cx + dx));
        editingPath.setAttribute('cy', String(start.circle.cy + dy));
      }

      updateShapeCornerHandles(editingPath);
      return;
    }

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
  
  if (type === 'shape-move') {
    const start = currentDrag.data.start;
    if (!start) return;
    const dx = x - start.pointerX;
    const dy = y - start.pointerY;
    points = start.points.map((pt) => [pt[0] + dx, pt[1] + dy]);
    controls = (start.controls || []).map((ctrl) => {
      if (!ctrl) return ctrl;
      const next = { ...ctrl };
      if (next.cp) next.cp = { x: next.cp.x + dx, y: next.cp.y + dy };
      if (next.cp1) next.cp1 = { x: next.cp1.x + dx, y: next.cp1.y + dy };
      if (next.cp2) next.cp2 = { x: next.cp2.x + dx, y: next.cp2.y + dy };
      return next;
    });
  } else if (type === 'point') {
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
  updatePathHandles(editingPath);
}

function handleEditEnd(e) {
  if (!editingPath) return;
  editHandles.forEach((h) => {
    h.isDragging = false;
    if (!h.data) return;
    if (h.data.type === 'bbox-corner') delete h.data.anchor;
    if (h.data.type === 'path-bbox-corner') delete h.data.start;
    if (h.data.type === 'shape-move') delete h.data.start;
    if (h.data.type === 'text-bbox-corner') delete h.data.start;
    if (h.data.type === 'text-move') delete h.data.start;
  });
}

function renderEditHandles(path) {
  editHandles.forEach((h) => h.element.remove());
  editHandles = [];
  if (!handlesVisible) return;

  const shapeType = path.tagName.toLowerCase();
  if (shapeType === 'text') {
    const box = getTextBounds(path);
    const controlSize = 12 / zoomLevel;
    const halfControlSize = controlSize / 2;
    const moveRadius = 10 / zoomLevel;
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
          handle.data.start = {
            pointerX: (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel,
            pointerY: (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel,
            box,
            fontSize: Number.parseFloat(path.getAttribute('font-size') || '48') || 48,
            textX: Number.parseFloat(path.getAttribute('x') || '0'),
            textY: Number.parseFloat(path.getAttribute('y') || '0'),
            anchor: { x: oppositePt[0], y: oppositePt[1] }
          };
          handle.isDragging = true;
        }
      });

      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'text-bbox-corner', corner: cornerIdx }, isDragging: false });
    });

    const move = document.createElementNS(svgNS, 'circle');
    move.setAttribute('cx', String((box.left + box.right) / 2));
    move.setAttribute('cy', String((box.top + box.bottom) / 2));
    move.setAttribute('r', String(moveRadius));
    move.setAttribute('fill', '#22c55e');
    move.setAttribute('stroke', '#1f2937');
    move.setAttribute('stroke-width', '1');
    move.style.cursor = 'grab';
    move.style.pointerEvents = 'auto';

    move.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === move);
      if (handle) {
        pushHistoryState();
        handle.data.start = {
          pointerX: (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel,
          pointerY: (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel,
          textX: Number.parseFloat(path.getAttribute('x') || '0'),
          textY: Number.parseFloat(path.getAttribute('y') || '0')
        };
        handle.isDragging = true;
      }
    });

    tempGroup.appendChild(move);
    editHandles.push({ element: move, data: { type: 'text-move' }, isDragging: false });
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

    const cx = points.reduce((sum, pt) => sum + pt[0], 0) / points.length;
    const cy = points.reduce((sum, pt) => sum + pt[1], 0) / points.length;
    const move = document.createElementNS(svgNS, 'circle');
    move.setAttribute('cx', String(cx));
    move.setAttribute('cy', String(cy));
    move.setAttribute('r', String(pointRadius));
    move.setAttribute('fill', '#22c55e');
    move.setAttribute('stroke', '#1f2937');
    move.setAttribute('stroke-width', '1');
    move.style.cursor = 'grab';
    move.style.pointerEvents = 'auto';

    move.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === move);
      if (handle) {
        pushHistoryState();
        handle.data.start = {
          pointerX: (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel,
          pointerY: (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel,
          points: points.map((pt) => [pt[0], pt[1]])
        };
        handle.isDragging = true;
      }
    });

    tempGroup.appendChild(move);
    editHandles.push({ element: move, data: { type: 'shape-move' }, isDragging: false });
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

    const move = document.createElementNS(svgNS, 'circle');
    move.setAttribute('cx', String((box.left + box.right) / 2));
    move.setAttribute('cy', String((box.top + box.bottom) / 2));
    move.setAttribute('r', String(10 / zoomLevel));
    move.setAttribute('fill', '#22c55e');
    move.setAttribute('stroke', '#1f2937');
    move.setAttribute('stroke-width', '1');
    move.style.cursor = 'grab';
    move.style.pointerEvents = 'auto';

    move.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === move);
      if (handle) {
        pushHistoryState();
        const pointerX = (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel;
        const pointerY = (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel;
        if (shapeType === 'rect') {
          handle.data.start = {
            pointerX,
            pointerY,
            rect: {
              x: Number.parseFloat(path.getAttribute('x') || '0'),
              y: Number.parseFloat(path.getAttribute('y') || '0')
            }
          };
        } else if (shapeType === 'ellipse') {
          handle.data.start = {
            pointerX,
            pointerY,
            ellipse: {
              cx: Number.parseFloat(path.getAttribute('cx') || '0'),
              cy: Number.parseFloat(path.getAttribute('cy') || '0')
            }
          };
        } else {
          handle.data.start = {
            pointerX,
            pointerY,
            circle: {
              cx: Number.parseFloat(path.getAttribute('cx') || '0'),
              cy: Number.parseFloat(path.getAttribute('cy') || '0')
            }
          };
        }
        handle.isDragging = true;
      }
    });

    tempGroup.appendChild(move);
    editHandles.push({ element: move, data: { type: 'shape-move' }, isDragging: false });
    return;
  }

  if (shapeType === 'path' && !path.hasAttribute('data-points')) {
    const box = getPathBounds(path);
    if (!box || box.width <= 0 || box.height <= 0) return;

    const controlSize = 12 / zoomLevel;
    const halfControlSize = controlSize / 2;
    const moveRadius = 10 / zoomLevel;
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
          handle.data.start = {
            pathData: path.getAttribute('d') || '',
            box,
            anchor: { x: oppositePt[0], y: oppositePt[1] }
          };
          handle.isDragging = true;
        }
      });

      tempGroup.appendChild(sq);
      editHandles.push({ element: sq, data: { type: 'path-bbox-corner', corner: cornerIdx }, isDragging: false });
    });

    const move = document.createElementNS(svgNS, 'circle');
    move.setAttribute('cx', String((box.left + box.right) / 2));
    move.setAttribute('cy', String((box.top + box.bottom) / 2));
    move.setAttribute('r', String(moveRadius));
    move.setAttribute('fill', '#22c55e');
    move.setAttribute('stroke', '#1f2937');
    move.setAttribute('stroke-width', '1');
    move.style.cursor = 'grab';
    move.style.pointerEvents = 'auto';

    move.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const handle = editHandles.find((h) => h.element === move);
      if (handle) {
        pushHistoryState();
        handle.data.start = {
          pointerX: (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel,
          pointerY: (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel,
          pathData: path.getAttribute('d') || ''
        };
        handle.isDragging = true;
      }
    });

    tempGroup.appendChild(move);
    editHandles.push({ element: move, data: { type: 'shape-move' }, isDragging: false });
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

  const move = document.createElementNS(svgNS, 'circle');
  const cx = points.reduce((sum, pt) => sum + pt[0], 0) / points.length;
  const cy = points.reduce((sum, pt) => sum + pt[1], 0) / points.length;
  move.setAttribute('cx', String(cx));
  move.setAttribute('cy', String(cy));
  move.setAttribute('r', String(pointRadius));
  move.setAttribute('fill', '#22c55e');
  move.setAttribute('stroke', '#1f2937');
  move.setAttribute('stroke-width', '1');
  move.style.cursor = 'grab';
  move.style.pointerEvents = 'auto';

  move.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const handle = editHandles.find((h) => h.element === move);
    if (handle) {
      pushHistoryState();
      handle.data.start = {
        pointerX: (e.clientX - canvasViewport.getBoundingClientRect().left - panX) / zoomLevel,
        pointerY: (e.clientY - canvasViewport.getBoundingClientRect().top - panY) / zoomLevel,
        points: points.map((pt) => [pt[0], pt[1]]),
        controls: JSON.parse(JSON.stringify(controls || []))
      };
      handle.isDragging = true;
    }
  });

  tempGroup.appendChild(move);
  editHandles.push({ element: move, data: { type: 'shape-move' }, isDragging: false });
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

function parsePointsAttribute(pointsText) {
  return String(pointsText || '')
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map((n) => Number.parseFloat(n)))
    .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
}

function isBooleanEligibleShape(shape) {
  if (!shape) return false;
  const tag = shape.tagName.toLowerCase();
  return tag === 'path' || tag === 'rect' || tag === 'ellipse' || tag === 'circle' || tag === 'polygon';
}

function shapeToPathData(shape) {
  const tag = shape.tagName.toLowerCase();

  if (tag === 'path') {
    return shape.getAttribute('d') || '';
  }

  if (tag === 'rect') {
    const x = Number.parseFloat(shape.getAttribute('x') || '0');
    const y = Number.parseFloat(shape.getAttribute('y') || '0');
    const w = Number.parseFloat(shape.getAttribute('width') || '0');
    const h = Number.parseFloat(shape.getAttribute('height') || '0');
    if (w <= 0 || h <= 0) return '';
    return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  }

  if (tag === 'ellipse') {
    const cx = Number.parseFloat(shape.getAttribute('cx') || '0');
    const cy = Number.parseFloat(shape.getAttribute('cy') || '0');
    const rx = Number.parseFloat(shape.getAttribute('rx') || '0');
    const ry = Number.parseFloat(shape.getAttribute('ry') || '0');
    if (rx <= 0 || ry <= 0) return '';
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  }

  if (tag === 'circle') {
    const cx = Number.parseFloat(shape.getAttribute('cx') || '0');
    const cy = Number.parseFloat(shape.getAttribute('cy') || '0');
    const r = Number.parseFloat(shape.getAttribute('r') || '0');
    if (r <= 0) return '';
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }

  if (tag === 'polygon') {
    const points = parsePointsAttribute(shape.getAttribute('points'));
    if (points.length < 3) return '';
    const [firstX, firstY] = points[0];
    const tail = points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ');
    return `M ${firstX} ${firstY} ${tail} Z`;
  }

  return '';
}

function applyBooleanResultStyle(sourceShape, targetPath) {
  const baseFill = sourceShape.getAttribute('fill') || 'none';
  const baseStroke = sourceShape.getAttribute('stroke') || 'none';
  const baseStrokeWidth = sourceShape.getAttribute('stroke-width') || '1';
  const baseGradient = sourceShape.getAttribute('data-gradient');

  targetPath.setAttribute('fill', baseFill);
  targetPath.setAttribute('stroke', baseStroke);
  targetPath.setAttribute('stroke-width', baseStrokeWidth);

  if (baseGradient) {
    targetPath.setAttribute('data-gradient', baseGradient);
  } else {
    targetPath.removeAttribute('data-gradient');
  }

  targetPath.style.cursor = 'pointer';
}

function runBooleanOperation(operation) {
  const ordered = selectedPaths.filter(Boolean);
  if (ordered.length < 2) {
    window.alert('Select at least two closed shapes for boolean operations. Use Shift/Ctrl/Cmd + click to multi-select.');
    return;
  }

  if (!window.paper || !window.paper.PaperScope) {
    window.alert('Boolean operations require Paper.js, but it is not available.');
    return;
  }

  const ineligible = ordered.filter((shape) => !isBooleanEligibleShape(shape));
  if (ineligible.length > 0) {
    window.alert('Boolean operations currently support closed vector shapes only: path, rectangle, ellipse, circle, and polygon.');
    return;
  }

  const baseLayer = getLayerForPath(ordered[0]);
  if (!baseLayer) return;

  const selectedLayers = ordered.map((shape) => getLayerForPath(shape)).filter(Boolean);
  const hasLockedLayer = selectedLayers.some((layer) => layer.locked);
  if (hasLockedLayer) {
    window.alert('Unlock all selected layers before running boolean operations.');
    return;
  }

  const booleanSourceSnapshot = {
    operation,
    createdAt: Date.now(),
    operands: ordered.map((shape) => snapshotShapeForBoolean(shape)).filter(Boolean)
  };

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(baseCanvasWidth));
  canvas.height = Math.max(1, Math.round(baseCanvasHeight));
  const scope = new window.paper.PaperScope();
  scope.setup(canvas);

  const toPaperPath = (shape) => {
    const d = shapeToPathData(shape);
    if (!d) return null;
    try {
      return new scope.CompoundPath(d);
    } catch (_) {
      return null;
    }
  };

  let result = toPaperPath(ordered[0]);
  if (!result) {
    window.alert('Could not parse the first selected shape for boolean operation.');
    return;
  }

  for (let i = 1; i < ordered.length; i++) {
    const next = toPaperPath(ordered[i]);
    if (!next) {
      result.remove();
      scope.project.clear();
      window.alert('One of the selected shapes could not be parsed for boolean operation.');
      return;
    }

    let combined = null;
    if (operation === 'union') combined = result.unite(next);
    else if (operation === 'intersect') combined = result.intersect(next);
    else combined = result.subtract(next);

    result.remove();
    next.remove();
    result = combined;
  }

  const finalPathData = (result && result.pathData) ? String(result.pathData).trim() : '';
  if (!finalPathData) {
    result.remove();
    scope.project.clear();
    window.alert('This boolean operation produced an empty result.');
    return;
  }

  pushHistoryState();

  const resultPath = document.createElementNS(svgNS, 'path');
  resultPath.setAttribute('d', finalPathData);
  applyBooleanResultStyle(ordered[0], resultPath);
  writeBooleanMetadata(resultPath, {
    booleanOp: operation,
    booleanSource: JSON.stringify(booleanSourceSnapshot)
  });
  bindPathInteractions(resultPath);

  const firstShape = ordered[0];
  firstShape.insertAdjacentElement('afterend', resultPath);
  removePolygons(ordered, false);
  setSelectedPath(resultPath);

  result.remove();
  scope.project.clear();
  renderLayersList();
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

    const multiSelectPressed = e.shiftKey || e.ctrlKey || e.metaKey;
    if (multiSelectPressed) {
      if (editingPath) exitEditMode();
      togglePathSelection(shape);
    } else {
      setSelectedPath(shape);
    }
    e.stopPropagation();
  });

  shape.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPathLocked(shape)) return;

    const tag = shape.tagName.toLowerCase();
    if (!['path', 'rect', 'ellipse', 'circle', 'line', 'polyline', 'polygon', 'text'].includes(tag)) return;

    if (!selectedPaths.includes(shape) || selectedPaths.length > 1) {
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

  if (layer.locked) {
    selectedPaths
      .filter((shape) => getLayerForPath(shape)?.id === layerId)
      .forEach((shape) => removePathFromSelection(shape));
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
  selectedPaths
    .filter((shape) => getLayerForPath(shape)?.id === layerId)
    .forEach((shape) => removePathFromSelection(shape));

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

function getSnappedSvgPoint(point) {
  return snapPointToGrid(point);
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
  baseCanvasWidth = width;
  baseCanvasHeight = height;
  syncCanvasSurfaceSize();
  requestAnimationFrame(centerImage);
}

function syncCanvasSurfaceSize() {
  const surfaceWidth = Math.max(baseCanvasWidth, canvasViewport.clientWidth || 0);
  const surfaceHeight = Math.max(baseCanvasHeight, canvasViewport.clientHeight || 0);
  canvasWrapper.style.width = `${surfaceWidth}px`;
  canvasWrapper.style.height = `${surfaceHeight}px`;
  svgOverlay.setAttribute('width', String(surfaceWidth));
  svgOverlay.setAttribute('height', String(surfaceHeight));
  svgOverlay.style.width = `${surfaceWidth}px`;
  svgOverlay.style.height = `${surfaceHeight}px`;
  updateGridOverlay();
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

      if (type === 'path') {
        try {
          const box = shape.getBBox();
          let pad = 0;
          const stroke = (shape.getAttribute('stroke') || 'none').trim().toLowerCase();
          if (stroke !== 'none') {
            const strokeWidth = Number.parseFloat(shape.getAttribute('stroke-width') || '0');
            if (Number.isFinite(strokeWidth) && strokeWidth > 0) {
              pad = strokeWidth / 2;
            }
          }
          expandBounds(bounds, box.x - pad, box.y - pad);
          expandBounds(bounds, box.x + box.width + pad, box.y + box.height + pad);
          return;
        } catch (_) {
          // Fall back to metadata-based bounds below if getBBox fails.
        }
      }

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
  const cloneGrid = clone.querySelector('#gridGroup');
  if (cloneGrid) cloneGrid.remove();

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

  if (!optimizeExportPathsCheck || optimizeExportPathsCheck.checked) {
    const optimizePathData = (pathData) => {
      if (!window.paper || !window.paper.PaperScope || !pathData) return pathData;

      const scope = new window.paper.PaperScope();
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(baseCanvasWidth));
      canvas.height = Math.max(1, Math.round(baseCanvasHeight));
      scope.setup(canvas);

      let item = null;
      try {
        item = new scope.CompoundPath(pathData);
      } catch (_) {
        try {
          item = new scope.Path(pathData);
        } catch (_) {
          scope.project.clear();
          return pathData;
        }
      }

      const flattenTolerance = 0.6;
      const simplifyTolerance = 0.2;

      const pointLineDistance = (px, py, ax, ay, bx, by) => {
        const dx = bx - ax;
        const dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq < 1e-8) return Math.hypot(px - ax, py - ay);
        const t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        const projX = ax + t * dx;
        const projY = ay + t * dy;
        return Math.hypot(px - projX, py - projY);
      };

      const linearSimplifyPath = (p, tolerance) => {
        if (!p || !p.segments || p.segments.length < 3) return;

        const removeCollinearPoint = (prevPt, currPt, nextPt) => {
          const dist = pointLineDistance(currPt.x, currPt.y, prevPt.x, prevPt.y, nextPt.x, nextPt.y);
          return dist <= tolerance;
        };

        if (p.closed) {
          let changed = true;
          while (changed && p.segments.length > 3) {
            changed = false;
            const n = p.segments.length;
            for (let i = n - 1; i >= 0; i--) {
              const prev = p.segments[(i - 1 + n) % n].point;
              const curr = p.segments[i].point;
              const next = p.segments[(i + 1) % n].point;
              if (removeCollinearPoint(prev, curr, next) && p.segments.length > 3) {
                p.removeSegment(i);
                changed = true;
              }
            }
          }
        } else {
          for (let i = p.segments.length - 2; i >= 1; i--) {
            const prev = p.segments[i - 1].point;
            const curr = p.segments[i].point;
            const next = p.segments[i + 1].point;
            if (removeCollinearPoint(prev, curr, next) && p.segments.length > 2) {
              p.removeSegment(i);
            }
          }
        }
      };

      const applyToPath = (p) => {
        if (!p || !p.segments || p.segments.length < 2) return;
        p.flatten(flattenTolerance);
        linearSimplifyPath(p, simplifyTolerance);
      };

      if (item instanceof scope.CompoundPath) {
        item.children.forEach((child) => applyToPath(child));
      } else {
        applyToPath(item);
      }

      const optimized = String(item.pathData || '').trim() || pathData;
      item.remove();
      scope.project.clear();
      return optimized;
    };

    const paths = Array.from(clone.querySelectorAll('path'));
    paths.forEach((pathEl) => {
      const original = pathEl.getAttribute('d');
      if (!original) return;
      const optimized = optimizePathData(original);
      if (optimized) pathEl.setAttribute('d', optimized);
    });

    // Strip editor-only metadata for a clean output file.
    const elements = Array.from(clone.querySelectorAll('*'));
    elements.forEach((el) => {
      el.removeAttribute('data-boolean-op');
      el.removeAttribute('data-boolean-source');
      el.removeAttribute('data-points');
      el.removeAttribute('data-curve-types');
      el.removeAttribute('data-controls');

      const cls = (el.getAttribute('class') || '').trim();
      if (cls) {
        const cleaned = cls
          .split(/\s+/)
          .filter((name) => !['selectedPolygon', 'selectedPrimary', 'editingPolygon'].includes(name));
        if (cleaned.length > 0) el.setAttribute('class', cleaned.join(' '));
        else el.removeAttribute('class');
      }

      const style = el.getAttribute('style');
      if (style) {
        const cleanedStyle = style
          .split(';')
          .map((part) => part.trim())
          .filter(Boolean)
          .filter((part) => {
            const prop = part.split(':')[0]?.trim().toLowerCase();
            return prop !== 'cursor' && prop !== 'user-select';
          })
          .join('; ');
        if (cleanedStyle) el.setAttribute('style', cleanedStyle);
        else el.removeAttribute('style');
      }
    });
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
    } else if (selectedPaths.length > 0) {
      e.preventDefault();
      removePolygons(selectedPaths.slice(), true);
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
    polylineHoverPoint = getSnappedSvgPoint(getSvgPoint(e));
    renderTempPath();
    return;
  }

  if (shapeDrawing) {
    shapeHoverPoint = getSnappedSvgPoint(getSvgPoint(e));
    renderTempShapePath();
    return;
  }

  if (!tracing) return;
  hoverPoint = getSnappedSvgPoint(getSvgPoint(e));
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

window.addEventListener('resize', () => {
  syncCanvasSurfaceSize();
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

  const point = getSnappedSvgPoint(getSvgPoint(e));
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
if (booleanUnionBtn) booleanUnionBtn.addEventListener('click', () => runBooleanOperation('union'));
if (booleanIntersectBtn) booleanIntersectBtn.addEventListener('click', () => runBooleanOperation('intersect'));
if (booleanSubtractBtn) booleanSubtractBtn.addEventListener('click', () => runBooleanOperation('subtract'));
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

if (gridEnabledCheck) {
  gridEnabledCheck.addEventListener('change', (e) => {
    gridEnabled = e.target.checked;
    updateGridOverlay();
  });
}

if (gridSizeInput) {
  gridSizeInput.addEventListener('input', (e) => {
    gridSizeValue = Math.max(6, Number.parseFloat(e.target.value) || gridSizeValue);
    if (e.target.value !== String(gridSizeValue)) {
      e.target.value = String(gridSizeValue);
    }
    updateGridOverlay();
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
