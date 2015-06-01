var models = require('../models');
var express = require('express');
var router = express.Router();
var helpers = require('./helpers/emailHelpers');
var Q = require('q');
var _ = require('underscore');
var redis = require("redis"),
    client = redis.createClient();


var routes = {
    emailsByTags: function (req, res, next) {
        var whereConditions = {};
        var tags = req.query.tags;
        if (tags) {
            client.sunion(tags, function (err, emails) {
                if (emails.length > 0) {
                    res.json(helpers.returnCachedData({
                        tags: tags,
                        emails: emails
                    }));
                } else {
                    models.Email.findAll({
                        include: [
                            { model: models.Tag,
                                as: models.Tag.tableName,
                                where: {
                                    'name': tags
                                }
                            }
                        ]
                    }).then(function (emails) {
                        _.each(emails, function (email) {
                            helpers.cacheEmailData(email, email.Tags, client);
                        });
                        res.json(helpers.formatJSONByTags(emails, tags));
                    });
                }
            });

        } else {
            res.json({tags: [], email: []});
        }
    },
    emailNew: function (req, res, next) {
        if (req.body.email) {
            var email = models.Email
                .create({email: req.body.email})
                .then(function (email) {
                    if (email) {
                        helpers.saveEmail(email, req, res, client);
                    } else {
                        helpers.handleError("email already exists", res);
                    }
                }).catch(function (reason) {
                    helpers.handleException(reason, res)
                });

        } else {
            helpers.handleError("email was not provided", res);
        }
    },
    emailLookup: function (req, res, next) {
        models.Email
            .find({
                where: {email: req.params.email},
                include: [models.Tag]
            })
            .then(function (email) {
                res.json(email ? email : {error: "no email matching " + req.params.id});
            })
    },
    emailUpdate: function (req, res, next) {
        models.Email
            .findOne({
                where: {id: req.params.id},
                include: [models.Tag]
            })
            .then(function (email) {
                helpers.updateEmail(email, req, res, client);
            }).catch(function (reason) {
                helpers.handleException(reason, res)
            });
    }
}

router.get('/by/tags', routes.emailsByTags);
router.post('/new', routes.emailNew);
router.get('/lookup/:email', routes.emailLookup);
router.put('/:id', routes.emailUpdate);

if(process.env.NODE_ENV === 'test'){
    module.exports.routes = routes;
    module.exports.helpers = helpers;
    module.exports.client = client;
}else {
    module.exports = router;
}