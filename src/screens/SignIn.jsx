import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";

function SignIn() {
  const [showPassword, setShowPassword] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <div className="container-fluid app-main1">
        <div className="row ">
          <div className="offset-md-3 col-md-6 column1">
            <Form className="signUp-form">
              <div>
                <h1 className=" text-center fw-bold font1">
                  Sign in to your account
                </h1>
                <p className="text-center font">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                </p>
              </div>

              <div className="form1">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-cells"
                    placeholder="yourmail@mail.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      value={password}
                      type={showPassword ? "text" : "password"}
                      className="form-cells"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type your password.."
                    />
                    <div
                      className=" showpass "
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

                <div className="d-grid my-4">
                  <Button className="btn btn1" type="submit">
                    Sign In
                  </Button>
                </div>
                <div className="forget-password text-center">
                  <Link to="/forgetPassword">Forget Password?</Link>
                </div>
                <p className="text-center font mt-4">
                  Don't have an account?{" "}
                  <span className="text-dark">
                    <Link to="/registration">Sign Up</Link>
                  </span>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
