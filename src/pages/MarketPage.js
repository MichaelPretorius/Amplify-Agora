import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Loading, Tabs, Icon, Button } from 'element-react';
import { Link } from 'react-router-dom'
import { onCreateProduct, onUpdateProduct, onDeleteProduct } from '../graphql/subscriptions';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';
import { getMarket } from '../graphql/modified';

const MarketPage = ({ match, user }) => {
  const [market, setmarket] = useState(null);
  const [isLoading, setisLoading] = useState(true);
  const [isMarketOwner, setisMarketOwner] = useState(false);

  useEffect(() => {
    handleGetMarket();

    const createProductListener = API.graphql(graphqlOperation(onCreateProduct, {
      owner: user.attributes.sub
    })).subscribe({
      next: productData => {
        const createdProduct = productData.value.data.onCreateProduct;
        setmarket(prevMarket => {
          const prevProducts = prevMarket.products.items.filter(
            item => item.id !== createdProduct.id
          )
          const updatedProducts = [createdProduct, ...prevProducts];
          const marketCopy = { ...prevMarket };
          marketCopy.products.items = updatedProducts;
          return marketCopy;
        });
      }
    })
    const updateProductListener = API.graphql(graphqlOperation(onUpdateProduct, {
      owner: user.attributes.sub
    })).subscribe({
      next: productData => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        setmarket(market => {
          const updatedProductIndex = market.products.items.findIndex(
            item => item.id === updatedProduct.id
          )
          const updatedProducts = [
            ...market.products.items.slice(0, updatedProductIndex),
            updatedProduct,
            ...market.products.items.slice(updatedProductIndex + 1)
          ];
          const marketCopy = { ...market };
          marketCopy.products.items = updatedProducts;
          return marketCopy;
        })
      }
    })
    const deleteProductListener = API.graphql(graphqlOperation(onDeleteProduct, {
      owner: user.attributes.sub
    })).subscribe({
      next: productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        setmarket(prevMarket => {
          const updatedProducts = prevMarket.products.items.filter(
            item => item.id !== deletedProduct.id
          )
          const marketCopy = { ...prevMarket };
          marketCopy.products.items = updatedProducts;
          return marketCopy;
        });
      }
    })

    return () => {
      createProductListener.unsubscribe();
      updateProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    } 
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
              <div className="product-list">
                {market.products.items.map(product => (
                  <Product key={product.id} product={product} />
                ))}
              </div>
            </Tabs.Pane>
          </Tabs>
        </>
      )}
    </>
  );
}

export default MarketPage;
