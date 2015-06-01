var models = require('../models');
var express = require('express');
var router = express.Router();
var helpers = require('./helpers/emailHelpers');
var Q = require('q');
var _ = require('underscore');
var redis = require("redis"),
    client = redis.createClient();

// Routes for API
router.get('/by/tags', function (req, res, next) {
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
                whereConditions['Tags.name'] = tags
                models.Email.findAll({
                    where: whereConditions,
                    include: [models.Tag]
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
});

//Basic CRUD routes used by admins to update and create new email entries
//in production these routes would be accessible by admins only

router.post('/new', function (req, res, next) {
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
});

router.get('/lookup/:email', function (req, res, next) {
    models.Email
        .find({
            where: {email: req.params.email},
            include: [models.Tag]
        })
        .then(function (email) {
            res.json(email ? email : {error: "no email matching " + req.params.id});
        })
});

router.put('/:id', function (req, res, next) {
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
});


module.exports = router;