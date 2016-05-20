var Cols = require("node-common/common-utils").Cols;

function text(content) {
    return function() { return content; };
}
function filteredExpF(exp) {

    var filterIndex = exp.indexOf("|");
    if (filterIndex == -1) {
        var mainExp = expF(exp);
        return function(context) {
            return mainExp(context);
        };
    }

    var mainExp = expF(exp.substring(0, filterIndex));

    var filter = require("./filter")(exp.substring(filterIndex + 1));
    return function(context) {
        return filter(mainExp(context), context);
    };

}
function expF(exp) {
    return require("node-common/expression")(exp);
}

function templateRepeatF(exp, content) {
    var portions = toPortions(content);

    var m = /^\*repeat (.+?) in (.+)$/.exec(exp);
    var itemAs = m[1];
    var listExp = filteredExpF(m[2]);


    return function(context) {
        var list = listExp(context);

        var content = "";
        list.forEach(function(item, index) {
            var subContext = Object.create(context);
            subContext[itemAs] = item;
            subContext["$index"] = index;

            content += applyPortions(subContext, portions);
        });
        return content;
    };
}
function templateIfF(exp, content) {
    var portions = toPortions(content);

    var m = /^\*if (.+)$/.exec(exp);
    var ifExp = filteredExpF(m[1]);

    return function(context) {
        if (ifExp(context)) {
            return applyPortions(context, portions);
        } else {
            return "";
        }
    };
}
function templateF(exp, content) {

    var templateType = /^\*(\w+)/.exec(exp)[1];
    if (templateType == "repeat") {
        return templateRepeatF(exp, content);
    } else {
        return templateIfF(exp, content);
    }

}

function toPortions(template) {

    var portions = [];
    var index = 0;

    for (;;) {
        var i = template.indexOf("{{", index);
        if (i == -1) {
            break;
        }
        if (i > index) {
            portions.push(text(template.substring(index, i)));
        }

        var i2 = template.indexOf("}}", i);

        var exp = template.substring(i+2, i2).trim();
        if (exp[0] == "*") {
            var closeTag = require("./find-close-tag")(exp, i2+2, template);

            portions.push(templateF(exp, template.substring(i2+2, closeTag.from)));

            index = closeTag.to;
        } else {
            portions.push(filteredExpF(exp));

            index = i2+2;
        }
    }

    if (index < template.length) {
        portions.push(text(template.substring(index)))
    }
    return portions;
}

function applyPortions(context, portions) {
    return Cols.join(Cols.yield(portions, function(portion) { return portion(context); }), "");
}

module.exports = {
	compile: function(template) {
		var portions = toPortions(template);

		return {
			render: function(context) {
				return applyPortions(context, portions);
			}
		};
	}
};