var layout = require("../inorder")
  , layoutTester = require("tree-layout-tester")
  , bits = require("bit-twiddle")

require("tap").test("inorder-tree-layout", function(t) {

  var T = layoutTester.T
    , testTree = layoutTester.bind({}, t, layout)

  testTree(T(0))
  testTree(T(1, T(0)))
  testTree(T(1, T(0), T(2)))
  testTree(T(2, T(1, T(0)), T(3)))
  testTree(T(3, T(1, T(0), T(2)), T(4)))
  testTree(T(3, T(1, T(0), T(2)), T(5, T(4))))
  testTree(T(3, T(1, T(0), T(2)), T(5, T(4), T(6))))
  testTree(T(4, T(2, T(1, T(0)), T(3)), T(6, T(5), T(7))))
  testTree(T(5, T(3, T(1, T(0), T(2)), T(4)), T(7, T(6), T(8))))
  testTree(T(6, T(3, T(1, T(0), T(2)), T(5, T(4))), T(8, T(7), T(9))))
  testTree(T(7, T(3, T(1, T(0), T(2)), T(5, T(4), T(6))), T(11, T(9, T(8), T(10)), T(12))))

  var cases = [13, 50, 100, 1000]
  
  for(var j=0; j<cases.length; ++j) {
    N = cases[j]
    for(var i=0; i<N; ++i) {
      t.assert(layout.height(N, i) >= 0, "height: "+N+", " + i)
      
      t.assert(layout.lo(N, i) <= i, "lo: "+N+", " + i)
      t.assert(0 <= layout.lo(N, i), "lo: "+N+", " + i)
      t.assert(layout.lo(N, i) < N, "lo: "+N+", " + i)

      t.assert(layout.hi(N, i) >= i, "hi: "+N+", " + i)
      t.assert(0 <= layout.hi(N, i), "hi: "+N+", " + i)
      t.assert(layout.hi(N, i) < N, "hi: "+N+", " + i)
    }
  }
  
  t.end()
})