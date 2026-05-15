const imageLoader = document.getElementById('imageLoader');
const imageCanvas = document.getElementById('imageCanvas');
const svgOverlay = document.getElementById('svgOverlay');
const toggleImageBtn = document.getElementById('toggleImageBtn');
const traceToolBtn = document.getElementById('traceToolBtn');
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
let hoverPoint = null;
let pickedColor = '#000000';
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

const tempGroup = document.createElementNS(svgNS, 'g');
tempGroup.setAttribute('id', 'tempGroup');
tempGroup.style.pointerEvents = 'none';
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
  colorPreview.style.background = color;
  const hex = color.startsWith('rgb') ? hexFromRgb(color) : color;
  colorValue.textContent = hex;
  colorPicker.value = hex;
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

function serializeState() {
  return {
    layerCounter,
    activeLayerId,
    layers: layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: !!layer.locked,
      polygons: Array.from(layer.group.querySelectorAll('path')).map((path) => ({
        points: JSON.parse(path.getAttribute('data-points') || '[]'),
        curveTypes: JSON.parse(path.getAttribute('data-curve-types') || '[]'),
        controls: JSON.parse(path.getAttribute('data-controls') || '[]'),
        color: path.getAttribute('fill') || '#000000'
      }))
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
  path.setAttribute('fill', color);
  path.setAttribute('stroke', '#1f1f1f');
  path.setAttribute('stroke-width', '1');
  path.style.cursor = 'pointer';
  path.setAttribute('data-points', JSON.stringify(points));
  path.setAttribute('data-curve-types', JSON.stringify(curveTypes));
  path.setAttribute('data-controls', JSON.stringify(safeControls));
  bindPathInteractions(path);
  return path;
}

function restoreState(state) {
  if (!state || !Array.isArray(state.layers)) return;

  isRestoringState = true;
  exitEditMode();
  setSelectedPath(null);

  layers.forEach((layer) => layer.group.remove());
  layers = [];

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
      const path = createPathElement(
        polygon.points || [],
        polygon.curveTypes || [],
        polygon.controls || [],
        polygon.color || '#000000'
      );
      group.appendChild(path);
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
  if (tool === 'fill') return 'Fill';
  return 'Eyedropper';
}

function updateToolButtons() {
  traceToolBtn.classList.toggle('active', currentTool === 'trace');
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
  currentTool = tool;
  updateToolButtons();
  updateInteractionState();
}

function cancelCurrentTrace() {
  tracing = false;
  currentPoints = [];
  currentCurveTypes = [];
  currentControls = [];
  nextCurveType = 'line';
  hoverPoint = null;
  curveSelector.style.display = 'none';
  renderTempPath();
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

function handleEditDrag(e) {
  if (!editingPath || editHandles.length === 0) return;
  const currentDrag = editHandles.find((h) => h.isDragging);
  if (!currentDrag) return;
  
  const rect = canvasViewport.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoomLevel;
  const y = (e.clientY - rect.top - panY) / zoomLevel;
  
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
  editHandles.forEach((h) => (h.isDragging = false));
}

function renderEditHandles(path) {
  editHandles.forEach((h) => h.element.remove());
  editHandles = [];
  if (!handlesVisible) return;

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

function bindPathInteractions(path) {
  path.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;

    if (currentTool === 'fill') {
      if (isPathLocked(path)) return;
      if (path.getAttribute('fill') !== pickedColor) {
        pushHistoryState();
        path.setAttribute('fill', pickedColor);
      }
      e.stopPropagation();
      return;
    }

    if (currentTool !== 'trace') return;
    if (isPathLocked(path)) return;

    setSelectedPath(path);
    e.stopPropagation();
  });

  path.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPathLocked(path)) return;

    if (selectedPath !== path) {
      setSelectedPath(path);
      return;
    }

    if (editingPath === path) {
      exitEditMode();
    } else {
      enterEditMode(path);
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

    const polygons = Array.from(layer.group.querySelectorAll('path'));
    if (polygons.length > 0) {
      const polygonsList = document.createElement('div');
      polygonsList.className = 'layerPolygonsList';

      polygons.forEach((polygon, idx) => {
        const polygonRow = document.createElement('div');
        polygonRow.className = 'layerPolygonRow';

        const polygonLabel = document.createElement('span');
        polygonLabel.className = 'layerPolygonName';
        polygonLabel.textContent = `Polygon ${idx + 1}`;
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

  const path = createPathElement(points, curveTypes, controls, color);
  activeLayer.group.appendChild(path);
  setSelectedPath(path);
  renderLayersList();
}

function renderTempPath() {
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
    addPolygon(currentPoints, currentCurveTypes, currentControls, pickedColor);
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

function exportSvg() {
  const clone = svgOverlay.cloneNode(true);
  const cloneTemp = clone.querySelector('#tempGroup');
  if (cloneTemp) cloneTemp.remove();

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

  if (e.key === 'Escape') {
    if (helpOpen) {
      toggleHelp(false);
      return;
    }
    if (tracing) {
      cancelCurrentTrace();
    } else if (editingPath) {
      exitEditMode();
    } else {
      cancelCurrentTrace();
    }
  }

  if (e.key === 'Delete') {
    if (editingPath) {
      e.preventDefault();
      removePolygon(editingPath, true);
    } else if (selectedPath) {
      e.preventDefault();
      removePolygon(selectedPath, true);
    }
  }

  if (e.code === 'Space' && !e.repeat) {
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

canvasViewport.addEventListener('mousemove', (e) => {
  if (!tracing || isPanning) return;
  hoverPoint = getSvgPoint(e);
  renderTempPath();
});

canvasViewport.addEventListener('mouseleave', () => {
  hoverPoint = null;
  renderTempPath();
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

  if (!tracing) {
    setSelectedPath(null);
  }

  if (currentTool === 'eyedropper') return;
  if (currentTool === 'fill') return;

  const activeLayer = getActiveLayer();
  if (activeLayer && activeLayer.locked) return;

  const point = getSvgPoint(e);
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
  }
});

exportBtn.addEventListener('click', exportSvg);
if (undoBtn) undoBtn.addEventListener('click', undo);
if (redoBtn) redoBtn.addEventListener('click', redo);
if (helpBtn) helpBtn.addEventListener('click', () => toggleHelp());
colorPreview.addEventListener('click', () => colorPicker.click());
colorPicker.addEventListener('input', (e) => setPickedColor(e.target.value));
if (helpCloseBtn) helpCloseBtn.addEventListener('click', () => toggleHelp(false));
if (helpOverlay) helpOverlay.addEventListener('click', (e) => { if (e.target === helpOverlay) toggleHelp(false); });

// TODO: Workflow polish: add a shortcut cheat sheet, confirmation dialogs for destructive actions, and autosave drafts to localStorage.
setPickedColor('#000000');
createLayer('Layer 1');
setTool('trace');
setDarkMode(true);
setCanvasSize(800, 600);
toggleImageBtn.textContent = 'Hide Image';
toggleSvgBtn.textContent = 'Hide SVG';
updateHistoryButtons();
