const joi = require("joi");

module.exports = function(data){
    return joi.object({
        star: joi.number().required().min(1).max(5),
        text: joi.string().required().min(2)
    }).validateAsync(data);
}