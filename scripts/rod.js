let currentStep = 0;
let steps = [];
let arrowData = [];
let originalLength;
function initialize(n, price) {
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
  createMemoryTable(n, price);
  cutRod(n, traceZone, 0, svg, price);
  if (traceZone.offsetWidth > 2000) {
    traceZone.style.marginLeft = `${
      1071.43 * (n * n) - 14885.71 * n + 52642.86
    }px`;
  }
}
function cutRod(n, parentElement, level, svg, price) {
  let callContainer = document.createElement("div");
  callContainer.style.display = "flex";
  callContainer.style.flexDirection = "column";
  callContainer.style.alignItems = "center";
  callContainer.style.margin = `${level * 2}px`;
  let callLabel = document.createElement("div");
  callLabel.textContent = `${n}:${price[n]}`;

  callLabel.className = "array-element2";
  callLabel.style.margin = `10px`;
  callContainer.appendChild(callLabel);

  parentElement.appendChild(callContainer);

  if (n <= 0) {
    steps.push(() => n);
  } else {
    steps.push(() => {
      let childrenContainer = document.createElement("div");
      childrenContainer.style.display = "flex";
      childrenContainer.style.justifyContent = "center";
      childrenContainer.style.gap = `${level}px`;

      let childValues = [];

      for (let i = n - 1; i >= 0; i--) {
        let childVal = cutRod(i, childrenContainer, level + 1, svg, price);
        childValues.push(childVal);
      }

      if (childrenContainer.hasChildNodes()) {
        callContainer.appendChild(childrenContainer);

        requestAnimationFrame(() => {
          // Draw arrows to each child element
          for (let i = 0; i < childValues.length; i++) {
            drawArrow(callLabel, childrenContainer.children[i].firstChild, svg);
            arrowData.push({
              from: callLabel,
              to: childrenContainer.children[i].firstChild,
              svg,
            });
          }
        });
      }

      return childValues.reduce((sum, val) => sum + val, 0);
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
  // Use requestAnimationFrame to ensure accurate getBoundingClientRect values
  requestAnimationFrame(() => {
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
  });
}

function nextStep(n, price) {
  if (currentStep < steps.length) {
    steps[currentStep++]();
    drawArrows(); // Redraw arrows after each step
    return false;
  } else {
    let val = dynamicCutRod(n, price);

    let timeout = 500 - document.getElementById("timeoutSpeed").value;

    function processCutRod(i) {
      if (i < n + 1) {
        let currentText = `${i}:${price[i - 1]}`;
        if (i == 0) {
          currentText = `0:0`;
        }

        let targetText = `${val[i]}`;
        replaceElementText(currentText, targetText);
        updateMemoryTable(i, val[i]);

        drawArrows();

        setTimeout(() => processCutRod(i + 1), timeout * 2);
      }
    }

    processCutRod(0);
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
  let inputArray = document.getElementById("arrayValues").value.split(",");
  let price = [0];
  if (inputArray.length > 1) {
    for (let i = 0; i < inputArray.length; i++) {
      price.push(parseInt(inputArray[i], 10));
    }
  } else {
    price = [0, 2, 5, 9, 10, 12];
  }
  let n = price.length - 1;
  originalLength = n;
  console.log(price);

  counter = 1;
  let timeout = 500 - document.getElementById("timeoutSpeed").value;
  initialize(n, price);
  const interval = setInterval(() => {
    const isFinished = nextStep(n, price);
    if (isFinished) {
      clearInterval(interval); // Stop the interval when the algorithm is finished
    }

    counter++;
  }, timeout);
}

function dynamicCutRod(n, price) {
  price.shift();
  let val = new Array(n + 1);
  val[0] = 0;

  // Build the table val[] in
  // bottom up manner and return
  // the last entry from the table
  for (let i = 1; i <= n; i++) {
    let max_val = Number.MIN_VALUE;
    for (let j = 0; j < i; j++)
      max_val = Math.max(max_val, price[j] + val[i - j - 1]);
    val[i] = max_val;
  }

  return val;
}

function replaceElementText(searchText, replaceText) {
  // Get all elements with the specified class name
  var elements = document.getElementsByClassName("array-element2");

  // Loop through the elements
  for (var i = 0; i < elements.length; i++) {
    // Check if the innerText matches the search text
    if (elements[i].innerText === searchText) {
      // Get the adjacent sibling element
      var adjacentElement = elements[i].nextElementSibling;
      removeRelatedArrows(elements[i]);
      // Check if there is an adjacent element
      if (adjacentElement) {
        // Remove the adjacent element
        adjacentElement.parentNode.removeChild(adjacentElement);
      }

      // Set the text content of the current element to the replace text
      elements[i].textContent = replaceText;

      // Apply any other styling or modifications you want
      elements[i].style.backgroundColor = "#4287f5";
      elements[i].style.minWidth = "60px";
      elements[i].style.border = "3px solid #4287f5";
    }
  }
}
function removeRelatedArrows(element) {
  // Filter out arrow data where the current element is either the source or the destination
  arrowData = arrowData.filter(
    (arrow) => arrow.from !== element && arrow.to !== element
  );
}
function createMemoryTable(n, price) {
  let table = document.createElement("table");
  table.style.width = "100%"; // Set table width to 100% of its parent
  table.style.borderCollapse = "collapse"; // Optional, for better aesthetics

  // Create header row
  let header = table.createTHead();
  let headerRow = header.insertRow(0);
  let headerCell1 = headerRow.insertCell(0);
  let headerCell2 = headerRow.insertCell(1);
  headerCell1.innerHTML = "Function";
  headerCell2.innerHTML = "Max Value";

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
    cell1.innerHTML = `r(${i})`;
    cell2.innerHTML = "Pending";
    cell2.id = `cutValue-${i}`;

    // Style cells for even spacing and aesthetics
    cell1.style.width = "50%";
    cell2.style.width = "50%";
    cell1.style.textAlign = "center";
    cell2.style.textAlign = "center";
  }

  document.getElementById("step-display").appendChild(table);
}

function updateMemoryTable(index, value) {
  let cell = document.getElementById(`cutValue-${index}`);
  if (cell) {
    cell.innerHTML = value;
  }
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
