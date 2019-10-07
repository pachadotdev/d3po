(function() {
    var geomap;

    geomap = function(vars) {
        var coords, features, key, mute, solo, topo;
        coords = vars.coords.value;
        key = vars.coords.key || d3.keys(coords.objects)[0];
        topo = topojson.feature(coords, coords.objects[key]);
        features = topo.features;
        solo = vars.coords.solo.value;
        mute = vars.coords.mute.value;
        features = features.filter(function(f) {
            f[vars.id.value] = f.id;
            if (solo.length) {
                return solo.indexOf(f.id) >= 0;
            } else if (mute.length) {
                return mute.indexOf(f.id) < 0;
            } else {
                return true;
            }
        });
        return features;
    };

    geomap.libs = ["topojson"];

    geomap.nesting = false;

    geomap.requirements = ["coords"];

    geomap.scale = 1;

    geomap.shapes = ["coordinates"];

    geomap.zoom = true;

    module.exports = geomap;

}).call(this);