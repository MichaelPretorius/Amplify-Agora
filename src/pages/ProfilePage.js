import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react';
import { getUser } from '../graphql/modified';
import { converCentsToDollars, formatOrderDate } from '../utils';

const ProfilePage = ({ user, userAttributes }) => {
  const [verificationForm, setverificationForm] = useState(false)
  const [verificationCode, setverificationCode] = useState('')
  const [email, setemail] = useState('')
  const [emailDialog, setemailDialog] = useState(false)
  const [orders, setorders] = useState([])

  const columns = [
    { prop: "name", width: "150" },
    { prop: "value", width: "330" },
    { prop: "tag",
      width: "150",
      render: row => {
        if(row.name === "Email") {
          const emailVerified = userAttributes && userAttributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">Unverified</Tag>
          )
        }
      }
    },
    {
      prop: "operations",
      render: row => {
        switch (row.name) {
          case "Email":
            return (
              <Button type="info" size="small" onClick={() => setemailDialog(true)}>Edit</Button>
            );
          case "Delete Profile":
            return (
              <Button type="danger" size="small" onClick={handleDeleteProfile}>Delete</Button>
            );
          default:
            return;
        }
      }
    }
  ]

  useEffect(() => {
    if (userAttributes) {
      setemail(userAttributes.email);
    }
  }, [userAttributes])

  useEffect(() => {
    if (userAttributes) {
      getUserOrders(userAttributes.sub);
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

  const sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr)
    setverificationForm(true)
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${email}`
    })
  }

  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = { email };
      const res = await Auth.updateUserAttributes(user, updatedAttributes);
  
      if (res === 'SUCCESS'){
        sendVerificationCode("email");
      }
    } catch (error) {
      Notification.error({
        title: "Error",
        message: `${error.message || 'Error updating email'}`
      })
    }
  }

  const handleVerifyEmail = async attr => {
    try {
      const res = await Auth.verifyCurrentUserAttributeSubmit(attr, verificationCode)

      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${res.toLowerCase()}`,
        duration: 3000
      })
      setTimeout(() => {
        window.location.reload()
      }, 3000);
    } catch (error) {
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error updating email'}`
      })
    }
  }

  const handleDeleteProfile = async () => {
    MessageBox.confirm(
      'This will permanently delete your account. Continue?',
      'Attention!',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await user.deleteUser();
      } catch (error) {
        console.log(error)
      }
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Delete Canceled!'
      })
    })
  }

  return userAttributes && (
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

          <Table
            columns={columns}
            data={[
              {
                name: "Your Id",
                value: userAttributes.sub
              },
              {
                name: "Username",
                value: user.username
              },
              {
                name: "Email",
                value: userAttributes.email
              },
              {
                name: "Phone Number",
                value: userAttributes.phone_number
              },
              {
                name: "Delete Profile",
                value: "Sorry to see you go"
              }
            ]}
            showHeader={false}
            rowClassName={row => row.name === "Delete Profile" && 'delete-profile'}
          />
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
                  <p>Purchased on {formatOrderDate(order.createdAt)}</p>
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

      <Dialog
        size="large"
        customClass="dialog"
        title="Edit Email"
        visible={emailDialog}
        onCancel={() => setemailDialog(false)}
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Email">
              <Input
                value={email}
                onChange={email => setemail(email)}
              />
            </Form.Item>
            {verificationForm && (
              <Form.Item label="Enter Verification Code" labelWidth="120">
                <Input
                  value={verificationCode}
                  onChange={code => setverificationCode(code)}
                />
              </Form.Item>
            )}
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setemailDialog(false)}>
            Cancel
          </Button>
          {!verificationForm && (<Button type="primary" onClick={handleUpdateEmail}>
            Save
          </Button>)}
          {verificationForm && (<Button type="primary" onClick={() => handleVerifyEmail('email')}>
            Submit
          </Button>)}
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

export default ProfilePage;
