import React from "react";
import { Col, Container, Row } from "react-bootstrap";

const Footer = () => {
  return (
    <>
      <footer>
        <Container className="footer">
          <Row>
            <Col md={6}>&copy; 2023 Invest Puzzle</Col>
            <Col md={4}>info@investpuzzle.com</Col>
            <Col md={2}>703-901-3144</Col>
          </Row>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
