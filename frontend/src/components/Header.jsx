import React from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" fixed="top" className="header-main  bg-light ">
      <Container className="py-3 ">
        <Navbar.Brand href="/" className=" text-color brand">
          Invest Puzzle
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mx-auto ">
            <Nav.Link href="/home" className="text-color pe-5">
              Home
            </Nav.Link>
            <Nav.Link href="/whatWeDo" className="text-color pe-5">
              What We Do
            </Nav.Link>
            <Nav.Link href="/aboutUs" className="text-color pe-5">
              About Us
            </Nav.Link>
            <Nav.Link href="/pricing" className="text-color">
              Plans
            </Nav.Link>
          </Nav>

          <div className="d-flex">
            <Nav.Link as={NavLink} to="/signIn">
              <Button className=" me-4 signUp-button button-color">Sign In</Button>
            </Nav.Link>

            <Nav.Link as={NavLink} to="/pricing">
              <Button className=" me-4 signUp-button" variant="outline-dark">
                Sign Up
              </Button>
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
