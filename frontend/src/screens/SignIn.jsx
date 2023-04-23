import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [showPassword, setShowPassword] = useState(null);
  let Emailref = useRef();
  let Passwordref = useRef();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    let email = Emailref.current.value;
    let password = Passwordref.current.value;

    console.log(email, password);
    try {
      let res = await fetch("http://localhost:9000/auth/login", {
        method: "POST",
        body: JSON.stringify({
          password: password,
          email: email,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });

      let data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
    navigate("/payment");
  };

  return (
    <>
      <div className="container-fluid app-main1">
        <div className="row ">
          <div className="offset-md-3 col-md-6 column1">
            <Form className="signUp-form" onSubmit={submitHandler}>
              <div>
                <h1 className=" text-center fw-bold font1">Sign in to your account</h1>
                <p className="text-center font">Lorem ipsum dolor sit, amet consectetur adipisicing elit.</p>
              </div>

              <div className="form1">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    ref={Emailref}
                    className="form-cells"
                    required
                    placeholder="yourmail@mail.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      ref={Passwordref}
                      type={showPassword ? "text" : "password"}
                      className="form-cells"
                      placeholder="Type your password.."
                      required
                    />
                    <div className=" showpass " onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
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
