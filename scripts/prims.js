let nodes = [];
let links = [];
let nodeCount = 0;
let counter = 1;
const nodeRadius = 5;
const graphScale = 20;
const defaultZoom = 2.5;
const translateX = -1700;
const translateY = -250;
let width;
let height;
class MinPriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(element, priority) {
    // Creating an object with the element and its priority
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.queue.length; i++) {
      if (queueElement.priority < this.queue[i].priority) {
        // Inserting the element at the correct position
        this.queue.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    // If the element has the highest priority, it is pushed to the end of the array
    if (!added) {
      this.queue.push(queueElement);
    }
  }

  dequeue() {
    // Removing the element with the highest priority (lowest number) from the start of the array
    return this.queue.shift().element;
  }

  isEmpty() {
    // Checking if the queue is empty
    return this.queue.length === 0;
  }

  // Optionally, you can add a method to view the top element without removing it
  peek() {
    return this.queue.length > 0 ? this.queue[0].element : undefined;
  }
}

let mstLinks = [];
let edgeQueue = new MinPriorityQueue();
let added = new Set();

function resizeSVG() {
  // Use the size of the visualizer container
  const visualizer = document.querySelector(".visualizer");
  width = visualizer.offsetWidth;
  height = visualizer.offsetHeight;

  // Update the SVG dimensions
  svg.attr("width", width).attr("height", height);

  // Update scales, axes, or any other elements based on new size
  xScale.range([0, width]);
  yScale.range([height, 0]);

  const offsetX = Math.log(Math.max(visualizer.offsetWidth, 1));
  const scaleFactor = 500; // Adjust this factor to scale the result
  const adjustedOffsetX = scaleFactor * offsetX;
  g.attr(
    "transform",
    `translate(${-5500 + adjustedOffsetX}, ${translateY}) scale(${defaultZoom})`
  );
}

// Translate coordinate system to make (0,0) at the center of SVG
function translate(x, y) {
  return {
    x: x * graphScale + width / 2,
    y: height / 2 - y * graphScale,
  };
}
let nodeCounter = 0;
let nodeName = numberToLetters(nodeCounter);

function numberToLetters(number) {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = "";

  while (number >= 0) {
    const mod = number % 26;
    name = alphabets[mod] + name;
    number = Math.floor(number / 26) - 1;
  }

  return name;
}
function getNodeByName(name) {
  return nodes.find((node) => node.id === name);
}

// D3.js setup
const svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g");

g.attr(
  "transform",
  `translate(${translateX}, ${translateY}) scale(${defaultZoom})`
);

// Grid lines
const xScale = d3
  .scaleLinear()
  .domain([-width / 2 / graphScale, width / 2 / graphScale])
  .range([0, width]);
const yScale = d3
  .scaleLinear()
  .domain([-height / 2 / graphScale, height / 2 / graphScale])
  .range([height, 0]);

// Run Dijkstra's Algorithm
async function finish() {
  // Run Prim's algorithm
  const mstLinks = await prim(nodes, links);
  resetGraphColoring();

  if (!mstLinks.length) {
    alert("No Minimum Spanning Tree found!");
    return;
  }

  // Update the graph colors
  nodes.forEach((node) => (node.color = "#999"));
  links.forEach((link) => (link.color = "white"));

  mstLinks.forEach((link) => {
    link.color = "green";
    getNodeByName(link.source).color = "green";
    getNodeByName(link.target).color = "green";
  });

  updateGraph();
}

function initializePrim() {
  mstLinks = [];
  edgeQueue = new MinPriorityQueue();
  added = new Set();
  added.add(nodes[0].id); // Assuming the first node is the starting node

  updateStepDisplay("Initialized Prim's algorithm");
  updateGraph();
}
function nextStep() {
  if (added.size >= nodes.length) {
    finish();
    updateStepDisplay("Minimum Spanning Tree is complete!");
    return true;
  }

  updateStepDisplay(`Pass #${counter}`);
  links
    .filter(
      (link) =>
        (added.has(link.source) && !added.has(link.target)) ||
        (added.has(link.target) && !added.has(link.source))
    )
    .forEach((link) => {
      edgeQueue.enqueue(link, parseFloat(link.weight));
      updateStepDisplay(
        `Considering edge ${link.source}-${link.target} with weight ${link.weight}`
      );
    });

  let smallestEdge;
  do {
    if (edgeQueue.isEmpty()) {
      updateStepDisplay(
        "No more edges to process. Minimum Spanning Tree may not be complete."
      );
      return;
    }
    smallestEdge = edgeQueue.dequeue();
    updateStepDisplay(
      `Edge ${smallestEdge.source}-${smallestEdge.target} with weight ${smallestEdge.weight} is the optimal edge`
    );
  } while (added.has(smallestEdge.source) && added.has(smallestEdge.target));

  mstLinks.push(smallestEdge);
  const newNode = added.has(smallestEdge.source)
    ? smallestEdge.target
    : smallestEdge.source;
  added.add(newNode);

  updateGraphForPrim(smallestEdge, newNode);
  updateStepDisplay(
    `Added edge ${smallestEdge.source}-${smallestEdge.target} to MST`
  );
}

function updateGraph() {
  // Link handling
  const linkElements = g
    .selectAll(".link")
    .data(links, (d) => `${d.source}-${d.target}`);

  const linkEnter = linkElements
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none");

  linkEnter
    .merge(linkElements)
    .attr("d", function (d) {
      const offset = nodeRadius;
      const sourceNode = getNodeByName(d.source);
      const targetNode = getNodeByName(d.target);

      // Calculate the direction vector from source to target
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitDx = dx / length;
      const unitDy = dy / length;

      // Calculate offset points
      const sourceX = sourceNode.x + unitDx * offset;
      const sourceY = sourceNode.y + unitDy * offset;
      const targetX = targetNode.x - unitDx * offset;
      const targetY = targetNode.y - unitDy * offset;

      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    })
    .style("stroke", function (d) {
      return d.color || "blue";
    })
    .style("stroke-width", "1.5px");

  linkElements.exit().remove();
  // Node handling
  const nodeElements = g.selectAll(".node").data(nodes, (d) => d.id);

  // Enter new nodes
  const nodeEnter = nodeElements.enter().append("g").attr("class", "node");

  // Add circles for new nodes
  nodeEnter.append("circle").attr("r", nodeRadius).attr("fill", "#3266a8");

  // Add labels for new nodes
  nodeEnter
    .append("text")
    .attr("dx", 12) // Adjust text position relative to the circle
    .attr("dy", ".35em")
    .text((d) => d.id);

  // Update existing nodes
  const nodeUpdate = nodeEnter.merge(nodeElements);
  nodeUpdate
    .select("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  nodeUpdate
    .select("text")
    .attr("x", (d) => d.x) // Adjust text position relative to the circle
    .attr("y", (d) => d.y)
    .text((d) => d.id);

  // Remove old nodes
  nodeElements.exit().remove();

  // Link text handling
  const textElements = g
    .selectAll(".text")
    .data(links, (d) => `${d.source}-${d.target}`);

  textElements
    .enter()
    .append("text")
    .attr("class", "text")
    .style("font-size", "12px")
    .merge(textElements)
    .attr(
      "x",
      (d) => (getNodeByName(d.source).x + getNodeByName(d.target).x) / 2
    )
    .attr(
      "y",
      (d) => (getNodeByName(d.source).y + getNodeByName(d.target).y) / 2
    )
    .text((d) => d.weight);

  textElements.exit().remove();
}

function prim(nodes, links) {
  return new Promise((resolve) => {
    const mstLinks = [];
    const edgeQueue = new MinPriorityQueue(); // Assuming a MinPriorityQueue implementation
    const added = new Set();
    const startNode = nodes[0].id;
    added.add(startNode);

    while (added.size < nodes.length) {
      links
        .filter(
          (link) =>
            (added.has(link.source) && !added.has(link.target)) ||
            (added.has(link.target) && !added.has(link.source))
        )
        .forEach((link) => {
          edgeQueue.enqueue(link, parseFloat(link.weight));
        });

      let smallestEdge;
      do {
        if (edgeQueue.isEmpty()) {
          resolve(mstLinks); // Resolve with the current mstLinks if no more edges are available
          return true;
        }
        smallestEdge = edgeQueue.dequeue();
      } while (
        added.has(smallestEdge.source) &&
        added.has(smallestEdge.target)
      );

      mstLinks.push(smallestEdge);
      const newNode = added.has(smallestEdge.source)
        ? smallestEdge.target
        : smallestEdge.source;
      added.add(newNode);

      updateGraphForPrim(smallestEdge, newNode);
      //updateGraphForPrim(smallestEdge, newNode);
    }

    resolve(mstLinks);
  });
  return false;
}

function updateGraphForPrim(link, newNode) {
  const newNodeObj = getNodeByName(newNode);
  const existingLink = links.find(
    (l) => l.source === link.source && l.target === link.target
  );
  if (newNodeObj) {
    newNodeObj.color = "green";
  }
  if (existingLink) {
    existingLink.color = "green";
  }
  updateGraph();
}

function importGraph() {
  nodes = [
    { id: "a", x: 1080, y: 320, color: "#999" },
    { id: "b", x: 1120, y: 280, color: "#999" },
    { id: "c", x: 1060, y: 260, color: "#999" },
    { id: "d", x: 1140, y: 240, color: "#999" },
    { id: "e", x: 1100, y: 200, color: "#999" },
    { id: "f", x: 1160, y: 160, color: "#999" },
    { id: "g", x: 1040, y: 160, color: "#999" },
    { id: "h", x: 1020, y: 220, color: "#999" },
    { id: "i", x: 1100, y: 140, color: "#999" },
  ];

  links = [
    { source: "a", target: "b", weight: "2", color: "#999" },
    { source: "b", target: "d", weight: "3", color: "#999" },
    { source: "a", target: "c", weight: "1", color: "#999" },
    { source: "c", target: "e", weight: "3", color: "#999" },
    { source: "d", target: "e", weight: "1", color: "#999" },
    { source: "e", target: "f", weight: "2", color: "#999" },
    { source: "d", target: "f", weight: "1", color: "#999" },
    { source: "e", target: "g", weight: "2", color: "#999" },
    { source: "h", target: "g", weight: "2", color: "#999" },
    { source: "c", target: "h", weight: "2", color: "#999" },
    { source: "g", target: "i", weight: "1", color: "#999" },
    { source: "f", target: "i", weight: "1", color: "#999" },
    { source: "e", target: "i", weight: "1", color: "#999" },
  ];
  updateGraph();
}

function updateStepDisplay(stepText) {
  const stepDisplay = document.getElementById("step-display");
  const newParagraph = document.createElement("p");
  newParagraph.textContent = stepText;
  stepDisplay.insertBefore(newParagraph, stepDisplay.firstChild);
}

function removeAllStepDisplayElements() {
  const stepDisplay = document.getElementById("step-display");

  // Remove all child nodes while there are child nodes left
  while (stepDisplay.firstChild) {
    stepDisplay.removeChild(stepDisplay.firstChild);
  }
}
function highlightPath(previous, currentNode) {
  let pathNode = currentNode;
  while (previous[pathNode]) {
    // Set the current path node color to red
    let currentNodeObj = getNodeByName(pathNode);
    if (currentNodeObj) {
      currentNodeObj.color = "#3266a8";
    }

    // Set the link to the previous node to red
    let link = links.find(
      (l) =>
        (l.source === previous[pathNode] && l.target === pathNode) ||
        (l.target === previous[pathNode] && l.source === pathNode)
    );
    if (link) {
      link.color = "#3266a8";
    }

    // Set the previous path node color to red
    let prevNodeObj = getNodeByName(previous[pathNode]);
    if (prevNodeObj) {
      prevNodeObj.color = "#3266a8";
    }

    pathNode = previous[pathNode];
  }
  updateGraph();
}

function resetGraphColoring() {
  nodes.forEach((node) => {
    node.color = "#999"; // Original color
  });
  links.forEach((link) => {
    link.color = "#999"; // Original color
  });
  updateGraph();
}
importGraph();
resizeSVG();
window.addEventListener("resize", resizeSVG);
initializePrim();

function run() {
  reset();
  counter = 1;
  let timeout = 1300 - document.getElementById("timeoutSpeed").value;

  const interval = setInterval(() => {
    const isFinished = nextStep();
    if (isFinished) {
      clearInterval(interval); // Stop the interval when the algorithm is finished
    }

    counter++;
  }, timeout);
}

function reset() {
  nodes = [];
  links = [];
  nodeCount = 0;
  counter = 1;
  width = undefined;
  height = undefined;
  mstLinks = [];
  edgeQueue = new MinPriorityQueue();
  added = new Set();
  removeAllStepDisplayElements();
  resetGraphColoring();
  importGraph();
  resizeSVG();
  initializePrim();
}
