let nodes = [];
let links = [];
let nodeCount = 0;

const nodeRadius = 5;
const graphScale = 20;
let width;
let height;
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
  // You might need to update other elements and re-render the graph here
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

// Define arrowhead marker
svg
  .append("defs")
  .append("marker")
  .attr("id", "arrowhead")
  .attr("viewBox", "-0 -5 10 10")
  .attr("refX", 8) // Position of the arrowhead (adjust as needed)
  .attr("refY", 0)
  .attr("orient", "auto")
  .attr("markerWidth", 5)
  .attr("markerHeight", 5)
  .attr("xoverflow", "visible")
  .append("svg:path")
  .attr("d", "M 0,-5 L 10 ,0 L 0,5")
  .attr("fill", "#000000")
  .style("stroke", "none");

const g = svg.append("g");
const defaultZoom = 2;
const translateX = -1200;
const translateY = -150;

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
document
  .getElementById("runDijkstraBtn")
  .addEventListener("click", function () {
    const source = prompt("Enter source node id for Dijkstra:");
    const destination = prompt("Enter destination node id for Dijkstra:");

    if (!getNodeByName(source) || !getNodeByName(destination)) {
      alert("Invalid node(s)!");
      return;
    }

    // Run Dijkstra's algorithm
    const { distances, previous } = dijkstra(nodes, links, source);

    const path = [];
    for (let at = destination; at != null; at = previous[at]) {
      path.push(at);
    }
    path.reverse();

    if (path[0] !== source) {
      alert("No path found!");
      return;
    }

    // Update the graph colors
    nodes.forEach((node) => {
      if (path.includes(node.id)) {
        node.color = "green";
        console.log(`node = ${JSON.stringify(node)}`);
      } else {
        node.color = "#999";
      }
    });

    links.forEach((link) => {
      if (path.includes(link.source) && path.includes(link.target)) {
        link.color = "green";
        console.log(`path = ${path}`);
      } else {
        link.color = "#999";
      }
    });

    // After running the algorithm, update the graph to reflect changes
    updateGraph();
  });

function updateGraph() {
  const nodeElements = g.selectAll(".node").data(nodes, (d) => d.id); // Change here: use 'g' instead of 'svg'

  nodeElements
    .enter()
    .append("circle")
    .attr("r", nodeRadius)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", (d) => d.color || "blue")
    .merge(nodeElements)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", (d) => d.color || "blue");

  nodeElements.exit().remove();
  const nodeUpdate = nodeElements.enter().append("g").attr("class", "node");
  nodeUpdate
    .append("circle")
    .attr("r", nodeRadius)
    .merge(nodeElements.select("circle")) // Ensure that you merge with the circle selection, not with the group selection
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", (d) => d.color || "blue");

  // Text update for each node
  nodeUpdate
    .append("text")
    .attr("dx", 12) // Shift the text a bit to the right of the node
    .attr("dy", ".35em") // Center the text vertically
    .text((d) => d.id)
    .merge(nodeElements.select("text")) // Merge the enter and update selections
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);

  // Remove exiting nodes
  nodeElements.exit().remove();
  const linkElements = g
    .selectAll(".link")
    .data(links, (d) => `${d.source}-${d.target}`);

  linkElements
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", function (d) {
      const sourceNode = getNodeByName(d.source);
      const targetNode = getNodeByName(d.target);
      return `M${sourceNode.x},${sourceNode.y}L${targetNode.x},${targetNode.y}`;
    })
    .attr("fill", "none")
    .attr("stroke", (d) => d.color || "#999")
    .attr("marker-end", "url(#arrowhead)")
    .merge(linkElements);

  linkElements.exit().remove();

  const textElements = g
    .selectAll(".text")
    .data(links, (d) => `${d.source}-${d.target}`);

  textElements
    .enter()
    .append("text")
    .attr("class", "text")
    .attr(
      "x",
      (d) => (getNodeByName(d.source).x + getNodeByName(d.target).x) / 2
    )
    .attr(
      "y",
      (d) => (getNodeByName(d.source).y + getNodeByName(d.target).y) / 2
    )
    .text((d) => d.weight)
    .merge(textElements);

  textElements.exit().remove();
}

function dijkstra(nodes, links, startNode) {
  console.log("running dijkstra");
  const unvisited = nodes.map((n) => n.id);
  const distances = {};
  const previous = {};

  nodes.forEach((node) => {
    distances[node.id] = Infinity; // initialize all distances to Infinity
    previous[node.id] = null; // no previous nodes at the beginning
  });

  distances[startNode] = 0; // distance to the start node is 0

  while (unvisited.length > 0) {
    // find the node with the smallest known distance
    let currentNode = unvisited.reduce((nearest, node) => {
      return distances[node] < distances[nearest] ? node : nearest;
    });

    // remove current node from unvisited set
    unvisited.splice(unvisited.indexOf(currentNode), 1);

    // find neighboring nodes
    let neighbors = links
      .filter((l) => l.source === currentNode)
      .map((l) => l.target);

    for (let neighbor of neighbors) {
      let link = links.find(
        (l) =>
          (l.source === currentNode && l.target === neighbor) ||
          (l.target === currentNode && l.source === neighbor)
      );
      let alt = distances[currentNode] + parseFloat(link.weight);
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
      }
    }
  }

  return { distances, previous };
}

function exportGraph() {
  const graph = {
    nodes: nodes,
    links: links,
    nodeCount: nodeCount,
    nodeCounter: nodeCounter,
    nodeName: nodeName,
  };
  let serializedGraph = JSON.stringify(graph);
  localStorage.setItem("graphData", serializedGraph);
}

function importGraph() {
  let serializedGraph = localStorage.getItem("graphData");
  if (serializedGraph) {
    const graph = JSON.parse(serializedGraph);
    nodes = [
      { id: "a", x: 1080, y: 320, color: "#999" },
      { id: "b", x: 1120, y: 280, color: "#999" },
      { id: "c", x: 1060, y: 260, color: "#999" },
      { id: "d", x: 1140, y: 240, color: "#999" },
      { id: "e", x: 1100, y: 200, color: "#999" },
      { id: "f", x: 1160, y: 160, color: "#999" },
    ];

    links = [
      { source: "a", target: "b", weight: "2", color: "#999" },
      { source: "b", target: "d", weight: "3", color: "#999" },
      { source: "a", target: "c", weight: "1", color: "#999" },
      { source: "c", target: "e", weight: "3", color: "#999" },
      { source: "d", target: "e", weight: "1", color: "#999" },
      { source: "e", target: "f", weight: "2", color: "#999" },
      { source: "d", target: "f", weight: "1", color: "#999" },
    ];
    updateGraph();
  } else {
    console.warn("No graph data found in local storage.");
  }
}
importGraph();
resizeSVG();
window.addEventListener("resize", resizeSVG);
