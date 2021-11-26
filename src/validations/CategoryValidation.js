const joi = require("joi");

module.exports = function(data){
    return joi.object({
        category_name: joi.string().required(),
    }).validateAsync(data);
}