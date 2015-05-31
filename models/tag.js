'use strict';
module.exports = function (sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        name: {type: DataTypes.STRING, unique: true}
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
                Tag.hasMany(models.Email);
            }
        }
    });
    return Tag;
};