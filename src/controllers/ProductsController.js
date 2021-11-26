const carts = require("../models/CartModel");
const categories = require("../models/CategoryModel");
const products = require("../models/ProductsModel");
const { v4 } = require("uuid");
const product_options = require("../models/ProductOptionModel");
const product_images = require("../models/ProductImagesModel");
const comments = require("../models/CommentModel");
const { checkJWTToken } = require("../modules/jwt");
const CommentPOSTValidation = require("../validations/CommentPOSTValidation");
const path = require("path");
const comment_images = require("../models/CommentImageModel");
const comment_likes = require("../models/CommentLikeModel");
const comment_dislikes = require("../models/CommentDislikeModels");
const orders = require("../models/OrderModel");
const order_items = require("../models/OrderItemModel");
const OrderValidation = require("../validations/OrderValidation");

module.exports = class ProductsController{
    static async ProductsGet(req, res){
        try{
            const { category_id } = req.params;
            let { c_page, p_page } = req.query;

            c_page = c_page || 1;
            p_page = p_page || 24;
            
            let category = await categories.findOne({
                category_id,
            })


            if(!category_id) throw new Error("C ategory not found");

            let productItems = await products.find({
                category_id
            }).limit(p_page).skip(p_page * (c_page - 1));


            let recProducts = await products.find({
                is_rec: true
            });
    
            let bestSellers = await products.find({
                is_best: true
            });
    
    
            let randomRec = [];
            
            while(randomRec.length < 13 && recProducts.length > 0){
                let randomNumber = Math.floor(Math.random() * (recProducts.length ));
                let product = recProducts.pop(randomNumber);
                randomRec.push(product);
            }
    
            let randomBest = [];
            
            while(randomBest.length < 13 && bestSellers.length > 0){
                let randomNumber = Math.floor(Math.random() * (bestSellers.length));
                let product = bestSellers.pop(randomNumber);
                randomBest.push(product);
            }

            let categoryList = await categories.find();

            res.status(200).json({
                ok: true,
                products: productItems,
                recProducts: randomRec,
                bestProducts: randomBest,
                categories: categoryList,
            });



        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CartAddPost(req, res){
        try{
            const { product_id } = req.params;

            let product = await products.findOne({
                product_id
            })

            if(!product) throw new Error("Product not found");

            let cart = await carts.findOne({
                product_id,
                user_id: req.user.user_id,
            });

            if(cart) throw new Error("cart is already added");

            await carts.create({
                count: 1,
                product_id,
                user_id: req.user.user_id,
                cart_id: v4()
            });

            res.status(201).json({
                ok: true,
                message: "Added"
            });

        }catch(e){
            req.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CartPlusPatch(req, res){
        try{
            const { product_id } = req.params;

            let product = await products.findOne({
                product_id
            })

            if(!product) throw new Error("Product not found");

            let cart = await carts.findOne({
                product_id, 
                user_id: req.user.user_id
            })

            if(!cart) throw new Error("Card not found");

            await carts.findOneAndUpdate({
                cart_id: cart.cart_id
            },{
                count: cart.count + 1,
            });

            res.status(201).json({
                ok: true,
                message: "Plus 1"
            });

        }catch(e){
            req.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CartMinusPatch(req, res){
        try{
            const { product_id } = req.params;

            let product = await products.findOne({
                product_id
            })

            if(!product) throw new Error("Product not found");

            let cart = await carts.findOne({
                product_id, 
                user_id: req.user.user_id
            })

            if(!cart) throw new Error("Card not found");

            if(cart.count == 1){
                await carts.deleteOne({cart_id: cart.cart_id})
            }else{
                await carts.findOneAndUpdate({
                    cart_id: cart.cart_id
                },{
                    count: cart.count - 1,
                });
            }

            res.status(201).json({
                ok: true,
                message: "Plus 1"
            });

        }catch(e){
            req.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductsSearchGet(req, res){
        try{
            const{ q } = req.query;
            // let productItems = await products.aggregate([
            //     {
            //         $match: {
            //             product_name: {
            //                 $search: q,
            //             },
            //         },
            //     },
            // ]);

            let productItems = await products.aggregate().search({
                text: {
                    query: q,
                    path: "product_name",
                },
            })

            res.status(200).json({
                ok: true,
                products: productItems,
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CartGet(req, res){
        try{
            let cart = await carts.find({
                user_id: req.user.user_id,
            });

            res.status(200).json({
                ok: true,
                cart,
            })
        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async ProductGet(req, res){
        try{
            const { product_slug } = req.params;

            let product = await products.findOne({
                product_slug,
            });


            if(!product) throw new Error("Product not found");

            let productOption = await product_options.findOne({
                product_id: product.product_id,
            });

            let productImages = await product_images.find({
                product_id: product.product_id,
            });

            let comment = await comments.find({
                product_id: product.product_id,
            });

            for(let c of comment){
                let likes = await comment_likes.find({
                    comment_id: c.comment_id,
                });

                let dislikes = await comment_dislikes.find({
                    comment_id: c.comment_id,
                })
                
                if(likes){
                    c._doc.likes = likes.length;
                }

                if(dislikes){
                    c._doc.dislikes = dislikes.length;
                }
            };

            let token = req?.cookies?.token || req.headers["authorization"];

            token = checkJWTToken(token);


            if(token){
                req.user = token;
            }

            let cart ;

            if(req.user){
                cart = await carts.findOne({
                    user_id: req.user.user_id,
                    product_id: product.product_id,
                });
            }



            res.status(200).json({
                ok: true,
                product,
                cart,
                comment,
                productOption
            })


        } catch(e){
            res.status(400).json({
                ok: false,
                message: e + "",
            })
        }
    }

    static async CommentPost(req, res){
        try{
            const { product_id } = req.params;
            const { text, star } = await CommentPOSTValidation(req.body);

            let product = await products.findOne({
                product_id
            });

            if(!product) throw new Error("Product not found");

            let comment = await comments.create({
                comment_id: v4(),
                star,
                text,
                user_id: req.user.user_id,
                product_id
            });

            let files = req.files.image;

            if(files){
                for(let file of files){

                    let fileType = file.mimetype.split("/")[0]
                    let fileFormat = file.mimetype.split("/")[1];

                    if(fileType !== "image" && fileType !== "vector" ) throw new Error("File type is must be image or vector");

                    let fileName = `${file.md5}.${fileFormat}`;

                    let filePath = path.join(__dirname, "..","public", "comment_images", fileName);

                    await file.mv(filePath);

                    let commentImage = await comment_images.create({
                        comment_id: comment._doc.comment_id,
                        image: fileName,
                        comment_image_id: v4(),
                    });
                }
            }

            let commentImages = await comment_images.find({
                comment_id: comment._doc.cooment_id,
            })
            res.status(201).json({
                ok: true,
                message: "Created",
                comment,
                commentImages
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CommentLikePost(req, res){
        try{
            const { comment_id } = req.params;

            let comment = await comments.findOne({
                comment_id
            })

            if(!comment) throw new Error("Comment not found");

            let like = await comment_likes.findOne({
                comment_id: comment.comment_id,
                user_id: req.user.user_id,
            });

            if(like) {
                await comment_likes.deleteOne({
                    user_id: req.user.user_id,
                    comment_id: comment.comment_id,
                })
            }else{
                await comment_dislikes.deleteOne({
                    comment_id: comment.comment_id,
                    user_id: req.user.user_id,
                })
    
                like = await comment_likes.create({
                    user_id: req.user.user_id,
                    like_id: v4(),
                    comment_id: comment.comment_id
                });
            }

            res.status(201).json({
                ok: true,
                
            })

            

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CommentLikeDelete(req, res){
        try{
            const { comment_id } = req.params;

            let comment = await comments.findOne({
                comment_id
            })

            if(!comment) throw new Error("Comment not found");

            await comment_likes.deleteOne({
                comment_id: comment.comment_id,
                user_id: req.user.user_id,
            })


            res.status(201).json({
                ok: true,
                message: "like cancelled"
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CommentDislikePost(req, res){
        try{
            const { comment_id } = req.params;

            let comment = await comments.findOne({
                comment_id
            })

            if(!comment) throw new Error("Comment not found");

            let dislike = await comment_likes.findOne({
                comment_id: comment.comment_id,
                user_id: req.user.user_id,
            });

            if(dislike) {
                await comment_dislikes.deleteOne({
                    comment_id: comment.comment_id,
                    user_id: req.user.user_id
                })
            }else{
                await comment_likes.deleteOne({
                    comment_id: comment.comment_id,
                    user_id: req.user.user_id,
                })
    
                dislike = await comment_dislikes.create({
                    dislike_id: v4(),
                    user_id: req.user.user_id,
                    comment_id: comment.comment_id,
                })
            }


            res.status(201).json({
                ok: true,
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }

    static async CommentDislikeDelete(req, res){
        try{
            const { comment_id } = req.params;

            let comment = await comments.findOne({
                comment_id
            })

            if(!comment) throw new Error("Comment not found");

            await comment_dislikes.deleteOne({
                comment_id: comment.comment_id,
                user_id: req.user.user_id,
            })


            res.status(201).json({
                ok: true,
                message: "dislike cancelled"
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
        }
    }
    
    static async OrderPost(req, res){
        try{

            const { full_name, shipping_region, shipping_address, comment, phone } = await OrderValidation(req.body);

            let cart = await carts.find({
                user_id: req.user.user_id,
            });


            if(!cart) throw new Error("Cart is empty");

            let order = await orders.create({
                order_id: v4(),
                user_id: req.user.user_id,
                time: new Date(),
                full_name,
                shipping_region,
                shipping_address,
                comment,
                phone,
            })

            for(let c of cart){
                let orderItem = await order_items.create({
                    count: c.count,
                    product_id: c.product_id,
                    order_item_id: v4(),
                    order_id: order._doc.order_id,
                    
                });
            };

            await carts.deleteMany({
                user_id: req.user.user_id,
            })

            let orderItems = await order_items.find({
                order_id: order._doc.order_id,
            })

            res.status(201).json({
                ok: true,
                order,
                orderItems,
            })

        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            })
            console.log(e);
        }
    }

    static async OrderPatch(req, res){
        try{
            const { order_id } = req.params;
            const { status } = req.body;

            if(!status) throw new Error("Status required");

            let order = await orders.findOne({
                order_id
            });

            if(!order) throw new Error("Order not found");

            await orders.findOneAndUpdate(
                {
                order_id,
                },
                {
                    status,
                }
            );

        res.status(200).json({
            ok: true,
            message: "Update to status " + status
        })

        }catch(e){
            res.status(201).json({
                ok: false,
                message: e + ""
            })
            concole.log(e)
        }
    }
   
}