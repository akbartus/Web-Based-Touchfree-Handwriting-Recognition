/* Author: Akbar Sultanov
   Date: 01.20.2023
*/

let canvasOver = document.getElementById("canvas");
let penSize = document.getElementById("penSize");

/* Rresize the canvas to occupy the full page, 
     by getting the widow width and height and setting it to canvas*/
canvasOver.width = window.innerWidth;
canvasOver.height = window.innerHeight;

// Color Picker
let colorPicker = document.querySelector("#colorPicker > input");
let currentColor = "#48FF0D";
colorPicker.addEventListener("change", function () {
  currentColor = document.querySelector("#colorPicker > input").value;
});

let canvas = new handwriting.Canvas(
  document.getElementById("canvas"),
  penSize.value
);

function pointOnCanvas(point) {
  point.x = canvas.width * (1 - point.x);
  point.y = canvas.height * point.y;
  return point;
}

const handsfree = new Handsfree({
  showDebug: true,
  hands: {
    enabled: true,
    // The maximum number of hands to detect [0 - 4]
    maxNumHands: 1,
    // Minimum confidence [0 - 1] for a hand to be considered detected
    minDetectionConfidence: 0.9,
    // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
    // Higher values are more robust at the expense of higher latency
    minTrackingConfidence: 0.5,
    threshold: 50,
    numThresholdErrorFrames: 5,
  },
});
handsfree.start();

// Do the recognition
handsfree.on("finger-pinched-1-0", () => {
  let e = document.getElementById("language");
  canvas.setOptions({ language: e.options[e.selectedIndex].value });
  canvas.recognize();
  setTimeout(function () {
    canvas.erase();
  }, 3000);
});

// Add mousedown, mousemove and mouseup events for hand tracking
handsfree.on("finger-pinched-start-0-0", () => {
  let point = handsfree.data.hands.curPinch[0][0];
  point = pointOnCanvas(point);
  canvas.cxt.strokeStyle = currentColor;
  canvas.cxt.lineWidth = canvas.lineWidth;

  canvas.handwritingX = [];
  canvas.handwritingY = [];
  canvas.drawing = true;
  canvas.cxt.beginPath();
  let x = point.x;
  let y = point.y;
  canvas.cxt.moveTo(x, y);
  canvas.handwritingX.push(x);
  canvas.handwritingY.push(y);
});
handsfree.on("finger-pinched-held-0-0", () => {
  let point = handsfree.data.hands.curPinch[0][0];
  point = pointOnCanvas(point);
  let x = point.x;
  let y = point.y;
  canvas.cxt.lineTo(x, y);
  canvas.cxt.stroke();
  canvas.cxt.strokeStyle = currentColor;
  canvas.handwritingX.push(x);
  canvas.handwritingY.push(y);
});
handsfree.on("finger-pinched-released-0-0", () => {
  let point = handsfree.data.hands.curPinch[0][0];
  point = pointOnCanvas(point);
  let w = [];
  w.push(canvas.handwritingX);
  w.push(canvas.handwritingY);
  w.push([]);
  canvas.trace.push(w);
  canvas.drawing = false;
  if (canvas.allowUndo) canvas.step.push(canvas.canvas.toDataURL());
});
canvas.setCallBack(function (data, err) {
  if (err) throw err;
  else document.getElementById("result").innerHTML = data[0];
});

canvas.set_Undo_Redo(true, true);

penSize.addEventListener("mousemove", function () {
  document.getElementById("lineWidth").innerHTML = penSize.value;
});

penSize.addEventListener("change", function () {
  canvas.setLineWidth(penSize.value);
});
