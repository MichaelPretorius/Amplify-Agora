import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react';
import { getUser } from '../graphql/modified';
import { converCentsToDollars } from '../utils';

const ProfilePage = ({ user }) => {
  const [orders, setorders] = useState([])

  useEffect(() => {
    if (user) {
      getUserOrders(user.attributes.sub);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getUserOrders = async userId => {
    const input = {
      id: userId
    }
    const res = await API.graphql(graphqlOperation(getUser, input));
    setorders(res.data.getUser.orders.items);
  }

  return (
    <>
      <Tabs activeName="1" className="profile-tabs">
        <Tabs.Pane
          label={
            <>
              <Icon name="document" className="icon" />
              Summary
            </>
          }
          name="1"
        >
          <h2 className="header">Profile Summary</h2>
        </Tabs.Pane>

        <Tabs.Pane
          label={
            <>
              <Icon name="message" className="icon" />
              Orders
            </>
          }
          name="2"
        >
          <h2 className="header">Order History</h2>
          {orders.map(order => (
            <div className="mb-1" key={order.id}>
              <Card>
                <pre>
                  <p>Order Id: {order.id}</p>
                  <p>Product Description: {order.product.description}</p>
                  <p>Price: ${converCentsToDollars(order.product.price)}</p>
                  <p>Purchased on {order.createdAt}</p>
                  {order.shippingAddress && (
                    <>
                      Shipping Address
                      <div className="ml-2">
                        <p>{order.shippingAddress.address_line1}</p>
                        <p>{order.shippingAddress.city}, 
                        {order.shippingAddress.address_state} 
                        {order.shippingAddress.country} 
                        {order.shippingAddress.address_zip}</p>
                      </div>
                    </>
                  )}
                </pre>
              </Card>
            </div>
          ))}
        </Tabs.Pane>
      </Tabs>
    </>
  );
}

export default ProfilePage;
