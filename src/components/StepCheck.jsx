import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const StepCheck = ({ name }) => {
  return (
    <>
      <Nav.Item>
        <Nav.Link as={NavLink} to="/" className="checkout-link1 text-center">
          {name}
        </Nav.Link>
      </Nav.Item>
    </>
  );
};

export default StepCheck;
