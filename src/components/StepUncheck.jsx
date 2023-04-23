import React from "react";
import { Nav } from "react-bootstrap";

const StepUncheck = ({ name }) => {
  return (
    <>
      <Nav.Item>
        <Nav.Link
          disabled
          className="checkout-link4 text-center"
          style={{ color: "#cbcbcb" }}
        >
          {name}
        </Nav.Link>
      </Nav.Item>
    </>
  );
};

export default StepUncheck;
