import React from 'react';

function Protected() {
  return (
    <div>
      <h1>Protected Route</h1>
      <p>You can only see this if you are authenticated.</p>
    </div>
  );
}

export default Protected;
