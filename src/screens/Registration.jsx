import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
import { Form, Button } from "react-bootstrap";
// import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import Message from "../components/Message";
import CheckoutSteps from "../components/CheckoutSteps";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [title, setTitle] = useState("");
  const [fundName, setFundName] = useState("");
  const [fundAum, setfundAum] = useState("");
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Password not match.");
    } else {
      setMessage(null);
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
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="font2">University email*</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="font2">Username*</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Password*</Form.Label>
              <div className="position-relative">
                <Form.Control
                  value={password}
                  type={showPassword ? "text" : "password"}
                  className="form-cells1 mb-5"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value !== confirmPassword) {
                      setMessage("Password not match");
                    } else {
                      setMessage(null);
                    }
                  }}
                  placeholder="Type your password.."
                />
                <div
                  className="showpass1 "
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FontAwesomeIcon icon={faEye} />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  )}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Confirm Password*</Form.Label>
              <div className="position-relative">
                <Form.Control
                  value={confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-cells1 mb-5"
                  required
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (e.target.value !== password) {
                      setMessage("Password not match.");
                    } else {
                      setMessage(null);
                    }
                  }}
                  placeholder="Type your password.."
                />
                <div
                  className="showpass1 "
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FontAwesomeIcon icon={faEye} />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  )}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Phone Number*</Form.Label>
              <Form.Control
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">University Name*</Form.Label>
              <Form.Control
                type="text"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Title*</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Fund Name*</Form.Label>
              <Form.Control
                type="text"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                className="form-cells1 mb-5"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="font2">Fund AUM ($)*</Form.Label>
              <Form.Control
                type="number"
                value={fundAum}
                onChange={(e) => setfundAum(e.target.value)}
                className="form-cells1 last-cell"
                required
              />
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
