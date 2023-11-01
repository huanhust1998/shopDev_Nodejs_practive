"use strict";

const {generateKeyPairSync} = require("node:crypto");
const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const createPublicPrivateKey = () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  return{ privateKey, publicKey};
};

module.exports = {
  getInfoData,
  createPublicPrivateKey
};
