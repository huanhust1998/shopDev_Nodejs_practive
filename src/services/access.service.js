"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData, createPublicPrivateKey } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITE: "WRITE",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   * checked this token used
   */
  static handleRefreshToken = async (refreshToken) => {
    console.log("handleRefreshToken: ", refreshToken)
    //check xem token này đã được sử dụng chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    //nếu có
    if (foundToken) {
      //decode xem này là thằng nào
      const { userId } = await verifyJWT(refreshToken, foundToken.privateKey);
      // xóa tất cả token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happen !! Plz re_login");
    }
    //nếu không có
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop isn't registered");

    //verify token
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);

    const foundShop = await findByEmail({email});
    if (!foundShop) throw new AuthFailureError("Shop isn't registered");

    //create 1 cặp mới
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    //update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });
    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  /**
   * 1- Check email in dbs
   * 2- Match password
   * 3- Create AT vs RT and Save
   * 4- Generate tokens
   * 5- Get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    //1
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    //2
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication Error");

    //3
    const { privateKey, publicKey } = createPublicPrivateKey();

    //4

    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const { privateKey, publicKey } = createPublicPrivateKey();
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
      });

      if (!publicKeyString) {
        throw new BadRequestError("Error: publicKeyString");
      }
      const publicKeyObject = crypto.createPublicKey(publicKeyString);

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKeyObject,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
      // const token =
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
