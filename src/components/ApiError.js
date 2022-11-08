import React from 'react';
import Alert from "react-bootstrap/Alert";

function ApiError({ error }) {
  if (!error) return null;

  const message = error.info?.message || error?.message || error.status;
  return <Alert variant="warning">{message}</Alert>;
}

export default ApiError;