// Populates item list based on filtered data
(function() {
    var active, copy, form, print;

    active = require('./active.js');

    copy = require('../../../../util/copy.js');

    form = require('../../../form.js');

    print = require('../../../../core/console/print.js');

    module.exports = function(vars) {
        var deepest, large, order;
        if (vars.open.value) {
            if (vars.dev.value) {
                print.time('updating list items');
            }
            if (!('items' in vars.container)) {
                vars.container.items = form()
                    .container(vars.container.list)
                    .type('button')
                    .ui({
                        border: 0,
                        display: 'block',
                        margin: 0
                    })
                    .width(false);
            }
            large = vars.draw.timing ? vars.data.large : 1;
            order = copy(vars.order);
            order.value = vars.search.term.length ? 'd3po_order' : vars.order.value;
            deepest = vars.depth.value === vars.id.nesting.length - 1;
            if (vars.focus.changed || vars.container.items.focus() === false) {
                vars.container.items.focus(vars.focus.value, function(value) {
                    var change, data, depth, solo;
                    data = vars.data.filtered.filter(function(f) {
                        return f[vars.id.value] === value;
                    })[0];
                    if (
                        vars.depth.value < vars.id.nesting.length - 1 &&
            vars.id.nesting[vars.depth.value + 1] in data
                    ) {
                        depth = vars.depth.value;
                        solo = vars.id.solo.value;
                        vars.history.states.push(function() {
                            return vars.self
                                .depth(depth)
                                .id({
                                    solo: solo
                                })
                                .draw();
                        });
                        vars.self
                            .depth(vars.depth.value + 1)
                            .id({
                                solo: [value]
                            })
                            .draw();
                    } else {
                        if (!vars.depth.changed) {
                            vars.self.open(false);
                        }
                        change = value !== vars.focus.value;
                        if (change && vars.active.value) {
                            change = active(vars, value);
                        }
                        if (change) {
                            vars.self.focus(value).draw();
                        }
                    }
                });
            }
            vars.container.items
                .active(vars.active.value)
                .data({
                    large: large,
                    sort: vars.data.sort.value,
                    value: vars.data.filtered
                })
                .draw({
                    update: vars.draw.update
                })
                .font(vars.font.secondary)
                .format(vars.format)
                .hover(vars.hover.value)
                .id(vars.id.value)
                .icon({
                    button: deepest ? false : vars.icon.next,
                    select: deepest ? vars.icon.select : false,
                    value: vars.icon.value
                })
                .order(order)
                .text(vars.text.secondary.value || vars.text.value)
                .timing({
                    ui: vars.draw.timing
                })
                .ui({
                    color: {
                        primary:
              vars.id.nesting.length === 1
                  ? vars.ui.color.primary.value
                  : vars.ui.color.secondary.value,
                        secondary: vars.ui.color.secondary.value
                    },
                    padding: vars.ui.padding.css
                })
                .draw();
            if (vars.dev.value) {
                print.timeEnd('updating list items');
            }
        }
    };
}.call(this));
