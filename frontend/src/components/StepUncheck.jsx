import React from "react";
import { Nav } from "react-bootstrap";

const StepUncheck = ({ name }) => {
  return (
    <>
      <h1 disabled className="checkout-link4  pt-3" style={{ color: "#cbcbcb" }}>
        {name}
      </h1>
    </>
  );
};

export default StepUncheck;
