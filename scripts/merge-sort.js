const sideMargin = 20;
const topMargin = 20;
let timeout = 200;

/**
 * Deletes all div.array-container from DOM
 * @public
 */
function removeAll() {
  $("div.array-container").remove();
}

/**
 * Creates and appends a jquery container with the given array
 * @public
 * @param {array} arr - array to be displayed
 * @returns {Jquery Object}
 */
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

/**
 * Parses and converts a string to an array
 * @public
 * @param {string} str - string to be converted into an array
 */
function parse(str) {
  let replaced = str.replace(/\s/g, "");
  return JSON.parse(replaced);
}

let sorted = false;

$(document).ready(() => {
  // Sort button

  $("#sort").click(() => {
    if (sorted) {
      $("section.errors p").text("Already sorted!");
      return;
    }
    $("section.errors p").text("");
    let inputArray = document.getElementById("arrayValues").value.split(",");
    if (inputArray.length <= 1) {
      inputArray = [2, 8, 1, 6, 3, 7, 5, 9];
    }
    $container = displayArray(inputArray);
    let $array = getArrayValue();
    sort($array[0]);
    sorted = true;
  });

  // Unsort button

  $("#unsort").click(() => {
    if (!sorted) {
      $("section.errors p").text("Already unsorted!");
      return;
    }
    $("section.errors p").text("");
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

/**
 * @public
 * @returns {Jquery Object} A container with an array that can be animated
 */
function getArrayValue() {
  return $container;
}

/**
 * @public
 * @returns {Javascript Object} An object containing the value for the animation miliseconds
 */

$(document).ready(() => {
  // Side Menu

  $("#settings-btn").click(() => {
    $("#settings").css("transform", "translateX(400px)");
    $("header").animate({ opacity: 0.5 }, { duration: 400 });
    $("main").animate({ opacity: 0.5 }, { duration: 400 });
  });
  $("#close-menu").click(() => {
    $("#settings").css("transform", "translateX(0)");
    $("header").animate({ opacity: 1 }, { duration: 400 });
    $("main").animate({ opacity: 1 }, { duration: 400 });
  });

  // Save Settings Button

  $("#save-settings").click(() => {
    try {
      if ($("#arr").val() != "") {
        let arr = parse($("#arr").val());
        $container = displayArray(arr);
        sorted = false;
      }
      $("#settings-error").text("");
      if ($("#timeout").val() < 0) {
        $("p#success").text("");
        $("#settings-error").text("Timeout cannot be negative");
        return;
      }
      miliseconds.value =
        $("#timeout").val() !== "" ? $("#timeout").val() : miliseconds.value;

      $("p#success").text("Saved!");
    } catch (e) {
      $("p#success").text("");
      $("#settings-error").text(e);
    }
  });
});

/**
 * Creates a div.array-container that containes all indices given
 * @private
 * @param {link tag} arr - original div.array-container
 * @param {number} from - start index
 * @param {number} to - end index (not included)
 * @returns {link tag} div.array-container extracted from original
 */
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

/**
 * Animates the placement of a div.array-element over another one
 * @private
 * @param {link tag} element - div.array-element to be animated
 * @param {link tag} target - div.array-element that represents
 * final location for the first parameter
 */
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

/**
 * Merges two sorted halves and replaces target array with the result
 * @param {link tag} arr1 - div.array-container representing first half of target
 * @param {link tag} arr2 - div.array-container representing second half of target
 * @param {link tag} target - div.array-container to be replaced by merged halves
 */
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

/**
 * Executes and animates all the algorithm
 * @param {link tag} arr - div.array-container to be sorted and animated
 */
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
