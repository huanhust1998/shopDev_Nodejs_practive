"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new Schema(
  {
    invent_productId: { type: Schema.Types.ObjectId, ref: "Product" },
    invent_location: {type:String, default:"unKnow"},
    invent_stock: {type: Number, required: true}, //số lượng hàng tồn kho của sản phẩm
    invent_shopId: {type: Schema.Types.ObjectId, ref:"Shop"},
    invent_reservations: {type:Array, default:[]}
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
};
