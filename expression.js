module.exports = function expF(exp) {
    var decorated = RegexUtil.replaceAll(exp, "[$\\w.]+", function(m) {
        var v = m[0];
        if (isNaN(v)) {
            return "context." + v;
        } else {
            return v;
        }
    });
    var f = new Function("context", "return " + decorated + ";");
    return function(context) { return f.apply(null, [context]); };
};