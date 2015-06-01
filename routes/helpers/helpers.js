var _ = require('underscore');
var models = require('../../models');
var helpers = {
    formatJSONByEmail: function (email) {
        if (!email.error) {
            var result = {email: email.email, tags: []};
            _.each(email.Tags, function (tag) {
                result.tags.push(tag.name)
            });
            return result;
        } else {
            return email;
        }
    },
    cacheEmailData: function(email, tags, client, multi){
        var redisClient = multi || client;
        if (tags.length > 0) {
            _.each(tags, function(tag){ //Caching values in Redis
                var tagName = tag.dataValues.name;
                redisClient.sadd(email.email, tagName);
                client.exists(tagName, function(err, tagExists){
                    if(!tagExists){
                        var whereConditions = {'Tags.name': tagName}
                        models.Email.findAll({
                            where: whereConditions,
                            include: [models.Tag]
                        }).then(function (emails) {
                            _.each(emails, function (email) {
                                client.sadd(tagName, email.email);
                            });
                        });
                    }
                    client.sadd(tagName, email.email);
                });
            });
            redisClient.srem("emptyset", email.email);
        } else {
            redisClient.sadd("emptyset", email.email);
        }

        if(multi) {
            redisClient.exec(function (err, replies) {
                console.log("updated "+ email.email +" in redis");
            });
        }
    },
    returnCachedData: function(data){
        return data;
    },
    cacheTagData: function(emails, tags, client) {

    }
};

module.exports = helpers;