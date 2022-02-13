import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { MainNav } from "./Nav";
import Footer from "./Footer";
import SolanaBadge from "./SolanaBadge";
import colors from "../utils/colors";

const Shell = ({ attributeFreepik, children }) => {
  const { pathname } = useLocation();

  // scroll to top of page when pathname changes
  // but not in dev mode, because it leads to bad DX
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="">
      <MainNav />
      <div className="" style={{ minHeight: "" }}>
        {children}
      </div>
      <SolanaBadge />
      {/* <Footer />
       */}
    </div>
  );
};

export default Shell;
