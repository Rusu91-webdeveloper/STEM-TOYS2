const stripe = require("stripe")(
  "sk_test_51RT6qTQ9H05JPPeWoUg59UvhwPT11oCpVGW3hTUVFGQYWoXv8UsmvRG5xj8l7Cn5QJxGKJ08na1ZYOuShF2ytJSU00RQQiJNDY"
);

stripe.products
  .create({
    name: "Starter Subscription",
    description: "$12/Month subscription",
  })
  .then((product) => {
    stripe.prices
      .create({
        unit_amount: 1200,
        currency: "usd",
        recurring: {
          interval: "month",
        },
        product: product.id,
      })
      .then((price) => {
        console.log(
          "Success! Here is your starter subscription product id: " + product.id
        );
        console.log(
          "Success! Here is your starter subscription price id: " + price.id
        );
      });
  });
