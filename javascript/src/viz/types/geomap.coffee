#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# Geo Map
#------------------------------------------------------------------------------
geomap = (vars) ->

  # topojson.presimplify vars.coords.value

  coords   = vars.coords.value
  key      = vars.coords.key or d3.keys(coords.objects)[0]
  topo     = topojson.feature coords, coords.objects[key]
  features = topo.features

  solo = vars.coords.solo.value
  mute = vars.coords.mute.value

  features = features.filter (f) ->
    f[vars.id.value] = f.id
    if solo.length
      solo.indexOf(f.id) >= 0
    else if mute.length
      mute.indexOf(f.id) < 0
    else
      true

  features


# Visualization Settings and Helper Functions
geomap.libs         = ["topojson"]
geomap.nesting      = false
geomap.requirements = ["coords"]
geomap.scale        = 1
geomap.shapes       = ["coordinates"]
geomap.zoom         = true

module.exports = geomap
