const { UsersGet, CreateAdminPatch, UserDelete, CategoryGet, CategoryPost, CategoryPatch, CategoryDel, ProductsGet, ProductsPost, ProductOptionPost, ProductsFilterGet, ProductsDelete, ProductsPatch, ProductPatch } = require("../controllers/AdminController");
const { OrderPatch } = require("../controllers/ProductsController");
const AdminMiddleware = require("../middlewares/AdminMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

const router = require("express").Router();
/*
    get users list
    delete user

    get categories
    get products

    add and delete and update category
    add and delete and update product
*/

router.get("/users",AdminMiddleware, UsersGet);
router.patch("/users/make-admin/:user_id", AdminMiddleware, CreateAdminPatch);
router.delete("/users/delete/:user_id", AdminMiddleware, UserDelete);

router.get("/categories", AdminMiddleware, CategoryGet);
router.post("/categories/create", AdminMiddleware, CategoryPost);
router.patch("/categories/update/:category_id", AdminMiddleware, CategoryPatch);
router.delete("/categories/delete/:category_id", AdminMiddleware, CategoryDel);

router.get("/products", AdminMiddleware, ProductsGet);
router.post("/products/create/:category_id", AdminMiddleware, ProductsPost);
router.post("/products/option/create/:product_id", AdminMiddleware,ProductOptionPost);
router.get("/products/filter", AdminMiddleware, ProductsFilterGet);
router.delete("/products/delete/:product_id", AdminMiddleware, ProductsDelete);
router.patch("/products/update/:product_id", AdminMiddleware, ProductsPatch);
router.patch("/products/type/:product_id", AdminMiddleware, ProductPatch);

router.patch("/order/:order_id", AdminMiddleware, OrderPatch)

module.exports = {
    path: "/admin",
    router
}