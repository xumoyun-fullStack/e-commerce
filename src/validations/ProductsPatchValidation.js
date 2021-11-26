const joi = require("joi");

module.exports = function(data){
    return joi.object({
        product_name: joi.string().required(),
        price: joi.number().required(),
        description: joi.string().required().min(1),
        category_id: joi.string().required()
    }).validateAsync(data);
}