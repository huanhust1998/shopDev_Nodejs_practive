"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const app = express();

// init middleware
app.use(morgan("dev")); // morgan có tác dụng in ra log của response trả về-- trạng thái(200, 20x, .... 500);
app.use(helmet()); // giúp cải thiện tính bảo mật của ứng dụng web
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
); // compression được sử dụng để nén dữ liệu trước khi gửi cho client, giúp giảm kịch thước của dữ liệu truyền tải qua mạng, giúp tăng tốc độ truyền tải và tiết kiệm băng thông

// init db
//require("./dbs/init.mongodb");
require("./dbs/init.mongodb.lv0");
//const {checkOverLoad} = require('./helper/check.connect');
//checkOverLoad();

// int routes
app.use("", require("./routes"));

// handling error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server error",
  });
});

module.exports = app;
