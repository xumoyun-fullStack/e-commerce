const joi = require("joi");

module.exports = function(data){
    return joi.object({
        full_name: joi.string().required(),
        shipping_region: joi.string().required(),
        shipping_address: joi.string().required(),
        comment: joi.string(),
        phone: joi.number().required()

    }).validateAsync(data);
}