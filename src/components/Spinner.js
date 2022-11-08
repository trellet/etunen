import React from 'react';
import { Spinner as ReactSpinner } from "react-bootstrap";

const Spinner = () => (
  <div className="text-center mt-4 mb-4">
    <ReactSpinner size="lg" animation="grow" variant="primary" />
  </div>
);

export default Spinner;