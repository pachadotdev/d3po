/**
 * @class d3po
 */

(function() {
    var d3po, message, stylesheet;

    d3po = {};


    /**
     * The current version of **d3po** you are using. Returns a string in
     * [semantic versioning](http://semver.org/) format.
     * @property d3po.version
     * @for d3po
     * @type String
     * @static
     */

    d3po.version = "0.1.0";


    /**
     * The URL for the repo, used internally for certain error messages.
     * @property d3po.repo
     * @for d3po
     * @type String
     * @static
     */

    d3po.repo = "https://github.com/pachamaltese/d3po/";


    /**
     * Utilities related to modifying arrays.
     * @class d3po.array
     * @for d3po
     * @static
     */

    d3po.array = {
        comparator: require("./array/comparator.js"),
        contains: require("./array/contains.js"),
        sort: require("./array/sort.js"),
        update: require("./array/update.js")
    };


    /**
     * Utilities related to the client's browser.
     * @class d3po.client
     * @for d3po
     * @static
     */

    d3po.client = {
        css: require("./client/css.js"),
        ie: require("./client/ie.js"),
        pointer: require("./client/pointer.js"),
        prefix: require("./client/prefix.js"),
        rtl: require("./client/rtl.js"),
        scroll: require("./client/scroll.js"),
        scrollbar: require("./client/scrollbar.js"),
        touch: require("./client/touch.js")
    };


    /**
     * Utilities related to color manipulation.
     * @class d3po.color
     * @for d3po
     * @static
     */

    d3po.color = {
        legible: require("./color/legible.js"),
        lighter: require("./color/lighter.js"),
        mix: require("./color/mix.js"),
        random: require("./color/random.js"),
        scale: require("./color/scale.js"),
        sort: require("./color/sort.js"),
        text: require("./color/text.js"),
        validate: require("./color/validate.js")
    };


    /**
     * Utilities related to manipulating data.
     * @class d3po.data
     * @for d3po
     * @static
     */

    d3po.data = {
        bestRegress: require("./data/bestregression.js"),
        lof: require("./data/lof.js"),
        mad: require("./data/mad.js")
    };


    /**
     * Utilities related to fonts.
     * @class d3po.font
     * @for d3po
     * @static
     */

    d3po.font = {
        //sizes: require("./font/sizes.js"),
        //validate: require("./font/validate.js")
    };


    /**
     * d3po Forms
     * @class d3po.form
     * @for d3po
     */

    //d3po.form = require("./form/form.js");


    /**
     * Utilities related to geometric algorithms.
     * @class d3po.geom
     * @for d3po
     * @static
     */

    d3po.geom = {
        //largestRect: require("./geom/largestrectangle.js"),
        offset: require("./geom/offset.js"),
        path2poly: require("./geom/path2poly.js")
    };


    /**
     * Utilities related to network graphs.
     * @class d3po.network
     * @for d3po
     * @static
     */

    d3po.network = {
        cluster: require("./network/cluster.js"),
        distance: require("./network/distance.js"),
        normalize: require("./network/normalize.js"),
        shortestPath: require("./network/shortestpath.js"),
        //smallestGap: require("./network/smallestgap.js"),
        subgraph: require("./network/subgraph.js")
    };


    /**
     * Utilities that process numbers.
     * @class d3po.number
     * @for d3po
     * @static
     */

    d3po.number = {
        //format: require("./number/format.js")
    };


    /**
     * d3po features a set of methods that relate to various object properties. These methods may be used outside of the normal constraints of the visualizations.
     * @class d3po.object
     * @for d3po
     * @static
     */

    d3po.object = {
        //merge: require("./object/merge.js"),
        validate: require("./object/validate.js")
    };


    /**
     * Utilities that process strings.
     * @class d3po.string
     * @for d3po
     * @static
     */

    d3po.string = {
        format: require("./string/format.js"),
        list: require("./string/list.js"),
        strip: require("./string/strip.js"),
        title: require("./string/title.js")
    };


    /**
     * d3po SVG Textwrapping
     * @class d3po.textwrap
     * @for d3po
     */

    //d3po.textwrap = require("./textwrap/textwrap.js");


    /**
     * d3po Tooltips
     * @class d3po.tooltip
     * @for d3po
     */

    d3po.tooltip = {
        //create: require("./tooltip/create.js"),
        //move: require("./tooltip/move.js"),
        //remove: require("./tooltip/remove.js")
    };


    /**
     * d3po features Utilities that can be used to help with some common javascript processes.
     * @class d3po.util
     * @for d3po
     * @static
     */

    d3po.util = {
        //buckets: require("./util/buckets.js"),
        //child: require("./util/child.js"),
        closest: require("./util/closest.js"),
        //copy: require("./util/copy.js"),
        //d3selection: require("./util/d3selection.js"),
        dataurl: require("./util/dataurl.js"),
        uniques: require("./util/uniques.js")
    };


    /**
     * d3po Visualizations
     * @class d3po.viz
     * @for d3po
     */

    //d3po.viz = require("./viz/viz.js");

    stylesheet = require("./client/css.js");

    message = require("./core/console/print.js");

    if (typeof window !== "undefined") {
        window.d3po = d3po;
    }

    module.exports = d3po;

}).call(this);