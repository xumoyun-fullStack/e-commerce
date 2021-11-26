const { WriteConcernError } = require("mongodb");
const categories = require("../models/CategoryModel");
const users = require("../models/UserModel");
const { v4 } = require("uuid");
const CategoryValidation = require("../validations/CategoryValidation");
const products = require("../models/ProductsModel");
const ProductPOSTValidation = require("../validations/ProductPOSTValidation");
const product_images = require("../models/ProductImagesModel");
const product_options = require("../models/ProductOptionModel");
const { default: slugify } = require("slugify");
const path = require("path");
const ProductOptionValidation = require("../validations/ProductOptionValidation");
const ProductsPatchValidation = require("../validations/ProductsPatchValidation");


module.exports = class AdminController{
    static async UsersGet(req, res){
        try{
            let costumers = await users.find();
            
            res.status(200).json({
                ok: true,
                users: costumers
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CreateAdminPatch(req, res){
        try{
            const {user_id} = req.params;

            let user = await users.findOneAndUpdate({
                user_id,
            },
            {
                role: "admin",
            })

            res.status(200).json({
                ok: true,
                message: "seccess",
                user
            })

        }catch(e){}
    }

    static async UserDelete(req, res){
        try{
            let user = await users.findOne({
                user_id: req.params.user_id
            })

            if(!user) throw new Error("user not found!");

            if(user.role === "superadmin") {
                    res.status(403).json({
                    ok:false,
                    message: "Permission denied"
                })
                return;
            }



            await users.deleteOne({
                user_id: req.params.user_id
            });

            res.status(200).json({
                ok: true,
                message: "deleted"
            })
        }catch(e){
            res.status(400).json({
                ok:false,
                message: e + ""
            })
        }
    }

    static async CategoryGet(req, res){
        try{

            let { c_page, p_page } = req.query;

            c_page = c_page || 1;
            p_page = p_page || 3;

            
            let categoryList = await categories.find().skip(p_page * (c_page - 1)).limit(p_page);

            res.status(200).json({
                ok: true,
                categories: categoryList,
            })


            

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CategoryPost(req, res){
        try{
            const {category_name} = await CategoryValidation(req.body);

            let category = await categories.findOne({       
                category_name
            });

            if(category) throw new Error("Category has already been added");
            category = await categories.create({
                category_id: v4(),
                category_name,
            });

            res.status(201).json({
                ok: true,
                message: "created",
                category: category
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CategoryPatch(req, res){
        try{
            const {category_name} = await CategoryValidation(req.body);

            let category = await categories.findOne({
                category_id: req.params.category_id
            });

            if(!category) throw new WriteConcernError("Category not found");

            category = await categories.findOneAndUpdate({
                category_id: req.params.category_id
            },{
                category_name,
            });

            res.status(201).json({
                ok: true,
                message: "updated"
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CategoryDel(req, res){
        try{
            let {category_id} = req.params;

            let productItems = await products.find({
                category_id
            });

            for(let product of productItems){
                const {product_id} = product;
                await products.deleteOne({
                    product_id,
                })
    
                await product_options.deleteMany({
                    product_id
                })
    
                await product_images.deleteMany({
                    product_id
                })
            }

            await categories.deleteOne({
                category_id,
            });

            res.status(200).json({
                ok: true,
                message: "Deleted"
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsGet(req, res){
        try{
            let  {c_page, p_page} = req.query;

            c_page = c_page || 1;
            p_page = p_page || 10;
     
            let product = await products.find().skip(p_page * (c_page - 1)).limit(p_page);


            res.status(200).json({
                ok: true,
                product: product,
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsPost(req, res){
        try{
            const {category_id} = req.params;
            const {product_name , price , description} = await ProductPOSTValidation(req.body); 


            let slug = slugify(product_name.toLowerCase());

            let product = await products.findOne({
                product_slug: slug,
                category_id
            });

            if(product){
                throw new Error(`Product slug ${slug} is already exsists`);
            }

            let category = await categories.findOne({
                category_id
            })

            if(!category) throw new Error("Category not found");

            product = await products.create({
                product_id: v4(),
                product_name,
                product_slug: slug,
                category_id,
                description,
                price
            });

            if(req.files.image.length){
                let images = req.files.image;
                for(let image of images){
                    let imageType = image.mimetype.split("/")[0];
                    if(imageType === "image" || imageType === " vector"){
                        let imageName = image.md5;
                        let imageFormat = image.mimetype.split("/")[1];
                        let imagePath = path.join(__dirname, "..", "public", "product_images", `${imageName}.${imageFormat}`);
                        await image.mv(imagePath);
                     
                        let productImage = await product_images.create({
                            image: `${imageName}.${imageFormat}`,
                            product_id: product._doc.product_id,
                            product_image_id: v4(),
                        });
                    }else{
                        throw new Error("Image type must be image or vector")
                    }
                }
            }

            res.status(201).json({
                ok: true,
                message: "Product added",
                product
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            });
        }
    }

    static async ProductOptionPost(req, res){
        try{
            const {product_id} = req.params;
            const {key , value} = await ProductOptionValidation(req.body);

            const product = await products.find({
                product_id,
            })

            if(!product) throw new Error("Product not found");

            let option = await product_options.findOne({
                product_id,
                key: key
            })

            if(option) throw new Error(`Option ${key} is already exists`);

            option = await product_options.create({
                product_id,
                key,
                value,
                product_option_id: v4()
            })

            res.status(201).json({
                ok: true,
                option
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsFilterGet(req, res){
        try{
            let {category_id, c_page, p_page} = req.query;

            c_page = c_page || 1;
            p_page = p_page || 10;
            
            let category = await categories.findOne({
                category_id
            })

            if(!category) throw new Error("Category not found");

            let productItems = await products.find({
                category_id,
            }).skip(p_page * (c_page - 1)).limit(p_page);

            res.status(200).json({
                ok: true,
                products: productItems
                
            })


            
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsDelete(req, res){
        try{
            const { product_id} = req.params;

            await products.deleteOne({
                product_id,
            })

            await product_options.deleteMany({
                product_id
            })

            await product_images.deleteMany({
                product_id
            })

            res.stauts(200).json({
                ok: true,
                message: "Deleted"
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsPatch(req, res){
        try{
            const { product_id } = req.params;
            const { product_name, category_id, description, price } = await ProductsPatchValidation(req.body);

            let product = await products.findOne({
                product_id
            })

            if(!product) throw new Error("Product not found");

            let slug = slugify(product_name.toLowerCase());

            let product_slug = await products.findOne({
                slug,
                category_id
            });

            if(product_slug && product_slug.product_id !== product.product_id) {
                throw new Error(`Product slug ${slug} is already existis`);
            }

            product = await products.findOneAndUpdate({product_id}, {
                price,
                description,
                category_id,
                product_name,
                product_slug: slug
            })

            res.status(200).json({
                ok: true,
                message: "Updated",
                product
            })

        }catch(e){
            res.status(400).json({
                ok:false,
                message: e + ""
            })
        }
    }

    static async ProductPatch(req, res){
        try{
            let { type, cond } = req.query;
            const { product_id } = req.params;

            if(type !== "rec" && type !== "best"){
                throw new Error("Type must be rec or best!");
            }

            if(cond != "false" && cond != "true"){
                throw new Error("cond must be 'true' or 'false'!");
            }

            if(type == "rec"){
                await products.findOneAndUpdate({
                    product_id,
                },{
                    is_rec: cond == "true" ? true : false
                });
            }else if(type == "best"){
                await products.findOneAndUpdate({
                    product_id,
                },{
                    is_best: cond == "true" ? true : false
                })
            }


            res.status(200).json({
                ok: true,
                message: "Updated"
            });


        }catch(e){
            res.status(400).json({
                ok: true,
                message: e + ""
            });
        }
    }

}