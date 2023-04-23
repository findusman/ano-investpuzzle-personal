import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import Footer from "../components/Footer";

const WhatWeDo = () => {
  return (
    <>
      <div className="back-img">
        <div className="cover-img">
          <Container className="center-content">
            <Row>
              <Col>
                <h1 className="heading">Invest Puzzle</h1>
                <p className="fs-5 pt-3 paragraph">
                  It is a company dedicated to increasing Financial Education among students in a fun and interactive
                  way. We have designed a mobile application, "WaffleStock”, especially for the ”Student Managed
                  Investment Fund” course. We believe in the idea of “Practice Makes Perfect”. Therefore, we are
                  allowing the students to practice trading without negative consequences.
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      <div className="waffle">
        <Container className="waffle-width ">
          <Row>
            <Col>
              <h2 className="waffle-heading">Using WaffleStock</h2>
              <p className="waffle-para">
                Users get 1 million hypothetical dollars to invest however they want. The app will display their
                returns, portfolio analysis, geographic and sector breakdown, and other financial tools that help
                students better understand the market. On the platform, users can interact with each other; they can
                post, create groups and be a part of the nationwide competition for the highest returns. WaffleStock
                provides live data on stocks from more than 5 different exchanges, along with the stocks’ financial
                metrics and reports.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="mobile">
        <Container>
          <Row>
            <Col className="mobile-box" md={6}>
              <h1 className="mobile-heading pb-2">What If Scenarios</h1>
              <p className="pe-5 mobile-para">
                WaffleStock also offers “What If Scenarios”, where users can create a scenario and test how the outcomes
                affect people’s portfolios.
              </p>
            </Col>
            <Col></Col>
            <Col className="img-back" md={5}>
              <img src="./images/mobile.png" alt="" className="img-fluid bord-radius" />
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="circle">
        <Row>
          <Col className="" md={5}>
            <img src="./images/circle.png" alt="" className="img-fluid circle-img" />
          </Col>
          <Col></Col>
          <Col className="circle-box" md={6}>
            <h1 className="circle-heading pb-2">Mission Statement</h1>
            <p className=" circle-para">
              We create a healthy competitive environment for SMIF students to practice trading, understand the market,
              learn from each other and make connections. Our goal is to make students comfortable in the stock market
              and have enough practice to make intelligent trading decisions in the real world.
            </p>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default WhatWeDo;
