'use strict';
module.exports = function (sequelize, DataTypes) {
    var Email = sequelize.define('Email', {
        email: {type: DataTypes.STRING, unique: true}
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
                Email.hasMany(models.Tag);
            }
        }
    });
    return Email;
};