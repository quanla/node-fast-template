function findVsAnti(target, anti, index, content) {
    function count(target, content) {
        var ret = 0;
        var index = 0;

        for (;;) {
            var i = content.indexOf(target, index);
            if (i == -1) {
                return ret;
            }
            ret ++;
            index = i + target.length;
        }
    }

    var track = 0;
    for (;;) {
        var i = content.indexOf(target, index);

        if (i == -1) {
            return -1;
        }

        track--;

        var checking = content.substring(index, i);
        track += count(anti, checking);

        if (track < 0) {
            return i;
        }
        index = i + target.length;
    }
}


module.exports = function findCloseTag(exp, from, content) {
    var nameEnd = exp.indexOf(" ", 1);
    var name = exp.substring(1, nameEnd);
    var closeTagContent = "{{/" + name + "}}";

    var antiFind = "{{*" + name;

    var i = findVsAnti(closeTagContent, antiFind, from, content);

    return {
        from: i,
        to: i + closeTagContent.length
    };
};