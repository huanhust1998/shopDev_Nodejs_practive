const DiscountService = require("../services/discount.service");
const { SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Success code generations",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code found",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    });
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code found",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    });
  };

  getAllDiscountCodesWithProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Successful code found",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.body,
      }),
    });
  };
}

module.exports = new DiscountController();
