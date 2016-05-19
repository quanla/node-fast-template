var DateUtil    = require("node-common/common-utils").DateUtil;
var Cols        = require("node-common/common-utils").Cols;

var filters = {
    date: function(obj, format) {
        if (obj == null) {
            return "";
        }
        if (typeof obj == "number") {
            obj = new Date(obj);
        }
        return DateUtil.format(obj, format)
    }
};

function toParamFunc(exp) {
    var expF = require("node-common/expression")(exp);
    return function(context) {
        return expF(context);
    };
}

function toFilter(filterExp) {
    var i1 = filterExp.indexOf(":");
    if (i1 == -1) {
        return filters[filterExp.trim()];
    }
    var filterFunc = filters[filterExp.substring(0, i1).trim()];

    var paramsString = filterExp.substring(i1 + 1);

    var paramFuncs = Cols.yield(paramsString.split(":"), toParamFunc);

    return function(value, context) {
        var params = Cols.yield(paramFuncs, function(pf) { return pf(context); });
        return filterFunc.apply(null, [value].concat(params));
    };
}

module.exports = function(exp) {

    var filterExps = exp.split("|");

    var filters = Cols.yield(filterExps, toFilter);

    return function(mainVal, context) {
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            mainVal = filter(mainVal, context);
        }
        return mainVal;
    };
};


//console.log(module.exports("date:'MM dd yyyy'")(new Date(), {}));