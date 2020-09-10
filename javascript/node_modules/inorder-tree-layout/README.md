inorder-tree-layout
===================
Operations on nodes for balanced binary trees stored in in-order layout.  These are useful if you are building data structures, like binary search trees, implicitly (ie not storing pointers to subtrees).

## Install

    npm install inorder-tree-layout
    
## Example

Suppose we have a tree with 10 elements, packed in level order.  Then the inorder labelling of this tree looks like the following picture:

```
The tree:

          6
        /   \
       3     8
      / \   / \
     1   5 7   9
    / \  |
   0   2 4

```

Now given this tree, here is how we can compute some queries using this library:

```javascript
var layout = require("inorder-tree-layout")

console.log(layout.left(10, 3))     //Prints:  1

console.log(layout.parent(10, 7))   //Prints:  8

console.log(layout.height(10, 9))   //Prints:  0

```

## API

```javascript
var layout = require("inorder-tree-layout")
```

**Conventions:**

* `n` is always the size of the tree
* `x` is the index of a node in the tree

### `layout.root(n)`
Returns the index of the root of a tree of size n.

### `layout.begin(n)`
Returns the index of the first node of the tree

### `layout.end(n)`
Returns the index of the last node in the tree

### `layout.height(n, x)`
Returns the height of node `x` in a tree of size `n`

### `layout.prev(n, x)`
Returns the predecessor of `x` in an in-order traversal

### `layout.next(n, x)`
Returns the successor of `x` in an in-order traversal

### `layout.parent(n, x)`
Returns the parent of `x` in a tree of size `n`

### `layout.left(n, x)`
Returns the left child of `x`

### `layout.right(n, x)`
Returns the right child of `x`

### `layout.leaf(n, x)`
Returns true if `x` is a leaf node.

### `layout.lo(n, x)`
Returns the left most ancestor of `x` in the tree

### `layout.hi(n, x)`
Returns the right most ancestor of `x` in the tree

# Credits
(c) 2013 Mikola Lysenko. MIT License
