"use client";

import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { useSocket } from "../_components/providers/socket-provider";
import { useCXLSocket } from "./_hooks/useCXLSocket";
import { processCXLSocketData } from "./_utils/processCXLSocketData";
import { ReactFlow, useNodesState } from "@xyflow/react";
import { processInitialNodes } from "./_utils/processInitialNodes";
import { processInitialEdges } from "./_utils/processInitialEdges";

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

  useEffect(() => {
    setDisplayData({
      host: host,
      vcs: vcs,
      device: device,
      ppb: ppb,
    });
  }, [portData, vcsData, deviceData]);

  useEffect(() => {
    if (host.length && vcs.length && ppb.length && device.length) {
      const initialNodes = [];
      const containerWidth = window.innerWidth;
      processInitialNodes({
        host,
        vcs,
        ppb,
        device,
        containerWidth,
        initialNodes,
      });

      setNodes(initialNodes);
    }
  }, [portData, deviceData, vcsData]);

  useEffect(() => {
    const initialEdges = [];
    processInitialEdges({
      nodes,
      initialEdges,
    });
    setEdges(initialEdges);
  }, [nodes]);

  return (
    <div className="w-screen h-screen bg-gray-200 flex flex-col gap-28 justify-center items-center !bg-[#0c1320]">
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
    </div>
  );
}
