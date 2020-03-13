import React, { useState, useContext } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createMarket } from '../graphql/mutations';
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react';
import { UserContext } from '../App';

const NewMarket = () => {
  const [addMarketDialog, setaddMarketDialog] = useState(false);
  const [name, setname] = useState('');
  const [selectedTags, setselectedTags] = useState([]);
  const [options, setoptions] = useState([]);

  const tags = ['Arts', 'Technology', 'Crafts', 'Entertainment', 'Web Dev'];
  const { user } = useContext(UserContext);

  const handleAddMarket = async () => {
    try {
      setaddMarketDialog(false);
      const res = await API.graphql(
				graphqlOperation(createMarket, {
					input: {
						name,
            owner: user.username,
            tags: selectedTags
					},
				}),
      );
      console.log(`Created market: id ${res.data.createMarket.id}`);
      setname('');
      setselectedTags([]);
    } catch (err) {
      console.log('Error adding new market: ', err)
      Notification.error({
        title: 'Error',
        message: `${err.message || "Error adding market"}`
      })
    }
  }

  const handleFilterTags = query => {
    const options = tags
      .map(tag => ({ value: tag, label: tag}))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()))

    setoptions(options);
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
				size='large'
				customClass='dialog'
			>
				<Dialog.Body>
					<Form labelPosition='top'>
						<Form.Item label='Add Market Name'>
							<Input
								placeholder='Market Name'
								trim={true}
								onChange={name => setname(name)}
								value={name}
							/>
						</Form.Item>
						<Form.Item labe='Add Tags'>
							<Select
								multiple
								filterable
								remote
								placeholder='Market Tags'
								onChange={tags => setselectedTags(tags)}
								remoteMethod={handleFilterTags}
							>
								{options.map(({value, label}) => (
									<Select.Option key={value} label={label} value={value} />
								))}
							</Select>
						</Form.Item>
					</Form>
				</Dialog.Body>
				<Dialog.Footer>
					<Button onClick={() => setaddMarketDialog(false)}>Cancel</Button>
					<Button type='primary' disabled={!name} onClick={handleAddMarket}>
						Add
					</Button>
				</Dialog.Footer>
			</Dialog>
		</>
	);
}

export default NewMarket;
