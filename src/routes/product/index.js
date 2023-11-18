"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helper/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.use(authentication);
router.post("", asyncHandler(productController.createProduct));

//query
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop))

module.exports = router;
