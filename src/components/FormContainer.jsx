import React from "react";

const FormContainer = ({ formTitle, formDescription, children }) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="mt-5 mb-4">
              <h1 className="form-heading text-center">{formTitle}</h1>
              <h1 className="font6 text-center">{formDescription}</h1>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

export default FormContainer;
