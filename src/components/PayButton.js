import React from 'react';
import { API } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { Notification, Message } from 'element-react';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_t1i6G0rgycjrVPw2NtBJKnJf007DBFB6LG'
}

const PayButton = ({ product, user }) => {
  const handleCharge = async token => {
    try {
      const res = await API.post('orderStripeLambda', '/charge', {
        body: {
          token
        }
      })
      console.log({ res })
    } catch (error) {
      console.log('Error making Stripe Checkout: ', error);
    }
  }

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
    />
  );
}

export default PayButton;
