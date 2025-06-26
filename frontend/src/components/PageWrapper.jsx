import React from "react";
import Footer from "./Footer";

export default function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      <div className="page-content">{children}</div>
      <Footer />
    </div>
  );
}
