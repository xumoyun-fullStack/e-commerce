const joi = require("joi");

module.exports = function(data){
    return joi.object({
        email: joi.string().required(),
        password: joi.string().required()
    }).validateAsync(data);
}