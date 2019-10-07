ndarray-select
==============
Finds the kth element in an ndarray in linear time with high probability.  This implementation is based on the [quick select algorithm](http://en.wikipedia.org/wiki/Quickselect) and mutates the array in place.

[![build status](https://secure.travis-ci.org/scijs/ndarray-select.png)](http://travis-ci.org/scijs/ndarray-select)

## Examples
### Single list
```javascript
var pack = require("ndarray-pack")
var ndselect = require("ndarray-select")

var points = pack([0, 0, 1, 2.5, -1])

//Find the median element in the list
var median = ndselect(points, points.shape[0]>>1)

console.log(median.get())
```

#### Output
```
0 2.5 -1
```

### Multiple lists
It is also possible to select vectors (using lexicographical comparisons):
```javascript
var pack = require("ndarray-pack")
var ndselect = require("ndarray-select")

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
```

#### Output
```
0 2.5 -1
```

## Install
Install using [npm](https://www.npmjs.com/):

    npm install ndarray-select

## API

```javascript
var ndselect = require("ndarray-select")
```

#### `ndselect(array, k[, compare])`
Selects the kth item from the ndarray `array` along the first axis of `array`.

* `array` is an [ndarray](https://github.com/mikolalysenko/ndarray)
* `k` is the rank of the item which is being selected
* `compare` is an optional comparison function that gets a pair of ndarrays as input.

**Returns** An ndarray view of `array.pick(k)`

**Note** This method modifies `array`. After completion, the element at position `k` will be in sorted order, with all elements `<array.pick(k)` occuring before `k` and all elements `>array.pick(k)` after `k` in the list.

#### `ndselect.compile(order, useCompare, dtype)`
Precompiles an optimized selection algorithm for an array with the given index order and datatype.

* `order` is the order of the ndarray
* `useCompare` is a flag which if set uses a comparison function
* `dtype` is the datatype of the array

**Returns** An optimized `ndselect` function

## License
(c) 2014 Mikola Lysenko. MIT License