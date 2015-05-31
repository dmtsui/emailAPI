var _ = require('underscore');
var tagHelpers = {
    formatJSON: function (tags, email) {
        var result = {email: email, tags: []};
        if (tags) {
            _.each(tags, function (tag) {
                result.tags.push(tag.name);
            });
        }
        return result;
    }
}

module.exports = tagHelpers;