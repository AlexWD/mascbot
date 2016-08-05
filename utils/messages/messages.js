'use strict';

module.exports = {
  sendSlackOrderDetails: (opts) => {
    return {
      "text": "Here are the order details",
      "attachments": [
        {
          "text": `Section: ${opts.section_id}, Row: ${opts.row_id}, Seat: ${opts.seat_id}`,
          "fallback": "message was not sent",
          "callback_id": "seat_address",
          "color": "#ff0000"
        },
        {
          "text": `${opts.order_details}`,
          "fallback": "message was not sent",
          "callback_id": "order_details",
          "color": "#ff0000"
        }
      ]
    } 
  },

  slash_reply: () => {
    return {
      "text": "message sent ->",
      "attachments": [
        {
          "text": "",
          "fallback": "message was not sent",
          "callback_id": "slash_reply",
          "color": "#3AA3E3"
        }
      ]
    }
  },

  fb_user_msg: () => {
    return {
      "text": "message received <-",
      "attachments": [
        {
          "text": "",
          "fallback": "message was not sent",
          "callback_id": "fb_user_chat",
          "color": "#ff0000"
        }
      ]
    }
  },

  runner_connect: {
    "picked_up": "Connection has been opened with your runner. Simply type a message and they will receive it directly."
  },

  picked_up: "Your order has been picked up and is on its way. Please be at your seat so that your order can be delivered.",

  delivered: "Hope you enjoy your order!",

  cancel: "Your order has been cancelled",
}