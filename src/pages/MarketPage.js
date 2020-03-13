import React from 'react';

const MarketPage = ({ match }) => {
  const marketId = match.params.marketId;

  return (
    <div>
      MarketPage {marketId}
    </div>
  );
}

export default MarketPage;
