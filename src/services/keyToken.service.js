"use strict";
const keytokenModel = require("../models/keytoken.model");
const keyTokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  //lv: 0
  // static createKeyToken = async ({ userId, publicKey }) => {
  //   try {
  //     const publicKeyString = publicKey.toString();
  //     const token = await keyTokenModel.create({
  //       user: userId,
  //       publicKey: publicKeyString,
  //     });
  //     return token ? token.publicKey : null;
  //   } catch (error) {
  //     return error;
  //   }
  // };

  //lv: xxx
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken },
        options = { upsert: true, new: true };
      const tokens = await keyTokenModel.findOneAndDelete(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {}
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: Types.ObjectId(userId) }).lean();
  };

  static removeKeyById = async(id)=>{
    return await keytokenModel.remove(id)
  }
}

module.exports = KeyTokenService;
