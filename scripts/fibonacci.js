function run() {
  let n = 6;
  let traceZone = document.getElementById("traceZone");
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
    return n;
  } else {
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

    return leftVal + rightVal;
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
