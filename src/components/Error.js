import React from 'react';

const Error = ({ errors }) => {
  return (
    <pre className="error">
      {errors.map(({ message }, i) => <div key={i}>{message}</div>)}
    </pre>
  );
}

export default Error;
