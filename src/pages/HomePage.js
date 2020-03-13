import React, { useState } from 'react'
import { API, graphqlOperation } from 'aws-amplify';
import { searchMarkets } from '../graphql/queries';
import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';

const HomePage = () => {
  const [searchTerm, setsearchTerm] = useState('');
  const [searchResults, setsearchResults] = useState([]);
  const [isSearching, setisSearching] = useState(false);

  const handleSearch = async event => {
    event.preventDefault();
    try {
      setisSearching(true);
      const res = await API.graphql(graphqlOperation(searchMarkets, {
        filter: {
          or: [
            { name: { match: searchTerm }},
            { owner: { match: searchTerm }},
            { tags: { match: searchTerm }}
          ]
        },
        sort: {
          field: 'name',
          direction: 'desc'
        }
      }));
      setsearchResults(res.data.searchMarkets.items);
      setisSearching(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
		<>
			<NewMarket
				setsearchTerm={setsearchTerm}
				setsearchResults={setsearchResults}
				searchTerm={searchTerm}
				handleSearch={handleSearch}
				isSearching={isSearching}
			/>
			<MarketList searchResults={searchResults} />
		</>
	);
}

export default HomePage;