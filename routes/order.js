const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Order, validateOrder } = require("../models/order");
const asyncMiddleware = require("../middleware/async");

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    let order = new Order(
      _.pick(req.body, [
        "price",
        "discountPrice",
        "user",
        "payment",
        "shippingAddress",
        "paymentTnxID",
      ])
    );

    await order.save();

    order = await Order.findById(order._id).populate("user", "name email");

    res.send({
      success: "Order has successfully added",
      data: order,
    });
  })
);

router.get(
  "/:orderId",
  asyncMiddleware(async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId).populate(
        "user",
        "name email"
      );
      if (!order) {
        return res.status(404).send({ error: "Order not found" });
      }

      res.send({
        success: "Order fetched successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  })
);

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const allOrders = await Order.find().populate("user", "name email");

    res.send({
      success: "All Order fetch successfully",
      data: allOrders,
    });
  })
);

router.get(
  "/user/:userId",
  asyncMiddleware(async (req, res) => {
    const { userId } = req.params;
    const userOrders = await Order.find({ user: userId }).populate(
      "user",
      "name email"
    );
    if (!userOrders.length)
      return res.status(404).send({ error: "No orders found for this user" });

    res.send({
      success: "Orders fetched successfully",
      data: userOrders,
    });
  })
);

module.exports = router;
