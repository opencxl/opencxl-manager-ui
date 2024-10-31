"use client";

import { useState, useEffect, Suspense } from "react";
import { Typography } from "antd";
import { useSocket } from "@/app/_components/providers/socket-provider";
import FabricManagerUI from "../_components/FabricManagerUI";
import SideMenu from "../_components/navigation/SideMenu";
const { Title } = Typography;

const NoStatus = () => (
  <Title type="secondary" level={5}>
    No VCS Information
  </Title>
);

const MemoryPollingStatus = () => {
  const { socket } = useSocket();
  const [vcsData, setVCSData] = useState([]);
  const [portData, setPortData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const getDevice = () => {
      socket.emit("device:get", (data) => {
        setDeviceData(data["result"]);
        console.log("device:get ", data);
      });
    };
    const getPort = () => {
      socket.emit("port:get", (data) => {
        setPortData(data["result"]);
        console.log("port:get ", data);
      });
    };
    const getVCS = () => {
      socket.emit("vcs:get", (data) => {
        setVCSData(data["result"]);
        console.log("vcs:get ", data);
      });
    };
    getDevice();
    getPort();
    getVCS();
    socket.on("device:updated", () => getDevice());
    socket.on("port:updated", () => getPort());
    socket.on("vcs:updated", () => getVCS());
    return () => {
      socket.off("device:updated");
      socket.off("port:updated");
      socket.off("vcs:updated");
    };
  }, [socket, refresh]);

  return (
    <>
      <SideMenu>
        {vcsData.length === 0 ? (
          <NoStatus />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              // backgroundColor: "#133036",
            }}
          >
            {vcsData.map((vcs, index) => {
              return (
                <FabricManagerUI
                  vcs={vcs}
                  vcses={vcsData}
                  ports={portData}
                  devices={deviceData}
                  handleRefresh={() => setRefresh(!refresh)}
                  key={index}
                />
              );
            })}
          </div>
        )}
      </SideMenu>
    </>
  );
};

export default MemoryPollingStatus;
