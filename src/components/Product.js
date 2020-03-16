import React, { useContext, useState } from 'react';
import { S3Image } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from 'element-react';
import { updateProduct, deleteProduct } from '../graphql/mutations';
import { converCentsToDollars, converDollarsToCents } from '../utils';
import { UserContext } from '../App';
import PayButton from './PayButton';

const Product = ({ product }) => {
  const [updateProductDialog, setupdateProductDialog] = useState(false);
  const [deleteProductDialog, setdeleteProductDialog] = useState(false);
  const [description, setdescription] = useState('');
  const [price, setprice] = useState('');
  const [shipped, setshipped] = useState(true)

  const {user} = useContext(UserContext);
  const isProductOwner = user && user.attributes.sub === product.owner;

  const handleUpdateProduct = async productId => {
    try {
      setupdateProductDialog(false);
      const input = {
        id: productId,
        description,
        shipped,
        price: converDollarsToCents(price)
      }
      
      await API.graphql(graphqlOperation(updateProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product Successfully Updated',
        type: 'success'
      });
    } catch (error) {
      console.log('Failed to update product: ', error);
    }
  }


  const handleDeleteProduct = async productId => {
    try {
      setdeleteProductDialog(false);
      const input = {
        id: productId
      };
      const res = await API.graphql(graphqlOperation(deleteProduct, { input }));
      console.log({ res });
      Notification({
        title: 'Success',
        message: 'Product Successfully Deleted',
        type: 'success'
      });
    } catch (error) {
      console.log('Failed to delete product: ', error);
    }
  }
 
  return (
    <div className="card-container">
      <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
        <S3Image
          imgKey={product.file.key}
          theme={{
            photoImg: { maxWidth: '100%', maxHeight: '100%' }
          }}
        />
        <div className="card-body">
          <h3 className="m-0">{product.description}</h3>
          <div className="items-center">
            <img
              src={`https://icon.now.sh/${product.shipped ? "markunread_mailbox" : "mail"}`}
              alt="shipping icon"
              className="icon"
            />
            {product.shipped ? 'Shipped' : 'Emailed'}
          </div>
          <div className="text-right">
            <span className="mx-1">
              ${converCentsToDollars(product.price)}
            </span>
            {!isProductOwner && (
              <PayButton product={product} user={user} />
            )}
          </div>
        </div>
      </Card>
      <div className="text-center">
        {isProductOwner && (
          <>
            <Button
              type="warning"
              icon="edit"
              className="m-1"
              onClick={() => {
                setupdateProductDialog(true);
                setdescription(product.description);
                setprice(converCentsToDollars(product.price));
                setshipped(product.shipped);
              }}
            />
            <Popover
              placement="top"
              trigger="click"
              visible={deleteProductDialog}
              content={
                <>
                  <p>Do you wannt to delte this?</p>
                  <div className="text-right">
                    <Button
                      size="mini"
                      type="text"
                      className="m-1"
                      onClick={() => setdeleteProductDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="mini"
                      type="primary"
                      className="m-1"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              }
            >
            <Button
              type="danger"
              icon="delete"
              className="m-1"
                onClick={() => setdeleteProductDialog(true)}
            />
            </Popover>
          </>
        )}
      </div>

      <Dialog
        title="Update Product"
        size="large"
        customClass="dialog"
        visible={updateProductDialog}
        onCancel={() => setupdateProductDialog(false)}
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label='Update Description'>
              <Input
                icon="information"
                placeholder='Product Description'
                value={description}
                trim
                onChange={description => setdescription(description)}
              />
            </Form.Item>
            <Form.Item label='Update Price'>
              <Input
                type='number'
                icon='plus'
                value={price}
                placeholder='Price ($USD)'
                onChange={price => setprice(price)}
              />
            </Form.Item>
            <Form.Item label='Update Shipping'>
              <div className='text-center'>
                <Radio
                  value='true'
                  checked={shipped}
                  onChange={() => setshipped(true)}
                >
                  Shipped
							</Radio>
                <Radio
                  value='false'
                  checked={!shipped}
                  onChange={() => setshipped(false)}
                >
                  Emailed
							</Radio>
              </div>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setupdateProductDialog(false)}>
            Cancel
          </Button>
          <Button type="primary" onClick={() => handleUpdateProduct(product.id)}>
            Update
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export default Product;
