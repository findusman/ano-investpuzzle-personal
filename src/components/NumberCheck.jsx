import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const NumberCheck = ({ number }) => {
  return (
    <>
      <div className="d-flex justify-content-center">
        <Nav.Item className="d-flex justify-content-center col-3">
          <Nav.Link
            as={NavLink}
            to="/"
            className="checkout-link border border-3 rounded-circle fw-bold text-center"
          >
            {number}
          </Nav.Link>
        </Nav.Item>
      </div>
    </>
  );
};

export default NumberCheck;
