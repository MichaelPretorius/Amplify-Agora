import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { Notification, Message } from 'element-react';
import { getUser } from '../graphql/queries';
import { createOrder } from '../graphql/mutations';
import { history } from '../App';

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

  // const createShippingAddress = source => ({
  //   city: source.address_city,
  //   country: source.address_country,
  //   address_line1: source.adress_line1,
  //   address_state: source.adress_state,
  //   address_zip: source.adress_zip
  // })

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
      // if (res.charge.status === "succeeded")
      if (res.message === "Order processed successfully!") {
        let shippingAddress = null;
        // if (product.shipped) {
        //   shippingAddress = createShippingAddress(res.charge.source);
        // }

        const input = {
          orderUserId: user.attributes.sub,
          orderProductId: product.id,
          shippingAddress
        }
        const order = await API.graphql(graphqlOperation(createOrder, { input }));
        console.log({ order })
        Notification({
          title: 'Success',
          message: `${res.message}`,
          type: 'success',
          duration: 3000
        })
        setTimeout(() => {
          history.push('/')
          Message({
            type: 'info',
            message: 'Check your verified email for order details',
            duration: 5000,
            showClose: true
          })
        }, 3000)
      }
    } catch (error) {
      console.log('Error making Stripe Checkout: ', error);
      Notification.error({
				title: 'error',
				message: `${error.message || 'Error processing order'}`,
			});
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
