import React, { useState, useEffect } from "react";
import FormContainer from "../components/FormContainer";
import { Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import Message from "../components/Message";
import CheckoutSteps from "../components/CheckoutSteps";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const Registration = () => {
  let Emailref = useRef();
  let FullNameref = useRef();
  let UserNameref = useRef();
  let Phoneref = useRef();
  let UniversityNameref = useRef();
  let Titleref = useRef();
  let FundNameref = useRef();
  let FundsAumref = useRef();
  let Passwordref = useRef();
  let ConfirmPasswordref = useRef();

  const [showPassword, setShowPassword] = useState(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    let email = Emailref.current.value;
    let fullName = FullNameref.current.value;
    let userName = UserNameref.current.value;
    let phone = Phoneref.current.value;
    let universityName = UniversityNameref.current.value;
    let title = Titleref.current.value;
    let fundName = FundNameref.current.value;
    let fundAum = FundsAumref.current.value;
    let password = Passwordref.current.value;
    let confirmPassword = ConfirmPasswordref.current.value;
    // console.log(email, fullName, userName, phone, universityName, title, fundName, fundAum, password);
    try {
      let res = await fetch("http://localhost:9000/auth/registerProfessor", {
        method: "POST",
        body: JSON.stringify({
          password: password,
          userFullName: fullName,
          email: email,
          username: userName,
          userPhone: phone,
          universityName: universityName,
          title: title,
          fundName: fundName,
          fundsAum: fundAum,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });

      // if (!res.ok) throw new Error("data are not found");
      let data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
    navigate("/emailVerification");
  };

  return (
    <>
      <CheckoutSteps step1 />
      <div className="px-5">
        <FormContainer formTitle="Registration">
          <Form onSubmit={submitHandler} className="col-md-6 offset-md-3">
            {message ? <Message>{message}</Message> : null}

            <Form.Group className="mb-3">
              <Form.Label className="font2 mt-5">Full Name*</Form.Label>
              <Form.Control type="text" ref={FullNameref} className="form-cells1 mb-5" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="font2">University email*</Form.Label>
              <Form.Control type="email" ref={Emailref} className="form-cells1 mb-5" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="font2">Username*</Form.Label>
              <Form.Control type="text" ref={UserNameref} className="form-cells1 mb-5" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Password*</Form.Label>
              <div className="position-relative">
                <Form.Control
                  ref={Passwordref}
                  type={showPassword ? "text" : "password"}
                  className="form-cells1 mb-5"
                  required
                  placeholder="Type your password.."
                />
                <div className="showpass1 " onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Confirm Password*</Form.Label>
              <div className="position-relative">
                <Form.Control
                  ref={ConfirmPasswordref}
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-cells1 mb-5"
                  required
                  placeholder="Type your password.."
                />
                <div className="showpass1 " onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Phone Number*</Form.Label>
              <Form.Control type="number" ref={Phoneref} className="form-cells1 mb-5" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">University Name*</Form.Label>
              <Form.Control type="text" ref={UniversityNameref} className="form-cells1 mb-5" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Title*</Form.Label>
              <Form.Control type="text" ref={Titleref} className="form-cells1 mb-5" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Fund Name*</Form.Label>
              <Form.Control type="text" ref={FundNameref} className="form-cells1 mb-5" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Fund AUM ($)*</Form.Label>
              <Form.Control type="number" ref={FundsAumref} className="form-cells1 last-cell" required />
            </Form.Group>

            <hr />
            <div className="d-grid my-4">
              <Button className="btn btn2" type="submit">
                Sign Up
              </Button>
            </div>
          </Form>
        </FormContainer>
      </div>
    </>
  );
};

export default Registration;
