"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helper/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct))
router.get("/", asyncHandler(productController.getAllProducts))
router.get("/:product_id", asyncHandler(productController.getOneProduct))

router.use(authentication);

router.post("", asyncHandler(productController.createProduct));
router.patch("/update/:productId", asyncHandler(productController.updateProduct));
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProductByShop));

//query
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop))
router.get("/published/all", asyncHandler(productController.getAllPublishForShop))

module.exports = router;
