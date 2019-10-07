"use strict"

module.exports = ndSelect
module.exports.compile = lookupCache

//Macros
var ARRAY = "a"
var RANK = "K"
var CMP = "C"
var DATA = "d"
var OFFSET = "o"
var RND = "R"
var TMP = "T"
var LO = "L"
var HI = "H"
var PIVOT = "X"
function SHAPE(i) {
  return "s" + i
}
function STRIDE(i) {
  return "t" + i
}
function STEP(i) {
  return "u" + i
}
function STEP_CMP(i) {
  return "v" + i
}
function INDEX(i) {
  return "i" + i
}
function PICK(i) {
  return "p" + i
}
function PTR(i) {
  return "x" + i
}

//Create new order where index 0 is slowest index
function permuteOrder(order) {
  var norder = order.slice()
  norder.splice(order.indexOf(0), 1)
  norder.unshift(0)
  return norder
}

//Generate quick select procedure
function compileQuickSelect(order, useCompare, dtype) {
  order = permuteOrder(order)

  var dimension = order.length
  var useGetter = (dtype === "generic")
  var funcName = "ndSelect" + dtype + order.join("_") + "_" + (useCompare ? "cmp" : "lex")

  var code = []

  //Get arguments for code
  var args = [ARRAY, RANK]
  if(useCompare) {
    args.push(CMP)
  }

  //Unpack ndarray variables
  var vars = [
    DATA + "=" + ARRAY + ".data",
    OFFSET + "=" + ARRAY + ".offset|0",
    RND + "=Math.random",
    TMP]
  for(var i=0; i<2; ++i) {
    vars.push(PTR(i) + "=0")
  }
  for(var i=0; i<dimension; ++i) {
    vars.push(
      SHAPE(i) + "=" + ARRAY + ".shape[" + i + "]|0",
      STRIDE(i) + "=" + ARRAY + ".stride[" + i + "]|0",
      INDEX(i) + "=0")
  }
  for(var i=1; i<dimension; ++i) {
    if(i > 1) {
      vars.push(STEP_CMP(i) + "=(" + STRIDE(i) + "-" + SHAPE(i-1) + "*" + STRIDE(i-1) + ")|0",
                STEP(order[i]) + "=(" + STRIDE(order[i]) + "-" + SHAPE(order[i-1]) + "*" + STRIDE(order[i-1]) + ")|0")
    } else {
      vars.push(STEP_CMP(i) + "=" + STRIDE(i),
                STEP(order[i]) + "=" + STRIDE(order[i]))
    }
  }
  if(useCompare) {
    for(var i=0; i<2; ++i) {
      vars.push(PICK(i) + "=" + ARRAY + ".pick(0)")
    }
  }
  vars.push(
    PIVOT + "=0",
    LO + "=0",
    HI + "=" + SHAPE(order[0]) + "-1")

  function compare(out, i0, i1) {
    if(useCompare) {
      code.push(
        PICK(0), ".offset=", OFFSET, "+", STRIDE(order[0]), "*(", i0, ");",
        PICK(1), ".offset=", OFFSET, "+", STRIDE(order[0]), "*(", i1, ");",
        out, "=", CMP, "(", PICK(0), ",", PICK(1), ");")
    } else {
      code.push(
        PTR(0), "=", OFFSET, "+", STRIDE(0), "*(", i0, ");",
        PTR(1), "=", OFFSET, "+", STRIDE(0), "*(", i1, ");")
      if(dimension > 1) {
        code.push("_cmp:")
      }
      for(var i=dimension-1; i>0; --i) {
        code.push("for(", INDEX(i), "=0;", 
          INDEX(i), "<", SHAPE(i), ";",
          INDEX(i), "++){")
      }
      if(useGetter) {
        code.push(out, "=", DATA, ".get(", PTR(0), ")-", 
                            DATA, ".get(", PTR(1), ");")
      } else {
        code.push(out, "=", DATA, "[", PTR(0), "]-", 
                            DATA, "[", PTR(1), "];")
      }
      if(dimension > 1) {
        code.push("if(", out, ")break _cmp;")
      }
      for(var i=1; i<dimension; ++i) {
        code.push(
          PTR(0), "+=", STEP_CMP(i), ";",
          PTR(1), "+=", STEP_CMP(i),
          "}")
      }
    }
  }

  function swap(i0, i1) {
    code.push(
      PTR(0), "=", OFFSET, "+", STRIDE(order[0]), "*(", i0, ");",
      PTR(1), "=", OFFSET, "+", STRIDE(order[0]), "*(", i1, ");")
    for(var i=dimension-1; i>0; --i) {
      code.push("for(", INDEX(order[i]), "=0;", 
        INDEX(order[i]), "<", SHAPE(order[i]), ";",
        INDEX(order[i]), "++){")
    }
    if(useGetter) {
      code.push(TMP, "=", DATA, ".get(", PTR(0), ");", 
                DATA, ".set(", PTR(0), ",", DATA, ".get(", PTR(1), "));",
                DATA, ".set(", PTR(1), ",", TMP, ");")
    } else {
      code.push(TMP, "=", DATA, "[", PTR(0), "];", 
                DATA, "[", PTR(0), "]=", DATA, "[", PTR(1), "];",
                DATA, "[", PTR(1), "]=", TMP, ";")
    }
    for(var i=1; i<dimension; ++i) {
      code.push(
        PTR(0), "+=", STEP(order[i]), ";",
        PTR(1), "+=", STEP(order[i]),
        "}")
    }
  }

  code.push(
    "while(", LO, "<", HI, "){",
      PIVOT, "=(", RND, "()*(", HI, "-", LO, "+1)+", LO, ")|0;")

  //Partition array by pivot
  swap(PIVOT, HI) // Store pivot temporarily at the end of the array

  code.push(
    PIVOT, "=", LO, ";", // PIVOT will now be used to keep track of the end of the interval of elements less than the pivot
    "for(", INDEX(0), "=", LO, ";",
      INDEX(0), "<", HI, ";",
      INDEX(0), "++){") // Loop over other elements (unequal to the pivot), note that HI now points to the pivot
  compare(TMP, INDEX(0), HI) // Lexicographical compare of element with pivot
  code.push("if(", TMP, "<0){")
  swap(PIVOT, INDEX(0)) // Swap current element with element at index PIVOT if it is less than the pivot
  code.push(PIVOT, "++;")
  code.push("}}")
  swap(PIVOT, HI) // Store pivot right after all elements that are less than the pivot (implying that all elements >= the pivot are behind the pivot)

  //Check pivot bounds
  code.push(
    "if(", PIVOT, "===", RANK, "){",
      LO, "=", PIVOT, ";",
      "break;",
    "}else if(", RANK, "<", PIVOT, "){",
      HI, "=", PIVOT, "-1;",
    "}else{",
      LO, "=", PIVOT, "+1;",
    "}",
  "}")

  if(useCompare) {
    code.push(PICK(0), ".offset=", OFFSET, "+", LO, "*", STRIDE(0), ";",
      "return ", PICK(0), ";")
  } else {
    code.push("return ", ARRAY, ".pick(", LO, ");")
  }

  //Compile and link js together
  var procCode = [
    "'use strict';function ", funcName, "(", args, "){",
      "var ", vars.join(), ";",
      code.join(""),
    "};return ", funcName
  ].join("")

  var proc = new Function(procCode)
  return proc()
}

var CACHE = {}

function lookupCache(order, useCompare, dtype) {
  var typesig = order.join() + useCompare + dtype
  var proc = CACHE[typesig]
  if(proc) {
    return proc
  }
  return CACHE[typesig] = compileQuickSelect(order, useCompare, dtype)
}

function ndSelect(array, k, compare) {
  k |= 0
  if((array.dimension === 0) || 
    (array.shape[0] <= k) ||
    (k < 0)) {
    return null
  }
  var useCompare = !!compare
  var proc = lookupCache(array.order, useCompare, array.dtype)
  if(useCompare) {
    return proc(array, k, compare)
  } else {
    return proc(array, k)
  }
}