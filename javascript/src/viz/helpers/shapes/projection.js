// Corresponds d3 3.x projection to d3 5.x
(function() {

    module.exports = function(projection) {
        var functions = {
            "albers": d3.geoAlbers,
            "albersUsa": d3.geoAlbersUsa,
            "azimuthalEqualArea": d3.geoAzimuthalEqualArea,
            "azimuthalEquidistant": d3.geoAzimuthalEquidistant,
            "conicConformal": d3.geoConicConformal,
            "conicEqualArea": d3.geoConicEqualArea,
            "conicEquidistant": d3.geoConicEquidistant,
            "equirectangular": d3.geoEquirectangular,
            "gnomonic": d3.geoGnomonic,
            "mercator": d3.geoMercator,
            "orthographic": d3.geoOrthographic,
            "stereographic": d3.geoStereographic,
            "transverseMercator": d3.geoTransverseMercator,
            "default": d3.geoMercator
        };
        if (typeof projection === "function") {
            return projection;
        } else {
            return functions[projection] || functions["default"];
        }
    };

}).call(this);