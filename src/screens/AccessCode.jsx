import React, { useState } from "react";
import CheckoutSteps from "../components/CheckoutSteps";
import FormContainer from "../components/FormContainer";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import Message from "../components/Message";

const AccessCode = () => {
  const [message, setMessage] = useState(null);

  const [text, setText] = useState("");

  const inputHandler = (event) => {
    setText(event.target.value);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setMessage("Code is copied to clipboard.");
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="px-5">
        <FormContainer
          formTitle="Welcome to the WaffleStock"
          formDescription="We are glad to see you in our community"
        >
          <Form className="col-md-6 offset-md-3">
            {message ? <Message variant="success">{message}</Message> : null}
            <div className="row pt-5">
              <Form.Group>
                <Form.Label className="checkout-link2 pb-3">
                  Here's your universities' unique access code:
                </Form.Label>
                <div className="row">
                  <div className="col-8">
                    <Form.Control
                      type="text"
                      value={text}
                      onChange={inputHandler}
                      className="form-cells3"
                      placeholder="CHSDFUSDIF"
                    />
                  </div>
                  <div className="col-4">
                    <Form.Group>
                      <div className="d-grid">
                        <Link
                          to="/accessCode"
                          className="btn btn5"
                          type="submit"
                          onClick={copy}
                        >
                          Copy Code
                        </Link>
                      </div>
                    </Form.Group>
                  </div>
                </div>
              </Form.Group>
            </div>
            <h1 className="checkout-link2 text-center pb-5 mb-5">
              Your students can access WaffleStock by using this code.{" "}
            </h1>
          </Form>
        </FormContainer>
      </div>
    </>
  );
};

export default AccessCode;
