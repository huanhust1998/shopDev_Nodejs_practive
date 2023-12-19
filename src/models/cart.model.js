const { model, Schema } = require("module");

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      require: true,
      enum: ["active", "complete", "failed", "pending"],
      default: "active",
    },
    cart_products: {
      type: Array,
      require: true,
      default: [],
    },
    cart_count_product: {
      type: Number,
      require: true,
      default: 0,
    },
    cart_userId: {
      type: Number,
      require: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timeseries: {
      createAt: "createOn",
      updateAt: "modifiedOn",
    },
  }
);

module.exports = {
  cart: model(DOCUMENT_NAME, cartSchema),
};
