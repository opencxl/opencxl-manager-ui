"use client";

import "@xyflow/react/dist/style.css";
import Host from "./_components/Host";
import CXLSwitch from "./_components/CXLSwitch";
import LogicalDevice from "./_components/LogicalDevice";
import { useSocket } from "../_components/providers/socket-provider";
import { useEffect, useState } from "react";

// 완성 후에 RootLayout 은 따로 두고, 이 페이지는 page로 옮기자
export default function Overview() {
  const { socket } = useSocket();
  const [portData, setPortData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [vcsData, setVCSData] = useState([]);
  const [displayData, setDisplayData] = useState({
    host: [],
    vcs: [],
    device: [] /* SLD, MLD 구분이 가능해지면 추후 관련된 데이터 추가 필요 */,
  });

  console.log("port: ", portData);
  console.log("device: ", deviceData);
  console.log("vcs: ", vcsData);
  console.log("displayData: ", displayData);

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

  useEffect(() => {
    const host = [];
    const vcs = [];
    const device = [];

    portData.forEach((port) => {
      if (port.currentPortConfigurationState === "USP") {
        if (port.ltssmState === "L0") {
          host.push({ portType: "USP", portId: port.portId });
        } else {
          host.push(null);
        }
      } else if (port.currentPortConfigurationState === "DSP") {
        if (port.ltssmState === "L0") {
          device.push({
            portType: "DSP",
            portId: port.portId,
            boundVPPBId: null,
          });
        } else {
          device.push(null);
        }
      }
    });

    vcsData.forEach((data) => {
      data.ppb_info_list.forEach((vppb) => {
        if (vppb.bindingStatus === "UNBOUND") {
          vcs.push({
            uspId: data.uspId,
            vppb: { ...vppb, hostId: null, boundPortId: null },
          });
        } else if (vppb.bindingStatus === "BOUND_LD") {
          vcs.push({ uspId: data.uspId, vppb: vppb });
        }
      });
    });

    device.forEach((deviceInfo) => {
      const boundVppb = vcs.find(
        (vcsInfo) => deviceInfo.portId === vcsInfo.vppb.boundPortId
      );
      if (boundVppb && boundVppb.vppb) {
        deviceInfo.boundVPPBId = boundVppb.vppb.vppbId;
        deviceInfo.hostId = boundVppb.uspId;
      }
    });

    setDisplayData({
      host,
      vcs,
      device,
    });
  }, [portData, vcsData]);

  return (
    <div className="w-screen h-screen bg-gray-200 flex flex-col justify-center items-center">
      {/* <Host />
      <CXLSwitch />
      <LogicalDevice /> */}
    </div>
  );
}
