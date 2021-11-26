const joi = require("joi");

module.exports = function(data){
    return joi.object({
        key: joi.string().required(),
        value: joi.string().required(),

    }).validateAsync(data);
}