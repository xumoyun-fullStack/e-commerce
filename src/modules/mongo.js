const mongoose = require("mongoose");
const { MONGO_URL } = require("../../config");

require("../models/CartModel");
require("../models/CategoryModel");
require("../models/CommentModel");
require("../models/OrderItemModel");
require("../models/OrderModel");
require("../models/ProductImagesModel");
require("../models/ProductOptionModel");
require("../models/ProductsModel");
require("../models/UserModel");


module.exports = async function mongo(){
    try{
        await mongoose.connect(MONGO_URL);

        console.log("DB Connected")
    }catch(e){
        console.log("DB Connection refused")
    }
}