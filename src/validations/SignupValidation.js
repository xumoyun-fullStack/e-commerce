const joi = require("joi");

module.exports = function(data){
    return joi.object({
        full_name: joi.string().required(),
        email: joi.string().required(),
        username: joi.string().required().min(4).max(30),
        password: joi.string().required()
    }).validateAsync(data);
}