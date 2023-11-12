let currentStep = 0;
let steps = [];
let arrowData = [];
function initialize(n) {
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
  createMemoryTable(n);
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
function nextStep(n) {
  if (currentStep < steps.length) {
    steps[currentStep++]();
    drawArrows(); // Redraw arrows after each step
    return false;
  } else {
    let fib = dynamicFibonacci(n);
    let timeout = 500 - document.getElementById("timeoutSpeed").value;
    // Function to process each Fibonacci number with delay
    function processFibNumber(i) {
      if (i < fib.length) {
        let currentText = `fib(${i})`;
        let targetText = fib[i];
        replaceElementText(currentText, targetText);
        updateMemoryTable(i, fib[i]);

        drawArrows();

        // Schedule the next Fibonacci number processing
        setTimeout(() => processFibNumber(i + 1), timeout * 2);
      }
    }

    // Start processing the first Fibonacci number
    processFibNumber(0);
    return true;
  }
}

function clearSVG(svg) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

function run() {
  reset();
  let inputBox = document.getElementById("inputBox");
  let n = 5;
  if (inputBox.value) {
    n = inputBox.value;
  }
  counter = 1;
  let timeout = 500 - document.getElementById("timeoutSpeed").value;
  initialize(n);
  const interval = setInterval(() => {
    const isFinished = nextStep(n);
    if (isFinished) {
      clearInterval(interval); // Stop the interval when the algorithm is finished
    }

    counter++;
  }, timeout);
}

function dynamicFibonacci(n) {
  // Initialize an array to store Fibonacci numbers
  let fib = [0, 1];

  // Calculate Fibonacci numbers and store them in the array
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }

  // Return the nth Fibonacci number
  return fib;
}
function reset() {
  currentStep = 0;
  steps = [];
  arrowData = [];

  // You can also reset other variables or elements here if needed.
  // For example, you can clear the SVG element and reset the traceZone content.
  let traceZone = document.getElementById("traceZone");
  traceZone.innerHTML = "";

  // Call any other initialization functions you have as needed.

  // If you want to reset the memory table, you can clear its content like this:
  let memoryTable = document.getElementById("step-display");
  memoryTable.innerHTML = "";
}

function replaceElementText(searchText, replaceText) {
  // Get all elements with the specified class name
  var elements = document.getElementsByClassName("array-element2");

  // Loop through the elements
  for (var i = 0; i < elements.length; i++) {
    // Check if the innerText matches the search text
    if (elements[i].innerText === searchText) {
      // Replace the innerText with the specified replace text
      elements[i].innerText = replaceText;
      elements[i].style.backgroundColor = "#4287f5";
      elements[i].style.minWidth = "60px";
      elements[i].style.border = "3px solid #4287f5";
    }
  }
}
function createMemoryTable(n) {
  let table = document.createElement("table");
  table.style.width = "100%"; // Set table width to 100% of its parent
  table.style.borderCollapse = "collapse"; // Optional, for better aesthetics

  // Create header row
  let header = table.createTHead();
  let headerRow = header.insertRow(0);
  let headerCell1 = headerRow.insertCell(0);
  let headerCell2 = headerRow.insertCell(1);
  headerCell1.innerHTML = "Function";
  headerCell2.innerHTML = "Memory";

  // Style header cells for even spacing and aesthetics
  headerCell1.style.width = "50%";
  headerCell2.style.width = "50%";
  headerCell1.style.textAlign = "center";
  headerCell2.style.textAlign = "center";
  headerCell1.style.fontSize = "20px";
  headerCell1.style.fontWeight = "bold";
  headerCell2.style.fontSize = "20px";
  headerCell2.style.fontWeight = "bold";

  // Create rows for Fibonacci numbers
  for (let i = 0; i <= n; i++) {
    let row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = `fib(${i})`;
    cell2.innerHTML = "Pending";
    cell2.id = `fib-value-${i}`;

    // Style cells for even spacing and aesthetics
    cell1.style.width = "50%";
    cell2.style.width = "50%";
    cell1.style.textAlign = "center";
    cell2.style.textAlign = "center";
  }

  document.getElementById("step-display").appendChild(table);
}

function updateMemoryTable(index, value) {
  let cell = document.getElementById(`fib-value-${index}`);
  if (cell) {
    cell.innerHTML = value;
  }
}
