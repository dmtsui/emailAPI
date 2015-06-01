var models = require('../models');
var express = require('express');
var helpers = require('./helpers/tagHelpers');
var redis = require("redis"),
    client = redis.createClient();


var router = express.Router();
var routes = {
    tagsByEmail: function (req, res, next) {
        var whereConditions = {};
        var emailName = req.params.email;
        if (emailName) {
            client.smembers(emailName, function(err, tags){
                if(tags.length > 0) {
                    res.json(helpers.returnCachedData({
                        email: emailName,
                        tags: tags
                    }));
                } else {
                    client.sismember(["emptyset", emailName], function(err, emailExists){
                        if (emailExists) {
                            res.json({email:emailName, tags: []});
                        } else {
                            whereConditions['email'] = emailName;
                            models.Email.findOne({
                                where: whereConditions,
                                include: [models.Tag]
                            }).then(function (email) {
                                if(email){
                                    helpers.cacheEmailData(email , email.Tags, client);
                                    data = helpers.formatJSONByEmail(email);
                                    res.json(data);
                                }else {
                                    client.sadd("emptyset", emailName);
                                    res.json({email:emailName, tags: []});
                                }

                            });
                        }
                    })

                }
            });
        } else {
            res.json({email:emailName, tags: []});
        }
    }
}


router.get('/by/email/:email', routes.tagsByEmail);



if(process.env.NODE_ENV === 'test'){
    module.exports.routes = routes;
    module.exports.helpers = helpers;
    module.exports.client = client;
}else {
    module.exports = router;
}