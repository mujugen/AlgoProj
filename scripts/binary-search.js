let array, valueToSearch, low, high, mid, timeout, intervalId;

function displayArray(array, low, mid, high, searchComplete) {
  let parentElement = document.getElementById("array-container");
  parentElement.innerHTML = "";
  for (i = 0; i < array.length; i++) {
    let callContainer = document.createElement("div");
    callContainer.style.display = "flex";
    callContainer.style.flexDirection = "column";
    callContainer.style.alignItems = "center";

    let callLabel = document.createElement("div");
    callLabel.textContent = `${array[i]}`;
    callLabel.className = "array-element2";
    callLabel.style.margin = `3px`;
    callContainer.appendChild(callLabel);
    if (i == low && !searchComplete) {
      callLabel.style.backgroundColor = "#4287f5";
    } else if (i == high && !searchComplete) {
      callLabel.style.backgroundColor = "#7b42f5";
    } else if (i == mid) {
      callLabel.style.backgroundColor = "yellow";
    } else {
      callLabel.style.backgroundColor = "";
    }
    let lowText = document.getElementById("lowText");

    let midText = document.getElementById("midText");
    let highText = document.getElementById("highText");
    lowText.innerText = `Low: ${array[low]}`;
    midText.innerText = `Mid: ${array[mid]}`;
    highText.innerText = `High: ${array[high]}`;
    parentElement.appendChild(callContainer);
  }
}

function initializeSearch() {
  const inputText = document.getElementById("arrayValues").value;
  array = inputText.split(",");

  for (let i = 0; i < array.length; i++) {
    array[i] = parseInt(array[i].trim(), 10);
  }

  console.log(array);
  if (array.length <= 1) {
    array = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
  }

  valueToSearch = 8;
  let inputValueToSearch = document.getElementById("valueToSearch").value;

  const numericValue = parseInt(inputValueToSearch);

  if (!isNaN(numericValue)) {
    if (array.includes(numericValue)) {
      valueToSearch = numericValue;
    } else {
      alert(`The value ${numericValue} is not in the array.`);
      array = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ];
    }
  } else {
    array = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
  }

  let valueToFindText = document.getElementById("valueToFind");
  valueToFindText.innerText = `Value To Find: ${valueToSearch}`;

  low = 0;
  high = array.length - 1;
  mid = Math.floor((low + high) / 2);
}

function run() {
  clearInterval(intervalId);
  timeout = 2000 - document.getElementById("timeoutSpeed").value;
  initializeSearch();
  displayArray(array, low, mid, high);
  intervalId = setInterval(nextStep, timeout);
}
function nextStep() {
  let searchComplete = false;

  if (low <= high) {
    mid = Math.floor((low + high) / 2);
    let midValue = array[mid];

    if (midValue === valueToSearch) {
      searchComplete = true;
      updateStepDisplay(
        `Found ${valueToSearch} at index ${mid}. Search complete.`
      );
    } else if (midValue < valueToSearch) {
      low = mid + 1;
      updateStepDisplay(
        `Comparing ${midValue} < ${valueToSearch}. Setting low = ${
          mid + 1
        } to search in the right half.`
      );
    } else {
      high = mid - 1;
      updateStepDisplay(
        `Comparing ${midValue} > ${valueToSearch}. Setting high = ${
          mid - 1
        } to search in the left half.`
      );
    }
  } else {
    searchComplete = true;
    updateStepDisplay(
      `${valueToSearch} not found in the array. Search complete.`
    );
  }

  mid = Math.floor((low + high) / 2);
  displayArray(array, low, mid, high, searchComplete);
}

function updateStepDisplay(stepText) {
  const stepDisplay = document.getElementById("step-display");
  stepDisplay.innerHTML = "";
  stepDisplay.style.marginTop = "40px";
  const newParagraph = document.createElement("h2");
  newParagraph.textContent = stepText;
  stepDisplay.insertBefore(newParagraph, stepDisplay.firstChild);
}
