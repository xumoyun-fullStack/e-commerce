const HomeController = require("../controllers/HomeController");
const { ProductsGet, CartAddPost, CartPlusPatch, CartMinusPatch, ProductsSearchGet, CartGet, ProductGet, CommentPost, CommentDislikePost, CommentLikeDelete, CommentDislikeDelete, CommentLikePost, OrderPost } = require("../controllers/ProductsController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const router = require("express").Router();



router.get("/", HomeController);
router.get("/products/search/", ProductsSearchGet)
router.get("/products/:category_id", ProductsGet);
router.get("/cart", AuthMiddleware, CartGet);
router.get("/product/:product_slug", ProductGet);

router.post("/products/cart/:product_id", AuthMiddleware, CartAddPost);
router.post("/product/comment/:product_id", AuthMiddleware, CommentPost);
router.patch("/products/cart/plus/:product_id", AuthMiddleware, CartPlusPatch);
router.patch("/products/cart/minus/:product_id", AuthMiddleware, CartMinusPatch);

router.post("/comment/like/:comment_id", AuthMiddleware, CommentLikePost);
router.post("/comment/dislike/:comment_id", AuthMiddleware, CommentDislikePost);
router.delete("/comment/like/:comment_id", AuthMiddleware, CommentLikeDelete);
router.delete("/comment/dislike/:comment_id", AuthMiddleware, CommentDislikeDelete);

router.post("/order", AuthMiddleware, OrderPost);


module.exports = {
    path: "/",
    router
}