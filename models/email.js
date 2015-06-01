'use strict';
module.exports = function (sequelize, DataTypes) {
    var Email = sequelize.define('Email', {
        email: {type: DataTypes.STRING, unique: true}
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
                Email.belongsToMany(models.Tag, {"through": "EmailsTags"});
            }
        }
    });
    return Email;
};