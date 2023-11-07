"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helper/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();



module.exports = router;
