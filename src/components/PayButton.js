import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { Notification, Message } from 'element-react';
import { getUser } from '../graphql/queries';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_t1i6G0rgycjrVPw2NtBJKnJf007DBFB6LG'
}

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId };
      const res = await API.graphql(graphqlOperation(getUser, input));
      return res.data.getUser.email;
    } catch (error) {
      console.log('Error fetching Product Owner Email: ',error)
    }
  }

  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const res = await API.post('orderStripeLambda', '/charge', {
				body: {
					token,
					charge: {
						currency: stripeConfig.currency,
						amount: product.price,
						description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped
          }
				},
			});
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
