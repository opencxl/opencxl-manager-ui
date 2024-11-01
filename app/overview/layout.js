"use client";

import React from "react";
import "@xyflow/react/dist/style.css";

const Layout = ({ host, ld, cxlswitch }) => {
  return (
    <div className="w-screen h-screen bg-gray-200 flex flex-col justify-center items-center">
      {host}
      {cxlswitch}
      {ld}
    </div>
  );
};

export default Layout;
