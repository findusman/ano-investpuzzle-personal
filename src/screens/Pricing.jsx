import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
import SemesterPricing from "../components/SemesterPricing";
import YearlyPricing from "../components/YearlyPricing";

const Pricing = () => {
  const [show, setShow] = useState(null);

  const ToggleData = () => {
    setShow(!show);
  };
  return (
    <>
      <FormContainer
        formTitle="Pricing"
        formDescription="Instant Access. Cancel anytime."
      >
        {/* <div className="col-md-6 offset-md-3">
          <div className="btn-div offset-sm-2 col-8 offset-sm-2">
            {show ? (
              <div className="d-flex align-items-center">
                <div className="col-6 ms-2">
                  <button className="btn btn11 bg-light" onClick={ToggleData}>
                    Semester
                  </button>
                </div>
                <div className="col-6 ms-5">
                  <button className="btn btn10" disabled>
                    Yearly
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <div className="col-6">
                  <button className="btn btn8" disabled>
                    Semester
                  </button>
                </div>
                <div className="col-6 me-0">
                  <button className="btn btn9 bg-light " onClick={ToggleData}>
                    Yearly <span className="font3">Save 20%</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div> */}

        <div className="container">
          <div className="row mx-2">
            <div className="offset-md-3 col-md-6 col-lg-4 offset-lg-4 col-bg p-1">
              {show ? (
                <div className="d-flex align-items-center">
                  <div className="col-6  d-grid">
                    <button
                      className="btn btn11 bg-light py-3 px-4"
                      onClick={ToggleData}
                    >
                      Semester
                    </button>
                  </div>
                  <div className="col-6 me-5 d-grid">
                    <button className="btn btn10" disabled>
                      Yearly
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <div className="col-6 me-0 d-grid">
                    <button className="btn btn8" disabled>
                      Semester
                    </button>
                  </div>
                  <div className="col-6 me-0 d-grid">
                    <button
                      className="btn btn9 bg-light py-3 px-4"
                      onClick={ToggleData}
                    >
                      Yearly <span className="font3">Save 20%</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FormContainer>
      {show ? <YearlyPricing /> : <SemesterPricing />}
    </>
  );
};

export default Pricing;
