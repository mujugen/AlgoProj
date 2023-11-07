let stack = [];
let arr; // Initialize the arr variable
let isSorted = false;
let sortingInterval; // Interval for auto-sorting
let timeout = 2000;
function updateArrayVisualization() {
  const container = document.getElementById("array-container");
  container.innerHTML = "";
  for (let i = 0; i < arr.length; i++) {
    const element = document.createElement("div");
    element.className = "array-element";
    element.innerText = arr[i];
    container.appendChild(element);
  }
}

function quicksortStep(inputArr, low, high) {
  arr = inputArr.slice();
  stack.push({ low, high });
  updateArrayVisualization();
  updateStepDisplay(`Sorting from index ${low} to ${high}`);
  nextStep();
}

function highlightElement(index, color) {
  const elements = document.getElementById("array-container").children;
  if (index >= 0 && index < elements.length) {
    const element = elements[index];
    element.style.backgroundColor = color;

    setTimeout(() => {
      element.style.backgroundColor = ""; // Reset background color after a delay
    }, 500);
  }
}

function nextStep() {
  if (stack.length === 0) {
    if (isSorted) {
      clearInterval(sortingInterval);
    } else {
      console.log("No more partitions to sort.");
      updateStepDisplay("No more partitions to sort.");
      isSorted = true;
      stack.push({ low: 0, high: arr.length - 1 });
      nextStep();
    }
    return;
  }
  const { low, high } = stack.pop();

  if (low < high) {
    updateStepDisplay(`Sorting from index ${low} to ${high}`);
    partition(low, high).then((pivotIndex) => {
      stack.push({ low, high: pivotIndex - 1 });
      stack.push({ low: pivotIndex + 1, high });
      setTimeout(nextStep, 0); // Proceed to next step after async partitioning
    });
  } else {
    isSorted = true;
    updateStepDisplay(`Partition from index ${low} to ${high} is sorted.`);
    setTimeout(nextStep, 0);
  }
}

function partition(low, high) {
  // Wrap the code in a new Promise
  return new Promise((resolve) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    highlightElement(high, "green"); // Highlight swapped elements
    highlightElement(i + 1, "green");
    console.log(`Placed pivot element ${arr[i + 1]} in its correct position`);
    highlightElement(i + 1, "yellow"); // Highlight pivot element
    console.log(
      `Comparing low (${low}) and high (${high}): Low is not less than High`
    );

    // Use setTimeout to introduce the delay and resolve the promise after the delay
    setTimeout(() => {
      updateArrayVisualization();
      resolve(i + 1); // resolve the promise with the pivot index
    }, timeout);
  });
}

function reset() {
  stack = [];
  updateArrayVisualization();
}

function updateStepDisplay(stepText) {
  const stepDisplay = document.getElementById("step-display");
  const newParagraph = document.createElement("p");
  newParagraph.textContent = stepText;
  stepDisplay.insertBefore(newParagraph, stepDisplay.firstChild);
}

function sort() {
  timeout = 4500 - document.getElementById("timeoutSpeed").value;
  let arrayToSort = document.getElementById("arrayValues").value.split(",");
  if (arrayToSort.length <= 1) {
    arrayToSort = [2, 8, 1, 6, 3, 7, 5, 9];
  }
  quicksortStep(arrayToSort, 0, arrayToSort.length - 1);
  nextStep();
  sortingInterval = setInterval(nextStep, 200);
}
