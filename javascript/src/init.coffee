###*
# @class d3po
###
d3po         = {}

###*
# The current version of **d3po** you are using. Returns a string in
# [semantic versioning](http://semver.org/) format.
# @property d3po.version
# @for d3po
# @type String
# @static
###
d3po.version = "0.1.0"

###*
# The URL for the repo, used internally for certain error messages.
# @property d3po.repo
# @for d3po
# @type String
# @static
###
d3po.repo = "https://github.com/pachamaltese/d3po/"

###*
# Utilities related to modifying arrays.
# @class d3po.array
# @for d3po
# @static
###
d3po.array =
  comparator: require "./array/comparator.js"
  contains:   require "./array/contains.js"
  sort:       require "./array/sort.js"
  update:     require "./array/update.js"

###*
# Utilities related to the client's browser.
# @class d3po.client
# @for d3po
# @static
###
d3po.client =
  css:       require "./client/css.coffee"
  ie:        require "./client/ie.js"
  pointer:   require "./client/pointer.coffee"
  prefix:    require "./client/prefix.coffee"
  rtl:       require "./client/rtl.coffee"
  scroll:    require "./client/scroll.js"
  scrollbar: require "./client/scrollbar.coffee"
  touch:     require "./client/touch.coffee"

###*
# Utilities related to color manipulation.
# @class d3po.color
# @for d3po
# @static
###
d3po.color =
  legible:  require "./color/legible.coffee"
  lighter:  require "./color/lighter.coffee"
  mix:      require "./color/mix.coffee"
  random:   require "./color/random.coffee"
  scale:    require "./color/scale.coffee"
  sort:     require "./color/sort.js"
  text:     require "./color/text.coffee"
  validate: require "./color/validate.coffee"

###*
# Utilities related to manipulating data.
# @class d3po.data
# @for d3po
# @static
###
d3po.data =
  bestRegress: require "./data/bestRegress.coffee"
  lof:         require "./data/lof.coffee"
  mad:         require "./data/mad.coffee"

###*
# Utilities related to fonts.
# @class d3po.font
# @for d3po
# @static
###
d3po.font =
  sizes:    require "./font/sizes.coffee"
  validate: require "./font/validate.coffee"

###*
# d3po Forms
# @class d3po.form
# @for d3po
###
d3po.form = require "./form/form.js"

###*
# Utilities related to geometric algorithms.
# @class d3po.geom
# @for d3po
# @static
###
d3po.geom =
  largestRect: require "./geom/largestRect.coffee"
  offset:      require "./geom/offset.coffee"
  path2poly:   require "./geom/path2poly.coffee"

###*
# Utilities related to network graphs.
# @class d3po.network
# @for d3po
# @static
###
d3po.network =
  cluster:      require "./network/cluster.coffee"
  distance:     require "./network/distance.coffee"
  normalize:    require "./network/normalize.coffee"
  shortestPath: require "./network/shortestPath.coffee"
  smallestGap:  require "./network/smallestGap.coffee"
  subgraph:     require "./network/subgraph.coffee"

###*
# Utilities that process numbers.
# @class d3po.number
# @for d3po
# @static
###
d3po.number =
  format: require "./number/format.coffee"

###*
# d3po features a set of methods that relate to various object properties. These methods may be used outside of the normal constraints of the visualizations.
# @class d3po.object
# @for d3po
# @static
###
d3po.object =
  merge:    require "./object/merge.coffee"
  validate: require "./object/validate.coffee"

###*
# Utilities that process strings.
# @class d3po.string
# @for d3po
# @static
###
d3po.string =
  format: require "./string/format.js"
  list:   require "./string/list.coffee"
  strip:  require "./string/strip.js"
  title:  require "./string/title.coffee"

###*
# d3po SVG Textwrapping
# @class d3po.textwrap
# @for d3po
###
d3po.textwrap = require "./textwrap/textwrap.coffee"

###*
# d3po Tooltips
# @class d3po.tooltip
# @for d3po
###
d3po.tooltip =
  create: require "./tooltip/create.js"
  move:   require "./tooltip/move.coffee"
  remove: require "./tooltip/remove.coffee"

###*
# d3po features Utilities that can be used to help with some common javascript processes.
# @class d3po.util
# @for d3po
# @static
###
d3po.util =
  buckets:     require "./util/buckets.coffee"
  child:       require "./util/child.coffee"
  closest:     require "./util/closest.coffee"
  copy:        require "./util/copy.coffee"
  d3selection: require "./util/d3selection.coffee"
  dataurl:     require "./util/dataURL.coffee"
  uniques:     require "./util/uniques.coffee"

###*
# d3po Visualizations
# @class d3po.viz
# @for d3po
###
d3po.viz = require "./viz/viz.coffee"

# Flash a console message if they are loading the old, unneeded stylesheet!
stylesheet = require "./client/css.coffee"
message    = require "./core/console/print.coffee"

window.d3po  = d3po if typeof window isnt "undefined"
module.exports = d3po
