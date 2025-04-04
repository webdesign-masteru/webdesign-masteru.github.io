const canvas = document.getElementById("curve");
const ctx = canvas.getContext("2d");
const box = document.getElementById("box");
const code = document.getElementById("codeOutput");
const supportsTouch = "createTouch" in document;
const time = document.getElementById("time");
let timeVal = 500;

const supportsBezierRange = (function () {
  const el = document.createElement("div");
  el.style.WebkitTransitionTimingFunction = "cubic-bezier(1,0,0,1.1)";
  return !!el.style.WebkitTransitionTimingFunction.length;
})();

function BezierHandle(x, y) {
  this.x = x;
  this.y = y;
  this.width = 12;
  this.height = 12;
}

BezierHandle.prototype = {
  getSides: function () {
    this.left = this.x - this.width / 2;
    this.right = this.left + this.width;
    this.top = this.y - this.height / 2;
    this.bottom = this.top + this.height;
  },
  draw: function () {
    this.getSides();
    ctx.fillStyle = "#222";
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }
};

const handles = [new BezierHandle(50, 280), new BezierHandle(150, 180)];

function Graph() {
  this.x = 0;
  this.y = 130;
  this.height = 200;
  this.width = 200;
}

Graph.prototype = {
  draw: function () {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 0.5, this.y - 0.5, this.width - 1, this.height);
    ctx.restore();
  }
};

const graph = new Graph();

function getPos(event) {
  const mouseX = event.pageX - getOffSet(event.target).left;
  const mouseY = event.pageY - getOffSet(event.target).top;
  return { x: mouseX, y: mouseY };
}

function getOffSet(obj) {
  let curleft = 0, curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return { left: curleft, top: curtop };
  }
}

let drag = false;
let draggingObj;
let oldX, oldY;

function onPress(event) {
  event.preventDefault();
  event.stopPropagation();
  const cursorEvent = supportsTouch ? event.touches[0] : event;
  const mouseCoordinates = getPos(cursorEvent);
  const x = mouseCoordinates.x;
  const y = mouseCoordinates.y;

  for (let i = 0; i < handles.length; i++) {
    const current = handles[i];
    let curLeft = current.left;
    let curRight = current.right;
    let curTop = current.top;
    let curBottom = current.bottom;

    if (supportsTouch) {
      curLeft -= 20;
      curRight += 20;
      curTop -= 20;
      curBottom += 20;
    }

    if (x >= curLeft && x <= curRight && y >= curTop && y <= curBottom) {
      draggingObj = current;
      oldX = event.pageX;
      oldY = event.pageY;

      const presets = document.getElementById("presets");
      const options = presets.options;
      options.selectedIndex = options.length - 1;

      document.addEventListener("mouseup", onRelease, false);
      document.addEventListener("touchend", touchEnd, false);
      document.addEventListener("mousemove", onMove, false);
      document.addEventListener("touchmove", touchMove, false);
      document.body.style.cursor = canvas.style.cursor = "move";
    }
  }
}

function onMove(event) {
  const cursorEvent = supportsTouch ? event.touches[0] : event;
  let x = cursorEvent.pageX - getOffSet(canvas).left;
  let y = cursorEvent.pageY - getOffSet(canvas).top;

  if (x > graph.width) x = graph.width;
  if (x < 0) x = 0;
  if (y > canvas.height) y = canvas.height;
  if (y < 0) y = 0;

  draggingObj.x = x;
  draggingObj.y = y;
  updateDrawing();
}

function touchMove(event) {
  onMove(event);
  event.preventDefault();
}

function onRelease(event) {
  drag = false;
  canvas.style.cursor = "pointer";
  document.body.style.cursor = "default";
  document.removeEventListener("mousemove", onMove, false);
  document.removeEventListener("touchmove", touchMove, false);
  document.removeEventListener("mouseup", onRelease, false);
  document.removeEventListener("touchend", touchEnd, false);
}

function touchEnd(event) {
  onRelease(event);
  event.preventDefault();
}

canvas.addEventListener("mousedown", onPress, false);
canvas.addEventListener("touchstart", function touchPress(event) {
  onPress(event);
  event.preventDefault();
}, false);

function updateDrawing() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw();
  const cp1 = handles[0];
  const cp2 = handles[1];

  ctx.save();
  ctx.strokeStyle = "#4C84D3";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(graph.x, graph.y + graph.height);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, graph.width, graph.y);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.moveTo(graph.x, graph.y + graph.height);
  ctx.lineTo(cp1.x, cp1.y);
  ctx.moveTo(graph.width, graph.y);
  ctx.lineTo(cp2.x, cp2.y);
  ctx.stroke();

  for (let i = 0; i < handles.length; i++) {
    handles[i].draw();
  }

  const x1 = (cp1.x / graph.width).toFixed(3);
  const y1 = ((graph.height + graph.y - cp1.y) / graph.height).toFixed(3);
  const x2 = (cp2.x / canvas.width).toFixed(3);
  const y2 = ((graph.height + graph.y - cp2.y) / graph.height).toFixed(3);

  const points = "(" +
    (x1 == 0 ? '0' : (Math.round(x1 * 100) / 100).toString().replace(/^(-?)0/, '$1').replace(/0+$/, '').replace(/\.$/, '') || '0') + ", " +
    (y1 == 0 ? '0' : (Math.round(y1 * 100) / 100).toString().replace(/^(-?)0/, '$1').replace(/0+$/, '').replace(/\.$/, '') || '0') + ", " +
    (x2 == 0 ? '0' : (Math.round(x2 * 100) / 100).toString().replace(/^(-?)0/, '$1').replace(/0+$/, '').replace(/\.$/, '') || '0') + ", " +
    (y2 == 0 ? '0' : (Math.round(y2 * 100) / 100).toString().replace(/^(-?)0/, '$1').replace(/0+$/, '').replace(/\.$/, '') || '0') +
    ")";

  const bezier = "cubic-bezier" + points;
  const presets = document.getElementById("presets");
  let easeName = presets.querySelector("option:checked").textContent;
  if (easeName.indexOf("custom") > -1) easeName = "custom";

  code.innerHTML =
    '<pre class="pre-bezier">' +
    "transition: all " +
    (timeVal / 1000).toString().replace(/^0/, '') +
    "s " +
    bezier +
    ";" +
    "</pre>" +
    '<pre class="pre-bezier">' +
    "transition-timing-function: " +
    bezier +
    ";" +
    "</pre>";
}

function setTransitions() {
  const cp1 = handles[0];
  const cp2 = handles[1];

  const x1 = (cp1.x / graph.width).toFixed(3);
  const y1 = ((graph.height + graph.y - cp1.y) / graph.height).toFixed(3);
  const x2 = (cp2.x / canvas.width).toFixed(3);
  const y2 = ((graph.height + graph.y - cp2.y) / graph.height).toFixed(3);

  const points = "(" + x1 + ", " + y1 + ", " + x2 + ", " + y2 + ")";
  timeVal = time.value;

  const transition = "all " + timeVal + "ms cubic-bezier" + points;
  box.style.WebkitTransition = transition;
  box.style.MozTransition = transition;
  box.style.MsTransition = transition;
  box.style.OTransition = transition;
  box.style.transition = transition;

  if (!supportsBezierRange) {
    let wy1 = y1, wy2 = y2;
    if (y1 > 1) wy1 = 1;
    if (y1 < 0) wy1 = 0;
    if (y2 > 1) wy2 = 1;
    if (y2 < 0) wy2 = 0;

    box.style.WebkitTransition = "all " + timeVal + "ms cubic-bezier(" + x1 + ", " + wy1 + ", " + x2 + ", " + wy2 + ")";
  }
}

function presetChange() {
  const coordinates = this.value.split(",");
  const cp1 = handles[0];
  const cp2 = handles[1];

  cp1.x = coordinates[0] * graph.width;
  cp1.y = graph.y + graph.height - coordinates[1] * graph.height;
  cp2.x = coordinates[2] * graph.width;
  cp2.y = graph.y + graph.height - coordinates[3] * graph.height;
  updateDrawing();
}

const presets = document.getElementById("presets");
const timeInput = document.getElementById("time");
const presetOpts = presets.querySelectorAll("option");

presets.addEventListener("change", presetChange);

document.querySelectorAll(".testButton").forEach(button => {
  button.addEventListener("click", function () {
    setTransitions();
    box.classList.toggle(this.value);
  });
});

timeInput.addEventListener("change", function () {
  setTransitions();
  updateDrawing();
});

timeInput.addEventListener("keyup", function () {
  this.dispatchEvent(new Event("change"));
});

document.addEventListener("keydown", function (event) {
  const selected = presets.querySelector("option:checked");
  const currentIdx = Array.from(presetOpts).indexOf(selected);

  if (event.keyCode === 39 && event.target !== time) {
    if (currentIdx < presetOpts.length - 1) {
      selected.removeAttribute("selected");
      presetOpts[currentIdx + 1].setAttribute("selected", "selected");
      presets.dispatchEvent(new Event("change"));
    }
  } else if (event.keyCode === 37 && event.target !== time) {
    if (currentIdx > 0) {
      selected.removeAttribute("selected");
      presetOpts[currentIdx - 1].setAttribute("selected", "selected");
      presets.dispatchEvent(new Event("change"));
    }
  }
});

setTransitions();
presets.dispatchEvent(new Event("change"));
