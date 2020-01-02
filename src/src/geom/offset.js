// Gives X and Y offset based off angle and shape
(function() {
    module.exports = function(radians, distance, shape) {
        var adjacentLegLength, coords, diagonal, oppositeLegLength;
        coords = {
            x: 0,
            y: 0
        };
        if (radians < 0) {
            radians = Math.PI * 2 + radians;
        }
        if (shape === 'square') {
            diagonal = 45 * (Math.PI / 180);
            if (radians <= Math.PI) {
                if (radians < Math.PI / 2) {
                    if (radians < diagonal) {
                        coords.x += distance;
                        oppositeLegLength = Math.tan(radians) * distance;
                        coords.y += oppositeLegLength;
                    } else {
                        coords.y += distance;
                        adjacentLegLength = distance / Math.tan(radians);
                        coords.x += adjacentLegLength;
                    }
                } else {
                    if (radians < Math.PI - diagonal) {
                        coords.y += distance;
                        adjacentLegLength = distance / Math.tan(Math.PI - radians);
                        coords.x -= adjacentLegLength;
                    } else {
                        coords.x -= distance;
                        oppositeLegLength = Math.tan(Math.PI - radians) * distance;
                        coords.y += oppositeLegLength;
                    }
                }
            } else {
                if (radians < (3 * Math.PI) / 2) {
                    if (radians < diagonal + Math.PI) {
                        coords.x -= distance;
                        oppositeLegLength = Math.tan(radians - Math.PI) * distance;
                        coords.y -= oppositeLegLength;
                    } else {
                        coords.y -= distance;
                        adjacentLegLength = distance / Math.tan(radians - Math.PI);
                        coords.x -= adjacentLegLength;
                    }
                } else {
                    if (radians < 2 * Math.PI - diagonal) {
                        coords.y -= distance;
                        adjacentLegLength = distance / Math.tan(2 * Math.PI - radians);
                        coords.x += adjacentLegLength;
                    } else {
                        coords.x += distance;
                        oppositeLegLength = Math.tan(2 * Math.PI - radians) * distance;
                        coords.y -= oppositeLegLength;
                    }
                }
            }
        } else {
            coords.x += distance * Math.cos(radians);
            coords.y += distance * Math.sin(radians);
        }
        return coords;
    };
}.call(this));
