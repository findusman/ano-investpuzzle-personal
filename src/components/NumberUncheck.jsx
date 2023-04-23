import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const NumberUncheck = ({ number }) => {
  return (
    <>
      <div className="d-flex justify-content-center">
        <Nav.Item className="d-flex justify-content-center  col-3">
          <Nav.Link
            as={NavLink}
            disabled
            to="/"
            className="checkout-link3 border border-3 rounded-circle fw-bold text-center"
          >
            {number}
          </Nav.Link>
        </Nav.Item>
      </div>
    </>
  );
};
export default NumberUncheck;
