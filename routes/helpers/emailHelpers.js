var models = require('../../models');
var Q = require('q');
var _ = require('underscore');
var emailHelpers = {
    getOrCreateTags: function (tags, res) {
        var tagPromises = [];
        for (var i = 0; i < tags.length; i++) {
            tagPromises.push(this.createTagPromise(tags[i], res));
        }
        return tagPromises;
    },

    createTagPromise: function (tagName, res) {
        var that = this;
        var deferred = Q.defer();
        models.Tag
            .findOrCreate({
                where: {name: tagName}
            })
            .then(function (tag) {
                deferred.resolve(tag[0]);
            }).catch(function (reason) {
                that.handleException(reason, res);
            });
        return deferred.promise;
    },

    saveEmail: function (email, req, res) {
        var that = this;
        if (req.body.tags) {
            var tagPromises = this.getOrCreateTags(req.body.tags, res);
            Q.all(tagPromises)
                .done(function (tags) {
                    email.addTags(tags);
                    email.save()
                        .then(function (email) {
                            res.json(email);
                        });
                });
        } else {
            email.save()
                .then(function (email) {
                    res.json(email);
                });
        }
    },

    formatJSON: function (emails) {
        if (!emails.error) {
            return _.map(emails, function (email) {
                var result = {email: email.email, tags: []}
                _.each(email.Tags, function (tag) {
                    result.tags.push(tag.name)
                })
                return result;
            });
        } else {
            return emails;
        }
    },
    formatJSONByTags: function (emails) {
        if (!emails.error) {
            var result = {};
            _.each(emails, function (email) {
                _.each(email.Tags, function (tag) {
                    var tagName = tag.name;
                    result[tagName] = result[tagName] || [];
                    result[tagName].push(email.email);
                })

            });
            return result;
        } else {
            return emails;
        }
    },

    handleException: function (reason, res) {
        console.log(reason);
        var msg = "";
        switch (reason.name) {
            case "SequelizeUniqueConstraintError":
                msg = "email failed to save due to unique constraint on the following fields: " + reason.fields.join(", ");
                break;
            default:
                msg = "there was an error creating new email entry";
                break;
        }
        res.status(500);
        res.json({
            error: msg
        });
    },
    handleError: function (msg, res) {
        res.status(500);
        res.json({
            error: msg
        });
    }
}

module.exports = emailHelpers;