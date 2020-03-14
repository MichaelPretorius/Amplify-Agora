import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { getMarket } from '../graphql/queries';
import { Loading, Tabs, Icon, Button } from 'element-react';
import { Link } from 'react-router-dom'
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

const MarketPage = ({ match, user }) => {
  const [market, setmarket] = useState(null);
  const [isLoading, setisLoading] = useState(true);
  const [isMarketOwner, setisMarketOwner] = useState(false);

  useEffect(() => {
    handleGetMarket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (market) {
      checkMarketOwner();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market])

  const handleGetMarket = async () => {
    const res = await API.graphql(
			graphqlOperation(getMarket, {id: match.params.marketId}),
    );
    setmarket(res.data.getMarket);
    setisLoading(false);
  }

  const checkMarketOwner = () => {
    if (user) {
      setisMarketOwner(user.username === market.owner);
    }
  }

  return (
    <>
      {isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <Link className="link" to="/">
            Back to Markets List
          </Link>

          <span className="items-center pt-2">
            <h2 className="mb-mr">{market.name}</h2>- {market.owner}
          </span>
          <div className="items-center pt-2">
            <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em"}}>
              <Icon name="date" className="icon" />
              {market.createdAt}
            </span>
          </div>

          <Tabs tabs="border-card" value={isMarketOwner ? "1" : "2"}>
            {isMarketOwner && (
              <Tabs.Pane
                label={
                  <>
                    <Icon name="plus" className="icon" />
                    Add Product
                  </>
                }
                name="1"
              >
                  <NewProduct marketId={match.params.marketId} />
              </Tabs.Pane>
            )}
  
            <Tabs.Pane
              label={
                <>
                  <Icon name="menu" className="icon" />
                  Products ({market.products.items.length})
                </>
              }
              name="2"
            >
              {/* <div className="product-list">
                {market.products.items.map(product => (
                  <Product product={product} />
                ))}
              </div> */}
            </Tabs.Pane>
          </Tabs>
        </>
      )}
    </>
  );
}

export default MarketPage;
