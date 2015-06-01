'use strict';
module.exports = function (sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        name: {type: DataTypes.STRING, unique: true}
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
                Tag.belongsToMany(models.Email, {"through": "EmailsTags"});
            }
        }
    });
    return Tag;
};