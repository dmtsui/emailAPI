var models = require('../models');
var express = require('express');
var router = express.Router();
var helpers = require('./helpers/emailHelpers');
var Q = require('q');

/* GET home page. */
router.get('/', function (req, res, next) {
    var whereConditions = {};
    var queryByTags = false;
    if (req.query.tags) {
        whereConditions['Tags.name'] = req.query.tags
        queryByTags = true;
    }
    models.Email.findAll({
        where: whereConditions,
        include: [models.Tag]
    }).then(function (emails) {

        res.json(queryByTags ? helpers.formatJSONByTags(emails) : helpers.formatJSON(emails));
    });
});

router.post('/new', function (req, res, next) {
    if (req.body.email) {
        var email = models.Email
            .create({email: req.body.email})
            .then(function (email) {
                if (email) {
                    helpers.saveEmail(email, req, res);
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

router.get('/:id', function (req, res, next) {
    models.Email
        .find({
            where: {id: req.params.id},
            include: [models.Tag]
        })
        .then(function (email) {
            res.json(helpers.formatJSON([email]));
        })
});

router.put('/:id', function (req, res, next) {
    models.Email
        .findOne({
            where: {id: req.params.id}
        })
        .then(function (email) {
            if (!req.body.email && !re.body.tags) {
                req.json(helpers.formatJSON([email]));
                return;
            }

            if (req.body.email) {
                email.set('email', req.body.email);
            }
            helpers.saveEmail(email, req, res);
        }).catch(function (reason) {
            helpers.handleException(reason, res)
        });

});


module.exports = router;