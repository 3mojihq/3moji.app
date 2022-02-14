import React from "react";
import Shell from "../components/Shell";

import heroImage from "../images/app/hero.png";
import "./landing.css";

const Landing = () => {
  return (
    <Shell>
      <article class="vh-75 dt center">
        <div class="dtc v-mid tc">
          <img src={heroImage} className="h3 h4-m h5-l" />
          <div class="pv1 ph3 f6 f4-m f3-l black-60 tc glowing-box ba b--near-white">
            NFTs will never be the same again
          </div>
        </div>
      </article>
    </Shell>
  );
};

export default Landing;
