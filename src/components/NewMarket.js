import React, { useState, useContext } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createMarket } from '../graphql/mutations';
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react';
import { UserContext } from '../App';

const NewMarket = () => {
  const [addMarketDialog, setaddMarketDialog] = useState(false);
  const [name, setname] = useState('');

  const { user } = useContext(UserContext);

  const handleAddMarket = async () => {
    try {
      setaddMarketDialog(false);
      const res = await API.graphql(graphqlOperation(createMarket, { input: { name, owner: user.username }}));
      console.log(`Created market: id ${res.data.createMarket.id}`);
      setname('');
    } catch (err) {
      console.log('Error adding new market: ', err)
      Notification.error({
        title: 'Error',
        message: `${err.message || "Error adding market"}`
      })
    }
  }

  return (
		<>
			<div className='market-header'>
				<h1 className='market-title'>
					Create Your MarketPlace
					<Button
						type='text'
						icon='edit'
						className='market-title-button'
						onClick={() => setaddMarketDialog(true)}
					/>
				</h1>
			</div>

			<Dialog
				title='Create New Market'
				visible={addMarketDialog}
				onCancel={() => setaddMarketDialog(false)}
        size="large"
        customClass="dialog"
			>
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Add Market Name">
              <Input
                placeholder="Market Name"
                trim={true}
                onChange={name => setname(name)}
                value={name}
              />
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setaddMarketDialog(false)}>
            Cancel
          </Button>
          <Button type="primary" disabled={!name} onClick={handleAddMarket}>
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
		</>
	);
}

export default NewMarket;
