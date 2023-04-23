import React from "react";
import PricingCard from "./PricingCard";

const SemesterPricing = () => {
  const descriptionList = [
    `15,000+ stock data`,
    `5 different exchanges`,
    `Portfolio Analysis`,
    `Ranking`,
    `Daily News`,
    `Upcoming IPOs`,
    `What if Scenarios`,
    `Cancel Anytime`,
  ];
  const name = [`Small Cap`, `Mid Cap`, `Large Cap`];
  const pricing = [`$4,900`, `$7,500`, `$10,000`];

  return (
    <>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-4 col-sm-12">
            <div className=" m-3 border rounded-5">
              <div className="py-3 ps-4">
                <PricingCard
                  name={name[0]}
                  pricing={pricing[0]}
                  time="per semester"
                  users="0-20 Users"
                  list={descriptionList}
                ></PricingCard>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-12">
            <div className=" m-3 border rounded-5">
              <div className="py-3 ps-4">
                <PricingCard
                  name={name[1]}
                  pricing={pricing[1]}
                  time="per semester"
                  users="21-40 Users"
                  list={descriptionList}
                ></PricingCard>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 ">
            <div className=" m-3 border rounded-5">
              <div className="py-3 ps-4">
                <PricingCard
                  name={name[2]}
                  pricing={pricing[2]}
                  time="per semester"
                  users="40+ Users"
                  list={descriptionList}
                ></PricingCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SemesterPricing;
