"use client";

import React from "react";

import "@xyflow/react/dist/style.css";
import { DialogProvider } from "./_components/Dialog";

const Layout = ({ children, host, ld, cxlswitch }) => {
  return (
    <>
      {children}
      {host}
      {ld}
      {cxlswitch}
    </>
  );
};

export default Layout;
