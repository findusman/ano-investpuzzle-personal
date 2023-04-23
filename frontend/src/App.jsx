import React from "react";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import SignIn from "./screens/SignIn";
import Registration from "./screens/Registration";
import Payment from "./screens/Payment";
import EmailVerification from "./screens/EmailVerification";
import AccessCode from "./screens/AccessCode";
import Pricing from "./screens/Pricing";
import WhatWeDo from "./screens/WhatWeDo";
import AboutUs from "./screens/AboutUs";

const App = () => {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/emailVerification" element={<EmailVerification />} />
          <Route path="/accessCode" element={<AccessCode />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/whatWeDo" element={<WhatWeDo />} />
          <Route path="/aboutUs" element={<AboutUs />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
