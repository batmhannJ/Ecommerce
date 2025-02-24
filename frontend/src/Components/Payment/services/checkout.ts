import axios from "axios";
import config from "../config.ts";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";

const mayaCheckoutUrl: string = config.maya_checkout.url;
const hostUrl: string = config.host_url;
const token: string = Buffer.from(
  `${config.maya_checkout.pub_api_key}:`,
  "binary"
).toString("base64");
const requestReferenceNumber: string = uuidv4(); // generated rrn

export const createCheckout = async (cart: Cart, buyer: User) => {
  const req: CheckoutRequest = {
    totalAmount: {
      currency: "PHP",
      value: cart.totalAmount,
    },
    items: cart.items.map(
      (item): CheckoutItem => ({
        amount: {
          value: item.product.unitPrice,
          details: {
            subtotal: item.product.unitPrice,
          },
        },
        totalAmount: {
          value: item.totalPrice,
        },
        name: item.product.name,
        quantity: item.quantity,
      })
    ),

    redirectUrl: {
      success: `${hostUrl}/purchase/success?id=${requestReferenceNumber}`,
      failure: `${hostUrl}/purchase/failed?id=${requestReferenceNumber}`,
      cancel: `${hostUrl}/purchase/canceled?id=${requestReferenceNumber}`,
    },

    buyer: {
      firstName: buyer.firstName,
      lastName: buyer.lastName,
    },
    requestReferenceNumber,
  };

  const headers = {
    accept: "application/json",
    authorization: `Basic ${token}`,
    "content-type": "application/json",
  };

  const response = await axios.post(`${mayaCheckoutUrl}`, req, { headers });
  const checkout: CheckoutTransaction = response.data;
  return checkout;
};
