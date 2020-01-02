// Finds the best regression model that fits the data using Bayesian Information Criteria
(function() {
  var numeric;

  numeric = require('numeric');

  module.exports = function(data, options) {
    var N,
      X,
      Xfulltr,
      Xtr,
      bestResult,
      beta_hat,
      bic,
      degree,
      degrees,
      i,
      j,
      k,
      l,
      loglike,
      m,
      point,
      prevBIC,
      q,
      ref,
      ref1,
      residual,
      sigma2,
      sse,
      y,
      y_hat;
    if (options == null) {
      options = {};
    }
    if (options.maxDegree == null) {
      options.maxDegree = 5;
    }
    N = data.length;
    prevBIC = Number.MAX_VALUE;
    bestResult = null;
    Xfulltr = (function() {
      var l, ref, results;
      results = [];
      for (
        degree = l = 1, ref = options.maxDegree + 1;
        1 <= ref ? l < ref : l > ref;
        degree = 1 <= ref ? ++l : --l
      ) {
        results.push(
          (function() {
            var len, m, results1;
            results1 = [];
            for (m = 0, len = data.length; m < len; m++) {
              point = data[m];
              results1.push(Math.pow(point[0], degree));
            }
            return results1;
          })()
        );
      }
      return results;
    })();
    y = (function() {
      var l, len, results;
      results = [];
      for (l = 0, len = data.length; l < len; l++) {
        point = data[l];
        results.push(point[1]);
      }
      return results;
    })();
    for (
      i = l = 0, ref = 1 << options.maxDegree;
      0 <= ref ? l < ref : l > ref;
      i = 0 <= ref ? ++l : --l
    ) {
      Xtr = [
        (function() {
          var m, ref1, results;
          results = [];
          for (
            q = m = 0, ref1 = N;
            0 <= ref1 ? m < ref1 : m > ref1;
            q = 0 <= ref1 ? ++m : --m
          ) {
            results.push(1);
          }
          return results;
        })()
      ];
      degrees = [0];
      for (
        j = m = 0, ref1 = options.maxDegree;
        0 <= ref1 ? m < ref1 : m > ref1;
        j = 0 <= ref1 ? ++m : --m
      ) {
        if ((i & (1 << j)) > 0) {
          Xtr.push(Xfulltr[j]);
          degrees.push(j + 1);
        }
      }
      X = numeric.transpose(Xtr);
      k = degrees.length;
      beta_hat = numeric.dot(
        numeric.dot(numeric.inv(numeric.dot(Xtr, X)), Xtr),
        y
      );
      y_hat = numeric.dot(X, beta_hat);
      residual = numeric.sub(y, y_hat);
      sse = numeric.dot(residual, residual);
      sigma2 = sse / (N - k);
      loglike =
        -0.5 * N * Math.log(2 * Math.PI) -
        0.5 * N * Math.log(sigma2) -
        sse / (2 * sigma2);
      bic = -2 * loglike + k * (Math.log(N) - Math.log(2 * Math.PI));
      if (bic < prevBIC) {
        prevBIC = bic;
        bestResult = [degrees, beta_hat, y_hat];
      }
    }
    return bestResult;
  };
}.call(this));
