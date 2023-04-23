import React from "react";

const NumberCheck = ({ number }) => {
  return (
    <>
      <div className="d-flex justify-content-center ">
        <div className="text-center checkout-link">
          <h4 className=" fw-bold ">{number}</h4>
        </div>
      </div>
    </>
  );
};

export default NumberCheck;
