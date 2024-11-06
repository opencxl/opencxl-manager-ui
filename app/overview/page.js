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
  // const [eventStatus, setEventStatus] = useState({
  //   sourceId: null,
  //   targetId: null,
  //   nodeId: null,
  //   tempSourceId: null,
  //   tempTargetId: null,
  // });

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
      // const containerWidth = window.innerWidth;
      processInitialNodes({
        host,
        vcs,
        ppb,
        device,
        // containerWidth,
        initialNodes,
        // eventStatus,
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

  const handleNode = (e) => {
    const id = e.currentTarget.dataset.id;
    console.log("id: ", id);

    //     socket.emit('vcs:unbind', {
    //       virtualCxlSwitchId: vcs.virtualCxlSwitchId,
    //       vppbId: Number(vppb),
    //   }, (args) => {
    //       if (args.error) {
    //           setOpen({
    //               ...open,
    //               loading: false,
    //           });
    //           showError(args.error, vppb);
    //           return;
    //       }
    //       handleClose();
    //       handleRefresh();
    //   });
    //   socket.emit('vcs:bind', {
    //     virtualCxlSwitchId: vcs.virtualCxlSwitchId,
    //     vppbId: vppb,
    //     physicalPortId: Number(open.dsp),
    // }, (args) => {
    //     if (args.error) {
    //         setOpen({
    //             ...open,
    //             loading: false,
    //         });
    //         showError(args.error, vppb);
    //         return;
    //     }
    //     handleClose();
    //     handleRefresh();
    // });
  };

  const handleMouseEnter = (e) => {
    // const id = e.currentTarget.dataset.id;
    // const parts = id.split("_");
    // const result = {
    //   [parts[0]]: parts[1],
    //   [parts[2]]: parts[3],
    //   [parts[4]]: parts[5],
    // };
    // if (!result.vppb) {
    //   return;
    // }
    // console.log("result: ", result);
  };

  return (
    <div className="w-full h-screen bg-gray-200 flex flex-col gap-28 justify-center items-center !bg-[#0c1320] overflow-x-auto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgeschange}
        nodesDraggable={false}
        viewport={{ zoom: 1 }}
        onNodeClick={handleNode}
        onNodeMouseEnter={handleMouseEnter}
        deleteKeyCode={null}
      />
    </div>
  );
}
