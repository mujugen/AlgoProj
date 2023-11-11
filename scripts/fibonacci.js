let currentStep = 0;
let steps = [];
let arrowData = [];

function run() {
  let traceZone = document.getElementById("traceZone");
  let inputBox = document.getElementById("inputBox");
  let n = 6;
  if (inputBox.value) {
    n = inputBox.value;
  }

  traceZone.style.position = "relative";

  traceZone.innerHTML = "";

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.top = 0;
  svg.style.left = 0;
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  traceZone.appendChild(svg);

  fibonacci(n, traceZone, 0, svg);
  if (traceZone.offsetWidth > 2000) {
    traceZone.style.marginLeft = `${
      1071.43 * (n * n) - 14885.71 * n + 52642.86
    }px`;
  }
}
function fibonacci(n, parentElement, level, svg) {
  let callContainer = document.createElement("div");
  callContainer.style.display = "flex";
  callContainer.style.flexDirection = "column";
  callContainer.style.alignItems = "center";
  callContainer.style.margin = `${level * 2}px`;

  let callLabel = document.createElement("div");
  callLabel.textContent = `fib(${n})`;
  callLabel.className = "array-element2";
  callLabel.style.margin = `10px`;
  callContainer.appendChild(callLabel);

  parentElement.appendChild(callContainer);

  if (n <= 1) {
    steps.push(() => n);
  } else {
    steps.push(() => {
      let childrenContainer = document.createElement("div");
      childrenContainer.style.display = "flex";
      childrenContainer.style.justifyContent = "center";

      childrenContainer.style.gap = `${level}px`;

      let leftVal = fibonacci(n - 1, childrenContainer, level + 1, svg);
      let rightVal = fibonacci(n - 2, childrenContainer, level + 1, svg);

      if (childrenContainer.hasChildNodes()) {
        callContainer.appendChild(childrenContainer);

        requestAnimationFrame(() => {
          drawArrow(callLabel, childrenContainer.firstChild.firstChild, svg);
          drawArrow(callLabel, childrenContainer.lastChild.firstChild, svg);
        });
      }
      arrowData.push({
        from: callLabel,
        to: childrenContainer.firstChild.firstChild,
        svg,
      });
      arrowData.push({
        from: callLabel,
        to: childrenContainer.lastChild.firstChild,
        svg,
      });

      return leftVal + rightVal;
    });
  }
}
function drawArrows() {
  if (arrowData.length > 0) {
    clearSVG(arrowData[0].svg); // Assuming all arrows are in the same SVG
    arrowData.forEach(({ from, to, svg }) => {
      drawArrow(from, to, svg);
    });
  }
}
function drawArrow(from, to, parentSvg) {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();

  const svgRect = parentSvg.getBoundingClientRect();

  const startX = fromRect.left + fromRect.width / 2 - svgRect.left;
  const startY = fromRect.bottom - svgRect.top;
  const endX = toRect.left + toRect.width / 2 - svgRect.left;
  const endY = toRect.top - svgRect.top;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY);
  line.setAttribute("stroke", "black");
  line.style.strokeWidth = "2";

  parentSvg.appendChild(line);
}
function nextStep() {
  if (currentStep < steps.length) {
    steps[currentStep++]();
    drawArrows(); // Redraw arrows after each step
  } else {
    alert("No more steps!");
  }
}
function clearSVG(svg) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}
