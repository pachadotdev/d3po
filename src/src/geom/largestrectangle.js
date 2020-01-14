// Finds the maximum area rectangle that fits inside a polygon
(() => {
  var intersectPoints,
    lineIntersection,
    pointInPoly,
    pointInSegmentBox,
    polyInsidePoly,
    rayIntersectsSegment,
    rotatePoint,
    rotatePoly,
    segmentsIntersect,
    simplify,
    squaredDist;

  simplify = require('simplify-js');

  module.exports = (poly, options) => {
    var aRatio,
      aRatios,
      angle,
      angleRad,
      angleStep,
      angles,
      area,
      aspectRatioStep,
      aspectRatios,
      boxHeight,
      boxWidth,
      centroid,
      events,
      height,
      i,
      insidePoly,
      j,
      k,
      l,
      left,
      len,
      len1,
      len2,
      len3,
      m,
      maxArea,
      maxAspectRatio,
      maxHeight,
      maxRect,
      maxWidth,
      maxx,
      maxy,
      minAspectRatio,
      minSqDistH,
      minSqDistW,
      minx,
      miny,
      modifOrigins,
      origOrigin,
      origin,
      origins,
      p,
      p1H,
      p1W,
      p2H,
      p2W,
      rectPoly,
      ref,
      ref1,
      ref2,
      ref3,
      ref4,
      ref5,
      ref6,
      ref7,
      ref8,
      right,
      rndPoint,
      rndX,
      rndY,
      tempPoly,
      tolerance,
      width,
      widthStep,
      x0,
      y0;
    if (poly.length < 3) {
      return null;
    }
    events = [];
    aspectRatioStep = 0.5;
    angleStep = 5;
    if (options == null) {
      options = {};
    }
    if (options.maxAspectRatio == null) {
      options.maxAspectRatio = 15;
    }
    if (options.minWidth == null) {
      options.minWidth = 0;
    }
    if (options.minHeight == null) {
      options.minHeight = 0;
    }
    if (options.tolerance == null) {
      options.tolerance = 0.02;
    }
    if (options.nTries == null) {
      options.nTries = 20;
    }
    if (options.angle != null) {
      if (options.angle instanceof Array) {
        angles = options.angle;
      } else if (typeof options.angle === 'number') {
        angles = [options.angle];
      } else if (typeof options.angle === 'string' && !isNaN(options.angle)) {
        angles = [Number(options.angle)];
      }
    }
    if (angles == null) {
      angles = d3.range(-90, 90 + angleStep, angleStep);
    }
    if (options.aspectRatio != null) {
      if (options.aspectRatio instanceof Array) {
        aspectRatios = options.aspectRatio;
      } else if (typeof options.aspectRatio === 'number') {
        aspectRatios = [options.aspectRatio];
      } else if (
        typeof options.aspectRatio === 'string' &&
        !isNaN(options.aspectRatio)
      ) {
        aspectRatios = [Number(options.aspectRatio)];
      }
    }
    if (options.origin != null) {
      if (options.origin instanceof Array) {
        if (options.origin[0] instanceof Array) {
          origins = options.origin;
        } else {
          origins = [options.origin];
        }
      }
    }
    area = Math.abs(d3.geom.polygon(poly).area());
    if (area === 0) {
      return null;
    }
    (ref = d3.extent(poly, d => d[0])), (minx = ref[0]), (maxx = ref[1]);
    (ref1 = d3.extent(poly, d => d[1])), (miny = ref1[0]), (maxy = ref1[1]);
    tolerance = Math.min(maxx - minx, maxy - miny) * options.tolerance;
    tempPoly = (() => {
      var j, len, results;
      results = [];
      for (j = 0, len = poly.length; j < len; j++) {
        p = poly[j];
        results.push({
          x: p[0],
          y: p[1]
        });
      }
      return results;
    })();
    if (tolerance > 0) {
      tempPoly = simplify(tempPoly, tolerance);
      poly = (() => {
        var j, len, results;
        results = [];
        for (j = 0, len = tempPoly.length; j < len; j++) {
          p = tempPoly[j];
          results.push([p.x, p.y]);
        }
        return results;
      })();
    }
    if (options.vdebug) {
      events.push({
        type: 'simplify',
        poly: poly
      });
    }
    (ref2 = d3.extent(poly, d => d[0])), (minx = ref2[0]), (maxx = ref2[1]);
    (ref3 = d3.extent(poly, d => d[1])), (miny = ref3[0]), (maxy = ref3[1]);
    (ref4 = [maxx - minx, maxy - miny]),
      (boxWidth = ref4[0]),
      (boxHeight = ref4[1]);
    widthStep = Math.min(boxWidth, boxHeight) / 50;
    if (origins == null) {
      origins = [];
      centroid = d3.geom.polygon(poly).centroid();
      if (pointInPoly(centroid, poly)) {
        origins.push(centroid);
      }
      while (origins.length < options.nTries) {
        rndX = Math.random() * boxWidth + minx;
        rndY = Math.random() * boxHeight + miny;
        rndPoint = [rndX, rndY];
        if (pointInPoly(rndPoint, poly)) {
          origins.push(rndPoint);
        }
      }
    }
    if (options.vdebug) {
      events.push({
        type: 'origins',
        points: origins
      });
    }
    maxArea = 0;
    maxRect = null;
    for (j = 0, len = angles.length; j < len; j++) {
      angle = angles[j];
      angleRad = (-angle * Math.PI) / 180;
      if (options.vdebug) {
        events.push({
          type: 'angle',
          angle: angle
        });
      }
      for (i = k = 0, len1 = origins.length; k < len1; i = ++k) {
        origOrigin = origins[i];
        (ref5 = intersectPoints(poly, origOrigin, angleRad)),
          (p1W = ref5[0]),
          (p2W = ref5[1]);
        (ref6 = intersectPoints(poly, origOrigin, angleRad + Math.PI / 2)),
          (p1H = ref6[0]),
          (p2H = ref6[1]);
        modifOrigins = [];
        if (p1W != null && p2W != null) {
          modifOrigins.push([(p1W[0] + p2W[0]) / 2, (p1W[1] + p2W[1]) / 2]);
        }
        if (p1H != null && p2H != null) {
          modifOrigins.push([(p1H[0] + p2H[0]) / 2, (p1H[1] + p2H[1]) / 2]);
        }
        if (options.vdebug) {
          events.push({
            type: 'modifOrigin',
            idx: i,
            p1W: p1W,
            p2W: p2W,
            p1H: p1H,
            p2H: p2H,
            modifOrigins: modifOrigins
          });
        }
        for (l = 0, len2 = modifOrigins.length; l < len2; l++) {
          origin = modifOrigins[l];
          if (options.vdebug) {
            events.push({
              type: 'origin',
              cx: origin[0],
              cy: origin[1]
            });
          }
          (ref7 = intersectPoints(poly, origin, angleRad)),
            (p1W = ref7[0]),
            (p2W = ref7[1]);
          if (p1W === null || p2W === null) {
            continue;
          }
          minSqDistW = Math.min(
            squaredDist(origin, p1W),
            squaredDist(origin, p2W)
          );
          maxWidth = 2 * Math.sqrt(minSqDistW);
          (ref8 = intersectPoints(poly, origin, angleRad + Math.PI / 2)),
            (p1H = ref8[0]),
            (p2H = ref8[1]);
          if (p1H === null || p2H === null) {
            continue;
          }
          minSqDistH = Math.min(
            squaredDist(origin, p1H),
            squaredDist(origin, p2H)
          );
          maxHeight = 2 * Math.sqrt(minSqDistH);
          if (maxWidth * maxHeight < maxArea) {
            continue;
          }
          if (aspectRatios != null) {
            aRatios = aspectRatios;
          } else {
            minAspectRatio = Math.max(
              1,
              options.minWidth / maxHeight,
              maxArea / (maxHeight * maxHeight)
            );
            maxAspectRatio = Math.min(
              options.maxAspectRatio,
              maxWidth / options.minHeight,
              (maxWidth * maxWidth) / maxArea
            );
            aRatios = d3.range(
              minAspectRatio,
              maxAspectRatio + aspectRatioStep,
              aspectRatioStep
            );
          }
          for (m = 0, len3 = aRatios.length; m < len3; m++) {
            aRatio = aRatios[m];
            left = Math.max(options.minWidth, Math.sqrt(maxArea * aRatio));
            right = Math.min(maxWidth, maxHeight * aRatio);
            if (right * maxHeight < maxArea) {
              continue;
            }
            if (right - left >= widthStep) {
              if (options.vdebug) {
                events.push({
                  type: 'aRatio',
                  aRatio: aRatio
                });
              }
            }
            while (right - left >= widthStep) {
              width = (left + right) / 2;
              height = width / aRatio;
              (x0 = origin[0]), (y0 = origin[1]);
              rectPoly = [
                [x0 - width / 2, y0 - height / 2],
                [x0 + width / 2, y0 - height / 2],
                [x0 + width / 2, y0 + height / 2],
                [x0 - width / 2, y0 + height / 2]
              ];
              rectPoly = rotatePoly(rectPoly, angleRad, origin);
              if (polyInsidePoly(rectPoly, poly)) {
                insidePoly = true;
                maxArea = width * height;
                maxRect = {
                  cx: x0,
                  cy: y0,
                  width: width,
                  height: height,
                  angle: angle
                };
                left = width;
              } else {
                insidePoly = false;
                right = width;
              }
              if (options.vdebug) {
                events.push({
                  type: 'rectangle',
                  cx: x0,
                  cy: y0,
                  width: width,
                  height: height,
                  areaFraction: (width * height) / area,
                  angle: angle,
                  insidePoly: insidePoly
                });
              }
            }
          }
        }
      }
    }
    return [maxRect, maxArea, events];
  };

  squaredDist = (a, b) => {
    var deltax, deltay;
    deltax = b[0] - a[0];
    deltay = b[1] - a[1];
    return deltax * deltax + deltay * deltay;
  };

  rayIntersectsSegment = (p, p1, p2) => {
    var a, b, mAB, mAP, ref;
    (ref = p1[1] < p2[1] ? [p1, p2] : [p2, p1]), (a = ref[0]), (b = ref[1]);
    if (p[1] === b[1] || p[1] === a[1]) {
      p[1] += Number.MIN_VALUE;
    }
    if (p[1] > b[1] || p[1] < a[1]) {
      return false;
    } else if (p[0] > a[0] && p[0] > b[0]) {
      return false;
    } else if (p[0] < a[0] && p[0] < b[0]) {
      return true;
    } else {
      mAB = (b[1] - a[1]) / (b[0] - a[0]);
      mAP = (p[1] - a[1]) / (p[0] - a[0]);
      return mAP > mAB;
    }
  };

  pointInPoly = (p, poly) => {
    var a, b, c, i, n;
    i = -1;
    n = poly.length;
    b = poly[n - 1];
    c = 0;
    while (++i < n) {
      a = b;
      b = poly[i];
      if (rayIntersectsSegment(p, a, b)) {
        c++;
      }
    }
    return c % 2 !== 0;
  };

  pointInSegmentBox = (p, p1, q1) => {
    var eps, px, py;
    eps = 1e-9;
    (px = p[0]), (py = p[1]);
    if (
      px < Math.min(p1[0], q1[0]) - eps ||
      px > Math.max(p1[0], q1[0]) + eps ||
      py < Math.min(p1[1], q1[1]) - eps ||
      py > Math.max(p1[1], q1[1]) + eps
    ) {
      return false;
    }
    return true;
  };

  lineIntersection = (p1, q1, p2, q2) => {
    var cross1, cross2, denom, dx1, dx2, dy1, dy2, eps, px, py;
    eps = 1e-9;
    dx1 = p1[0] - q1[0];
    dy1 = p1[1] - q1[1];
    dx2 = p2[0] - q2[0];
    dy2 = p2[1] - q2[1];
    denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < eps) {
      return null;
    }
    cross1 = p1[0] * q1[1] - p1[1] * q1[0];
    cross2 = p2[0] * q2[1] - p2[1] * q2[0];
    px = (cross1 * dx2 - cross2 * dx1) / denom;
    py = (cross1 * dy2 - cross2 * dy1) / denom;
    return [px, py];
  };

  segmentsIntersect = (p1, q1, p2, q2) => {
    var p;
    p = lineIntersection(p1, q1, p2, q2);
    if (p == null) {
      return false;
    }
    return pointInSegmentBox(p, p1, q1) && pointInSegmentBox(p, p2, q2);
  };

  polyInsidePoly = (polyA, polyB) => {
    var aA, aB, bA, bB, iA, iB, nA, nB;
    iA = -1;
    nA = polyA.length;
    nB = polyB.length;
    bA = polyA[nA - 1];
    while (++iA < nA) {
      aA = bA;
      bA = polyA[iA];
      iB = -1;
      bB = polyB[nB - 1];
      while (++iB < nB) {
        aB = bB;
        bB = polyB[iB];
        if (segmentsIntersect(aA, bA, aB, bB)) {
          return false;
        }
      }
    }
    return pointInPoly(polyA[0], polyB);
  };

  rotatePoint = (p, alpha, origin) => {
    var cosAlpha, sinAlpha, xshifted, yshifted;
    if (origin == null) {
      origin = [0, 0];
    }
    xshifted = p[0] - origin[0];
    yshifted = p[1] - origin[1];
    cosAlpha = Math.cos(alpha);
    sinAlpha = Math.sin(alpha);
    return [
      cosAlpha * xshifted - sinAlpha * yshifted + origin[0],
      sinAlpha * xshifted + cosAlpha * yshifted + origin[1]
    ];
  };

  rotatePoly = (poly, alpha, origin) => {
    var j, len, point, results;
    results = [];
    for (j = 0, len = poly.length; j < len; j++) {
      point = poly[j];
      results.push(rotatePoint(point, alpha, origin));
    }
    return results;
  };

  intersectPoints = (poly, origin, alpha) => {
    var a,
      b,
      closestPointLeft,
      closestPointRight,
      eps,
      i,
      idx,
      minSqDistLeft,
      minSqDistRight,
      n,
      p,
      shiftedOrigin,
      sqDist,
      x0,
      y0;
    eps = 1e-9;
    origin = [
      origin[0] + eps * Math.cos(alpha),
      origin[1] + eps * Math.sin(alpha)
    ];
    (x0 = origin[0]), (y0 = origin[1]);
    shiftedOrigin = [x0 + Math.cos(alpha), y0 + Math.sin(alpha)];
    idx = 0;
    if (Math.abs(shiftedOrigin[0] - x0) < eps) {
      idx = 1;
    }
    i = -1;
    n = poly.length;
    b = poly[n - 1];
    minSqDistLeft = Number.MAX_VALUE;
    minSqDistRight = Number.MAX_VALUE;
    closestPointLeft = null;
    closestPointRight = null;
    while (++i < n) {
      a = b;
      b = poly[i];
      p = lineIntersection(origin, shiftedOrigin, a, b);
      if (p != null && pointInSegmentBox(p, a, b)) {
        sqDist = squaredDist(origin, p);
        if (p[idx] < origin[idx]) {
          if (sqDist < minSqDistLeft) {
            minSqDistLeft = sqDist;
            closestPointLeft = p;
          }
        } else if (p[idx] > origin[idx]) {
          if (sqDist < minSqDistRight) {
            minSqDistRight = sqDist;
            closestPointRight = p;
          }
        }
      }
    }
    return [closestPointLeft, closestPointRight];
  };
}).call(this);
