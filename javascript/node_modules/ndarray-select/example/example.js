"use strict"
var pack = require("ndarray-pack")
var ndselect = require("../select.js")

// Vectors
var points = pack([
  [0, 0, 1],
  [100, 0, 10],
  [50, 1, 10],
  [0, 2.5, -1],
  [-1, -1, -1]
])

//Find the median element in the list
var median = ndselect(points, points.shape[0]>>1)

console.log(median.get(0), median.get(1), median.get(2))

// Matrices
var points = pack([
  [[0, 0],[0, 1]],
  [[0, 1],[0, 0]],
  [[0, 0],[1, 0]],
  [[1, 0],[0, 0]],
  [[0, 1],[0, 1]]
])
/* Sorted:
  [[0, 0],[0, 1]]
  [[0, 1],[0, 0]]
  [[0, 1],[0, 1]]
  [[0, 0],[1, 0]]
  [[1, 0],[0, 0]]
*/
//Find the median element in the list
var median = ndselect(points, points.shape[0]>>1)

console.log(require("ndarray-unpack")(median))
