"use client";

import { useEffect, useState } from "react";

export const useCXLSocket = (socket) => {
  const [portData, setPortData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [vcsData, setVCSData] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const getDeviceData = () => {
      socket.emit("device:get", (data) => {
        setDeviceData(data["result"]);
      });
    };
    const getPortData = () => {
      socket.emit("port:get", (data) => {
        setPortData(data["result"]);
      });
    };
    const getVCSData = () => {
      socket.emit("vcs:get", (data) => {
        setVCSData(data["result"]);
      });
    };
    getDeviceData();
    getPortData();
    getVCSData();
    socket.on("device:updated", () => getDeviceData());
    socket.on("port:updated", () => getPortData());
    socket.on("vcs:updated", () => getVCSData());
    return () => {
      socket.off("device:updated");
      socket.off("port:updated");
      socket.off("vcs:updated");
    };
  }, [socket]);

  return {
    portData,
    deviceData,
    vcsData,
  };
};
