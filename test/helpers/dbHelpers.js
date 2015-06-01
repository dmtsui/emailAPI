var models = require('../../models');
var client = require('../../routes/tags').client;
var sequelize_fixtures = require('sequelize-fixtures');


var helpers = {
    resetRedisDB: function(done){
        models.sequelize.sync({ force : true }) // drops table and re-creates it
            .then(function(){
                client.FLUSHDB(function(){
                    done(null);
                });
            });
    },
    populateDB: function(done) {
        var sModels = {
            Email: models.Email,
            Tag: models.Tag
        };

        sequelize_fixtures.loadFile('./test_data/test_data.json', sModels).then(function(){
            done(null);
        });
    }
}

module.exports = helpers;


