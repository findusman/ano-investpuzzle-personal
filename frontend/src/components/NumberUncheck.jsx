import React from "react";

const NumberUncheck = ({ number }) => {
  return (
    <>
      <div className="d-flex justify-content-center ">
        <div className="text-center checkout-link3">
          <h4 className="  fw-bold " disabled>
            {number}
          </h4>
        </div>
      </div>
    </>
  );
};
export default NumberUncheck;
