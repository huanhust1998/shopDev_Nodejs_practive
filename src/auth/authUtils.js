"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helper/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN:"x-rtoken-id"
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify:: `, err);
      } else {
        console.log(`decode verify:: `, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid Request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

  if(refreshToken){
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid UserId")
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid UserId");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
};
