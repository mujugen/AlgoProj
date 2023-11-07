const sideMargin = 20;
const topMargin = 20;
let timeout = 200;

function removeAll() {
  $("div.array-container").remove();
}

function displayArray(arr) {
  removeAll();
  let $arrayContainer = $("<div></div>").addClass("array-container");
  for (i of arr) {
    let $value = $("<p></p>").text(i);
    let $element = $("<div></div>").addClass("array-element");
    $arrayContainer.append($element.append($value));
  }
  $("section.animation-zone").append($arrayContainer);

  function center() {
    $arrayContainer.css(
      "left",
      $("section.animation-zone").width() / 2 -
        $arrayContainer.width() / 2 +
        50 +
        "px"
    );
  }
  center();
  $(window).resize(center);

  return $arrayContainer;
}

$(document).ready(() => {
  $("#sort").click(() => {
    timeout = 400 - document.getElementById("timeoutSpeed").value;
    console.log(timeout);

    let inputArray = document.getElementById("arrayValues").value.split(",");
    if (inputArray.length <= 1) {
      inputArray = [2, 8, 1, 6, 3, 7, 5, 9];
    }
    $container = displayArray(inputArray);
    let $array = getArrayValue();
    sort($array[0]);
  });

  // Unsort button

  $("#unsort").click(() => {
    let sortedArray = $("div.array-container")[0];
    let unsortedArray = [];
    for (let i = sortedArray.childNodes.length - 1; i >= 0; i--)
      unsortedArray.push($(sortedArray.childNodes[i]).text());
    unsort(unsortedArray);
    sorted = false;
  });
});

let $container;
let miliseconds = { value: 500 };

function unsort(arr) {
  $container = displayArray(arr);
}

function getArrayValue() {
  return $container;
}

function createSubArray(arr, from, to) {
  let $container = $("<div></div>").addClass("array-container");
  for (let i = from; i < to; i++) {
    let $value = $("<p></p>").text($(arr.childNodes[i]).text());
    let $element = $("<div></div>").addClass("array-element");
    $container.append($element.append($value));
  }
  return $container[0];
}

/**
 * Animates a given half of a div.array-container
 * @private
 * @param {link tag} half - div.array-container
 * @param {string} dir - valid strings are '+' and '-', used for right of left
 */
function animateDivision(half, dir) {
  return new Promise((resolve) => {
    half.animate(
      {
        transform: [
          `translate(${dir}10px, ${-$(half).height() - topMargin}px)`,
          "translate(0, 0)",
        ],
      },
      timeout
    );
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
function animateMergeAlgorithmPlacement(element, target) {
  return new Promise((resolve) => {
    element.animate(
      {
        transform: [
          "translate(0, 0)",
          `translate(
                    ${$(target).offset().left - $(element).offset().left}px,
                    ${$(target).offset().top - $(element).offset().top}px
                )`,
        ],
      },
      timeout
    );

    setTimeout(() => {
      // Replace target value with element value
      $(target).html($(element).html());
      // Hide animated element
      $(element).css("opacity", "0");
      // Confirm ordered index
      $(target).css("border", "2px solid #73b369");
      $(target).css("background", "#73b369");
      resolve();
    }, timeout);
  });
}

async function merge(arr1, arr2, target) {
  let i1 = 0,
    i2 = 0,
    i3 = 0;
  while (i1 < arr1.childNodes.length && i2 < arr2.childNodes.length) {
    let value1 = parseInt($(arr1.childNodes[i1]).text());
    let value2 = parseInt($(arr2.childNodes[i2]).text());
    if (value1 < value2)
      await animateMergeAlgorithmPlacement(
        arr1.childNodes[i1++],
        target.childNodes[i3++]
      );
    else
      await animateMergeAlgorithmPlacement(
        arr2.childNodes[i2++],
        target.childNodes[i3++]
      );
  }
  while (i1 < arr1.childNodes.length)
    await animateMergeAlgorithmPlacement(
      arr1.childNodes[i1++],
      target.childNodes[i3++]
    );
  while (i2 < arr2.childNodes.length)
    await animateMergeAlgorithmPlacement(
      arr2.childNodes[i2++],
      target.childNodes[i3++]
    );
}

async function sort(arr) {
  // Base case
  if (arr.childNodes.length <= 1) return;

  // Divide array
  let middle = Math.floor(arr.childNodes.length / 2);
  let half1 = createSubArray(arr, 0, middle);
  let half2 = createSubArray(arr, middle, arr.childNodes.length);

  // Append and animate half 1
  $("section.animation-zone").append(half1);
  $(half1).css({
    left: `${$(arr).position().left - sideMargin}px`,
    top: `${$(arr).position().top + $(arr).height() + topMargin}px`,
  });
  await animateDivision(half1, "+", topMargin);

  // Append and animate half 2
  $("section.animation-zone").append(half2);
  $(half2).css({
    left: `${$(half1).position().left + $(half1).width() + sideMargin * 2}px`,
    top: `${$(half1).position().top}px`,
  });
  await animateDivision(half2, "-", topMargin);

  // sort resulting halves recursively
  await sort(half1);
  await sort(half2);

  // merge sorted halves
  await merge(half1, half2, arr);
}
