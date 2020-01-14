(() => {
  module.exports = decoration => {
    let accepted;
    accepted = ['line-through', 'none', 'overline', 'underline'];
    if (decoration === false) {
      accepted.unshift(false);
    }
    if (accepted.indexOf(decoration) < 0) {
      decoration = 'none';
    }
    return {
      accepted: accepted,
      value: decoration
    };
  };
}).call(this);
