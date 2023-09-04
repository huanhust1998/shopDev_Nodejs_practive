"use strict";

const crypto = require("crypto");
const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const createPublicPrivateKey = () => {
  const privateKey = crypto.randomBytes(64).toString("hex");
  const publicKey = crypto.randomBytes(64).toString("hex");
  return{ privateKey, publicKey};
};

module.exports = {
  getInfoData,
  createPublicPrivateKey
};
