"use strict"

var bits = require("bit-twiddle")

function rootInorder(n) {
  var ptree = (bits.nextPow2(n+1)>>>1) - 1
  var f     = n - ptree
  if(bits.nextPow2(f)-1 >= ptree) {
    return ptree
  }
  return (ptree>>>1)+f
}
exports.root = rootInorder

function beginInorder(n) {
  return 0
}
exports.begin = beginInorder

function endInorder(n) {
  return n-1
}
exports.end = endInorder


//This is really horrible because n is not necessarily a power of 2
// If it was, we could just do:
//
//    height = bits.countTrailingZeros(~x)
//
// Instead, we just binary search because doing the right thing here is way too complicated.
function heightInorder(n, x) {
  if(n <= 0) {
    return 0
  }
  var r = rootInorder(n)
  if(x > r) {
    return heightInorder(n-r-1, x-r-1)
  } else if(x === r) {
    return bits.log2(n)
  }
  return heightInorder(r, x)
}
exports.height = heightInorder

function prevInorder(n, x) {
  return Math.max(x-1,0)
}
exports.prev = prevInorder

function nextInorder(n, x) {
  return Math.min(x+1,n-1)
}
exports.next = nextInorder


//The version for n = (1<<k)-1:
//
//  parent = (x & ~(1<<(h+1))) + (1<<h)
//
function parentInorder(n, x) {
  if(n <= 0) {
    return -1
  }
  var r = rootInorder(n)
  if(x > r) {
    var q = parentInorder(n-r-1, x-r-1)
    if(q < 0) {
      return r
    } else {
      return q + r + 1
    }
  } else if(x === r) {
    return -1
  }
  var q =  parentInorder(r, x)
  if(q < 0) {
    return r
  }
  return q
}
exports.parent = parentInorder


//Again, we get screwed because n is not a power of two -1.  If it was, we could do:
//
//    left = x - (1 << (h-1) )
//
// Where h is the height of the node
//
function leftInorder(n, x) {
  if(n <= 0) {
    return 0
  }
  var r = rootInorder(n)
  if(x > r) {
    return leftInorder(n-r-1, x-r-1) + r + 1
  } else if(x === r) {
    return rootInorder(x)
  }
  return leftInorder(r, x)

}
exports.left = leftInorder

//for power of two minus one:
//
//    right = x + (1<<(h-1))
//
function rightInorder(n, x) {
  if(n <= 0) {
    return 0
  }
  var r = rootInorder(n)
  if(x > r) {
    return rightInorder(n-r-1, x-r-1) + r + 1
  } else if(x === r) {
    return rootInorder(n-r-1) + r + 1
  }
  return rightInorder(r, x)
}
exports.right = rightInorder


function leafInorder(n, x) {
  return heightInorder(n, x) === 0
}
exports.leaf = leafInorder


function loInorder(n, x) {
  n |= 0
  x |= 0
  var l = 0
  while(n > 1) {
    var r = rootInorder(n)
    if(x > r) {
      l += r + 1
      n -= r + 1
      x -= r + 1
    } else if(x === r) {
      break
    } else {
      n = r
    }
  }
  return l
}
exports.lo = loInorder

function hiInorder(n, x) {
  n |= 0
  x |= 0
  var l = 0
  while(n > 1) {
    var r = rootInorder(n)
    if(x > r) {
      l += r + 1
      n -= r + 1
      x -= r + 1
    } else if(x === r) {
      l += n-1
      break
    } else {
      n = r
    }
  }
  return l
}
exports.hi = hiInorder
