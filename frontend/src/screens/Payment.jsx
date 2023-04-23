import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
import { Form, Button } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [cardNumber, setcardNumber] = useState("");
  const [expiryDate, setexpiryDate] = useState("");
  const [nameofCard, setNameofCard] = useState("");

  const [cvv, setCvv] = useState("");
  const [billingCycle, setbillingCycle] = useState("");
  const [plan, setPlan] = useState("");

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    navigate("/accessCode");
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 />
      <div className="conatiner px-5">
        <FormContainer formTitle="Payment">
          <Form onSubmit={submitHandler}>
            <div className="col-md-6 offset-md-3">
              <Form.Group className="mb-3">
                <Form.Label className="font2 mt-5">Name of Card</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={nameofCard}
                  onChange={(e) => setNameofCard(e.target.value)}
                  className="form-cells1 mb-5"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="font2">Card Number</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={cardNumber}
                  onChange={(e) => setcardNumber(e.target.value)}
                  className="form-cells1 mb-5"
                />
              </Form.Group>

              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="font2">Expiry Date</Form.Label>
                    <Form.Control
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setexpiryDate(e.target.value)}
                      className="form-cells1 mb-5"
                    />
                  </Form.Group>
                </div>
                <div className="col-sm-12 col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="font2">CVV</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="form-cells1 mb-5"
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="">
                <Form.Label className="font2 d-block">Billing Cycle</Form.Label>

                <div className="d-grid">
                  <select
                    type="text"
                    value={billingCycle}
                    onChange={(e) => setbillingCycle(e.target.value)}
                    className="form-cells2 mb-5"
                    required
                  >
                    <option value="Semester">Semester</option>
                    <option value="value2">Text 2</option>
                    <option value="value3">Text 3</option>
                  </select>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="font2 d-block">
                  Choose your plan
                </Form.Label>
                <div className="d-grid">
                  <select
                    type="text"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="form-cells2 mb-5"
                    required
                  >
                    <option value="smallCap">Small Cap</option>
                    <option value="value2">Text 2</option>
                    <option value="value3">Text 3</option>
                  </select>
                </div>
              </Form.Group>
              <hr />
              <div className="py-4 my-3 ">
                <h1 className="font2 d-inline">Small cap . 0-20 Users</h1>
                <h1 className="font2 float-end">$4,900</h1>
                <h1 className="font3 my-2">
                  Save 20% yearly?{" "}
                  <span className="font4">Choose your billing!</span>
                </h1>
              </div>

              <hr />
              <div className="pt-4 pb-5 my-3 ">
                <h1 className="font5 d-inline">Total/Semester</h1>
                <h1 className="font5 float-end">$4,900 USD</h1>
              </div>
            </div>
            <hr />
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-3 col-4 d-grid mt-3 mb-5">
                  <Button className="btn btn4" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>

                <div className="col-md-3 col-4 d-grid ms-auto mt-3 mb-5">
                  <Button className="btn btn3" type="submit">
                    Pay Now
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </FormContainer>
      </div>
    </>
  );
};

export default Payment;
