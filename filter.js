var filters = {
    date: function(obj, format) {
        if (typeof obj == "number") {
            obj = new Date(obj);
        }
        return DateUtil.format(obj, format)
    }
};

module.exports = function(exp) {
    return function(mainVal, context) {
        return filters["date"](mainVal, "dd MMM yyyy");
    };
};