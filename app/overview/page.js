"use client";

import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { useSocket } from "../_components/providers/socket-provider";
import { useCXLSocket } from "./_hooks/useCXLSocket";
import { processCXLSocketData } from "./_utils/processCXLSocketData";
import { ReactFlow, useNodesState } from "@xyflow/react";
import { Input } from "antd";
// import Host from "./_components/Host";
// import CXLSwitch from "./_components/CXLSwitch";
// import LogicalDevice from "./_components/LogicalDevice";

// 완성 후에 RootLayout 은 따로 두고, 이 페이지는 page로 옮기자
export default function Overview() {
  const { socket } = useSocket();
  const { portData, deviceData, vcsData } = useCXLSocket(socket);
  const { host, vcs, device, ppb } = processCXLSocketData({
    portData,
    vcsData,
  });
  const [displayData, setDisplayData] = useState({
    host: [],
    // vppb로 이름 바꾸기
    vcs: [],
    device: [] /* SLD, MLD 구분이 가능해지면 추후 관련된 데이터 추가 필요 */,
    ppb: [],
  });

  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgeschange] = useNodesState();

  //   console.log("port: ", portData);
  //   console.log("device: ", deviceData);
  //   console.log("vcs: ", vcsData);
  //   console.log("displayData: ", displayData);

  useEffect(() => {
    setDisplayData({
      host: host,
      vcs: vcs,
      device: device,
      ppb: ppb,
    });
  }, [portData, vcsData, deviceData]);

  useEffect(() => {
    const containerWidth = window.innerWidth;

    /* Host */
    const boxWidth = 180;
    const totalBoxWidth = host.length * boxWidth;
    const remainingSpace = containerWidth - totalBoxWidth;
    const gap = remainingSpace / (host.length + 1);

    /* VCS */
    const vcsBoxWidth = containerWidth * 0.95;
    const startVCSBox = (containerWidth - vcsBoxWidth) / 2;

    const initialNodes = [];
    const initialEdges = [];

    if (host && vcs && device) {
      const vcsGroup = {
        id: "vcs",
        type: "group",
        position: { x: startVCSBox, y: 143 },
        style: {
          width: "95%",
          height: "55%",
          backgroundColor: "#0c1320", //D1F05C
          border: "2px solid #D1F05C",
          borderRadius: 53,
        },
      };

      // Host 개수별로 생겨야함
      const vppbGroup = {
        id: "vppb",
        type: "group",
        position: { x: 0, y: 40 },
        style: { width: "30%", height: "20%" },
        parentId: "vcs",
        extend: "parent",
      };

      // Host 개수별로 생겨야함
      const ppbGroup = {
        id: "ppb",
        type: "group",
        position: { x: 0, y: 360 },
        style: { width: "20%", height: "10%" },
        parentId: "vcs",
        extend: "parent",
      };
      initialNodes.push(vcsGroup, vppbGroup, ppbGroup);

      host.map((data, index) => {
        initialNodes.push({
          id: `host${data.portId}`,
          position: { x: gap + index * (boxWidth + gap), y: 43 },
          data: { ...data, type: "host", label: `Host ${data.portId}` },
          type: "input",
          style: {
            width: "180px",
            height: "60px",
            backgroundColor: "#5452F6",
            border: "none",
            borderRadius: "8px",
            boxShadow: "5px 5px 1px #30328B",
          }, // FF5A43
        });
      });
      vcs.map((data, index) => {
        data.hostPort
          ? initialNodes.push({
              id: `host${data.uspId}_vppb${data.vppb.vppbId}`,
              position: { x: gap + index * (boxWidth + gap), y: 40 },
              data: {
                ...data,
                type: "vppb",
                label: "vPPB USP",
              },
              style: {
                width: "180px",
                height: "60px",
                backgroundColor: "#ACA9F1",
                border: "none",
                borderRadius: "8px",
                boxShadow: "5px 5px 1px #565478",
              },
              parentId: "vppb",
              extend: "parent",
            })
          : initialNodes.push({
              id: `host${data.uspId}_vppb${data.vppb.vppbId}`,
              position: { x: (index - 1) * 200, y: 180 }, // vsc 위치에 맞추서 수정 필요
              data: {
                ...data,
                type: "vppb",
                label: `vPPB ${data.vppb.vppbId}`,
              },
              style: {
                width: "180px",
                height: "60px",
                backgroundColor: "#ACA9F1",
                border: "none",
                borderRadius: "8px",
                boxShadow: "5px 5px 1px #565478",
              },
              parentId: "vppb",
              extend: "parent",
            });
      });
      ppb.map((data, index) => {
        initialNodes.push({
          id: `ppb${data.portId}`,
          position: { x: (index + 1) * 200, y: 40 },
          data: { ...data, type: "ppb", label: `PPB` },
          style: {
            width: "180px",
            height: "60px",
            backgroundColor: "#ACA9F1",
            border: "none",
            borderRadius: "8px",
            boxShadow: "5px 5px 1px #565478",
          },
          parentId: "ppb",
          extend: "parent",
        });
      });
      device.map((data, index) => {
        initialNodes.push({
          id: `device${data.portId}`,
          type: "output",
          position: { x: (index + 1) * 200, y: 723 },
          data: { ...data, type: "device", label: `Device ${data.portId}` },
          style: {
            width: "180px",
            height: "60px",
            backgroundColor: "#BADCF9",
            border: "none",
            borderRadius: "8px",
            boxShadow: "5px 5px 1px #63778D",
          },
        });
      });
      // console.log("nodes: ", initialNodes);
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [portData, vcsData, deviceData]);

  return (
    <div className="w-screen h-screen bg-gray-200 flex flex-col gap-28 justify-center items-center bg-[#0c1320]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgeschange}
        nodesDraggable={false} // 노드 고정
        viewport={{ zoom: 1 }} // 스크롤로 확대 축소 금지
        // onNodeClick={handleNode}
        deleteKeyCode={null} // Delete 안되도록 설정
      />
      {/* <div className="flex gap-10 justify-center items-center">
        {host.map((hostInfo, index) => {
          return (
            <div key={index} className="bg-orange-200">
              Host {hostInfo.portId}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-6 justify-center items-center bg-white">
        <div className="flex gap-20 justify-center items-center">
          {vcs.map((data) => (data.hostPort ? <div>Host vppb</div> : null))}
        </div>
        <h1>CXL Swicth</h1>
        <div className="flex gap-20 justify-center items-center">
          {vcsData.map((vcsInfo) => {
            return (
              <div className="flex flex-col gap-6 justify-center items-center">
                VCS {vcsInfo.virtualCxlSwitchId}
                <div className="flex gap-6 justify-center items-center">
                  {vcsInfo.ppb_info_list.map((vppb) => {
                    return (
                      <div className="bg-orange-200">vppb {vppb.vppbId}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-10 justify-center items-center">
        {device.map((deviceInfo) => {
          return (
            <div className="bg-orange-200 flex flex-col gap-10 justify-center items-center">
              <div>PPB</div>
              <div>Device {deviceInfo.deviceSerialNumber}</div>
            </div>
          );
        })}
      </div> */}
      {/* <Host />
      <CXLSwitch />
      <LogicalDevice /> */}
    </div>
  );
}
