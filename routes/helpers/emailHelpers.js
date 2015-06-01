var models = require('../../models');
var Q = require('q');
var _ = require('underscore');
var helpers = require('./helpers');
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

    saveEmail: function (email, req, res, client, multi) {
        var that = this;
        if (req.body.tags) {
            var tagPromises = this.getOrCreateTags(req.body.tags, res);
            Q.all(tagPromises)
                .done(function (tags) {
                    email.setTags(tags);
                    email.save()
                        .then(function (email) {
                            if (tags.length > 0) {
                            that.cacheEmailData(email, tags, client, multi);
                            }
                            models.Email.findById(email.dataValues.id, {include:models.Tag}).then(function(email){
                                res.json(email);
                            });

                        });
                });
        } else {
            email.save()
                .then(function (email) {
                    res.json(email);
                });
        }
    },
    updateEmail: function(email, req, res, client){
        multi = client.multi();
        var newTags = req.body.tags || [];
        var tags = [];
        _.each(email.Tags, function(tag){
            tags.push(tag.dataValues.name);
        });
        if(newTags){
            var tagsToRemove = _.difference(tags, newTags);
            if (tagsToRemove.length > 0) {
                _.each(tagsToRemove, function(tag){
                    multi.srem(email.email, tag);
                    multi.srem(tag, email.email);
                });
            }
        }
        if(req.body.email) {
            multi.del(email.email);
            _.each(tags, function(tag){
                multi.srem(tag, email.email);
            });
            email.email = req.body.email;
        }
        this.saveEmail(email, req, res, client, multi);
    },

    formatJSONByTags: function (emails, tags) {
        if (!emails.error) {
            var result = {
                tags: tags,
                emails: _.map(emails, function(email){
                    return email.email
                })};
            return result;
        } else {
            return emails;
        }
    },

    handleException: function (reason, res) {
        console.log(reason);
        var msg = "there was an error creating new email entry";

        switch (reason.name) {
            case "SequelizeUniqueConstraintError":
                try{
                    msg = reason.parent.message;
                } catch(e) {
                    console.log(e);
                }
                break;
            default:
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
_.extend(emailHelpers, helpers);

module.exports = emailHelpers;