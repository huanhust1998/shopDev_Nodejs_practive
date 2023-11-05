"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helper/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//signUp
router.post("/shop/signUp", asyncHandler(accessController.signUp));

//login
router.post("/shop/login", asyncHandler(accessController.login));

// authentication: xác định xem user logout có phải là người của hệ thống không, hay là một hacker phá hoại
router.use(authentication);
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post("/shop/handleRefreshToken", asyncHandler(accessController.handleRefreshToken));

module.exports = router;
