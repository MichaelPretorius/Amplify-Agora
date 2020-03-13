import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import { Form, Button, Input, Notification, Radio, Progress } from 'element-react';

const NewProduct = () => {
  const [description, setdescription] = useState('');
  const [price, setprice] = useState('');
  const [shipped, setshipped] = useState(true);

  const handleAddProduct = () => {
    console.log('Product added')
  }

  return (
		<div className='flex-center'>
			<h2 className='header'>Add New Product</h2>
			<div>
				<Form className='market-header'>
					<Form.Item label='Add Product Description'>
						<Input
							type='text'
							icon='information'
							placeholder='Description'
							onChange={description => setdescription(description)}
						/>
					</Form.Item>
					<Form.Item label='Set Product Price'>
						<Input
							type='number'
							icon='plus'
							placeholder='Price (R)'
							onChange={price => setprice(price)}
						/>
					</Form.Item>
					<Form.Item label='Is the Product Shipped or Emailed to the Customer?'>
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
          <PhotoPicker />
          <Button type="primary" onClick={handleAddProduct}>
            Add Product
          </Button>
				</Form>
			</div>
		</div>
	);
}

export default NewProduct;
