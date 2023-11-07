let stack = [];
let arr; // Initialize the arr variable
let isSorted = false;
let sortingInterval; // Interval for auto-sorting

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
  const elements = document.querySelectorAll(".array-element");
  if (index >= 0 && index < elements.length) {
    const element = elements[index];
    element.style.color = color;

    setTimeout(() => {
      element.style.color = ""; // Reset the color to its original state
    }, 500); // Remove the color after 500ms
  }
}

function nextStep() {
  if (stack.length === 0) {
    if (isSorted) {
      console.log("Sorting complete.");
      updateStepDisplay("Sorting complete.");
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
    const pivotIndex = partition(low, high);
    stack.push({ low, high: pivotIndex - 1 });
    stack.push({ low: pivotIndex + 1, high });
  } else {
    isSorted = true;
    updateStepDisplay(`Partition from index ${low} to ${high} is sorted.`);
    nextStep();
  }
}

function partition(low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      if (i !== j) {
        console.log(`Swapped ${arr[i]} and ${arr[j]}`);
        highlightElement(
          document.querySelectorAll(".array-element")[i],
          "yellow"
        ); // Highlight swapped elements
        highlightElement(
          document.querySelectorAll(".array-element")[j],
          "yellow"
        );
      }
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  console.log(`Placed pivot element ${arr[i + 1]} in its correct position`);
  highlightElement(document.querySelectorAll(".array-element")[i + 1], "green"); // Highlight pivot element
  console.log(
    `Comparing low (${low}) and high (${high}): Low is not less than High`
  );

  updateArrayVisualization();

  return i + 1;
}

function reset() {
  stack = [];
  updateArrayVisualization();
}

// Example usage:
const arrayToSort = [3, 6, 8, 10, 15, 2, 12];
quicksortStep(arrayToSort, 0, arrayToSort.length - 1);

function updateStepDisplay(stepText) {
  const stepDisplay = document.getElementById("step-display");
  stepDisplay.innerText = stepText;
}

function sort() {
  nextStep();
  sortingInterval = setInterval(nextStep, 200); // Auto-sort every 200ms
}
