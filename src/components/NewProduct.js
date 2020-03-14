import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import { Form, Button, Input, Notification, Radio, Progress } from 'element-react';

const NewProduct = () => {
  const [description, setdescription] = useState('');
  const [price, setprice] = useState('');
  const [shipped, setshipped] = useState(true);
  const [imagePreview, setimagePreview] = useState('');
  const [image, setimage] = useState('');

  const handleAddProduct = () => {
    console.log(image)
    setdescription('');
    setprice('');
    setshipped(true);
    setimagePreview('');
    setimage('');
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
              value={description}
							onChange={description => setdescription(description)}
						/>
					</Form.Item>
					<Form.Item label='Set Product Price'>
						<Input
							type='number'
							icon='plus'
              value={price}
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
          {imagePreview && (
            <img
              className="image-preview"
              src={imagePreview}
              alt="Product Preview"
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={url => setimagePreview(url)}
            onPick={file => setimage(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: '0.8em'
              },
              formSection: {
                display: 'fex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              },
              photoPlaceholder: {
                display: 'none'
              },
              sectionBody: {
                margin: 0,
                width: '250px'
              },
              photoPickerButton: {
                width: '250px'
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)'
              }
            }}
          />
          <Button type="primary" onClick={handleAddProduct} disabled={!image || !description || !price}>
            Add Product
          </Button>
				</Form>
			</div>
		</div>
	);
}

export default NewProduct;
