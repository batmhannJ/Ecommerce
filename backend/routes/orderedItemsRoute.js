const express = require("express");
const orderedItemsRouter = express.Router();
const orderedItemsController = require("../controllers/orderedItemsController");

orderedItemsRouter.post(
  "/addPaidItems",
  orderedItemsController.createOrderedList
);
orderedItemsRouter.get("/getPaidItems", orderedItemsController.getOrderedList);
orderedItemsRouter.get(
  "/getOrderedItemsById/:id",
  orderedItemsController.getOrderedListById
);
orderedItemsRouter.put(
  "/findByIdAndUpdate//:id",
  orderedItemsController.updateOrderedList
);
orderedItemsRouter.delete(
  "/deletePaidItem/:id",
  orderedItemsController.deleteOrderedList
);

module.exports = orderedItemsRouter;
