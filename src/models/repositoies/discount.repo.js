"use strict";

const { unGetSelectData, getSelectData } = require("../../utils");

const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _is: 1 };
  const products = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();
  return products;
};

const findAllDiscountCodesSelect = async ({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter,
    select,
    model,
  }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _is: 1 };
    const products = await model
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean();
    return products;
};

const checkDiscountExists = async (model, filter)=>{
  const foundDiscount = await model.findOne(filter).lean();
  return foundDiscount;
}

module.exports = {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  checkDiscountExists
};
