import React, { useState } from "react";
import CheckoutSteps from "../components/CheckoutSteps";
import FormContainer from "../components/FormContainer";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const EmailVerification = () => {
  let Coderef = useRef();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    let code = Coderef.current.value;
    console.log(code);
    try {
      let res = await fetch("http://localhost:9000/common/confirmOtp", {
        method: "POST",
        body: JSON.stringify({
          code: code,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      let data = await res.json();
    } catch (error) {
      console.log(error);
    }

    navigate("/payment");
  };

  const [code, setCode] = useState(null);
  return (
    <>
      <CheckoutSteps step1 step2 />
      <div className="p-5 mb-5">
        <FormContainer
          formTitle="Email Verification"
          formDescription="Please enter the verification code sent to you at XXX@email.edu"
        >
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3 col-md-6 offset-md-3">
              <Form.Label className="font2 mt-5">Code</Form.Label>
              <Form.Control type="text" ref={Coderef} className="form-cells1 mb-5" required />
            </Form.Group>
            <hr />
            <div className="container-fluid">
              <div className="row">
                <div className="col-3 d-grid mt-3 mb-5">
                  <Button className="btn btn4" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>

                <div className="col-3 d-grid ms-auto mt-3 mb-5">
                  <Button className="btn btn3" type="submit">
                    Next
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

export default EmailVerification;
