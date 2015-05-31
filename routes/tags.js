var models = require('../models');
var express = require('express');
var helpers = require('./helpers/tagHelpers');
var redis = require("redis"),
    client = redis.createClient();


var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    var whereConditions = {};
    var email = req.query.email;

    if (email) {
        whereConditions['Emails.email'] = email
    }
    models.Tag.findAll({
        where: whereConditions,
        include: [models.Email]
    }).then(function (tags) {
        res.json(helpers.formatJSON(tags, email));
    });
});

module.exports = router;