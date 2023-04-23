import React from "react";
import { Row, Nav } from "react-bootstrap";
import NumberCheck from "./NumberCheck";
import NumberUncheck from "./NumberUncheck";
import StepCheck from "./StepCheck";
import StepUncheck from "./StepUncheck";

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="container">
      <Row className="justify-content-md-center">
        <div className="my-5">
          <h1 className="form-heading text-center">
            Get Access to WaffleStock for your Class
          </h1>
          <h1 className="font6 text-center">Join our SIMF Network</h1>
        </div>

        <Nav activeKey="/registration">
          <div className=" col-3">
            {step1 ? <NumberCheck number="1" /> : <NumberUncheck number="1" />}
          </div>
          <div className="col-3">
            {step2 ? <NumberCheck number="2" /> : <NumberUncheck number="2" />}
          </div>
          <div className="col-3">
            {step3 ? <NumberCheck number="3" /> : <NumberUncheck number="3" />}
          </div>
          <div className="col-3">
            {step4 ? <NumberCheck number="4" /> : <NumberUncheck number="4" />}
          </div>
        </Nav>

        <Nav activeKey="/registration">
          <div className=" col-3">
            {step1 ? (
              <StepCheck name="Registration" />
            ) : (
              <StepUncheck name="Registration" />
            )}
          </div>
          <div className="col-3">
            {step2 ? (
              <StepCheck name="Email Verification" />
            ) : (
              <StepUncheck name="Email Verification" />
            )}
          </div>
          <div className="col-3">
            {step3 ? (
              <StepCheck name="Payment" />
            ) : (
              <StepUncheck name="Payment" />
            )}
          </div>
          <div className="col-3">
            {step4 ? (
              <StepCheck name="Get the Access Code" />
            ) : (
              <StepUncheck name="Get the Access Code" />
            )}
          </div>
        </Nav>
      </Row>
    </div>
  );
};

export default CheckoutSteps;
