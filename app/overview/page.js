"use client";

import "./style.css";
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
    vcs: [],
    device: [] /* SLD, MLD 구분이 가능해지면 추후 관련된 데이터 추가 필요 */,
    ppb: [],
  });
  const [socketEventData, setSocketEventData] = useState({
    virtualCxlSwitchId: null,
    vppbId: null,
    physicalPortId: null,
    ld: null,
  });
  const [availableNode, setAvailableNode] = useState({
    vcs: null,
    vppb: null,
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
      processInitialNodes({
        host,
        vcs,
        ppb,
        device,
        initialNodes,
        availableNode,
      });

      setNodes(initialNodes);
    }
  }, [portData, deviceData, vcsData, socket, availableNode]);

  useEffect(() => {
    const initialEdges = [];
    processInitialEdges({
      nodes,
      initialEdges,
    });
    setEdges(initialEdges);
  }, [nodes]);

  const handleClickNode = (node) => {
    console.log("node: ", node.data);
    if (node.data.type === "vppb") {
      if (availableNode.vppb) {
        setAvailableNode({ vcs: null, vppb: null, ppb: [] });
      } else {
        const availablePPB = ppb.filter(
          (data) => data.boundVPPBId.length === 0
        );
        setAvailableNode({
          vcs: node.data.virtualCxlSwitchId,
          vppb: node.data,
          ppb: [...availablePPB],
        });
      }
      // setSocketEventData({
      //   virtualCxlSwitchId: node.data.virtualCxlSwitchId,
      //   vppbId: node.data.vppb.vppbId,
      // })
    }
    // if (node가 vppb 일때) {
    //   if(vppb가 ppb와 연결됨) {
    //     unbind
    //   } else {
    //     연결 가능한 ppb 선택
    //   }
    // } else if (node가 ppb 일때) {
    //   // SLD, MLD 처리 모두
    //   if(ppb가 vppb와 연결됨) {
    //     MLD 처리 로직으로 가기
    //     LD를 클릭할 수 있음.
    //     openDialog - 여기서 바인드하기
    //   } else if (ppb가 vppb와 연결 안되었지만, 연결할 vppb가 선택되어 있음) {
    //     SLD 또는 MLD bind
    //     openDialog - 여기서 바인드하기
    //   } else {
    //     아무일도 이어나지 않음 // ppb가 vppb와 연결 x, 연결할 vppb도 선택 x
    //     vppb선택해야한다는 알림? 또는 활성화x
    //   }
    // }
    // if (!result.type === "vppbForPPB" || !result.type === "ppb") {
    //   console.log("This function is not supported");
    //   return;
    // }
    // if (result.type === "vppbForPPB") {
    //   const newVirtualCxlSwitchId = result["vcs"];
    //   const newVppbId = result["vppb"];

    //   // setSocketEventData((prev) => ({
    //   //   ...prev,
    //   //   virtualCxlSwitchId: result["vcs"],
    //   //   vppbId: result["vppb"],
    //   // }));
    //   console.log("vcs: ", typeof newVirtualCxlSwitchId);
    //   console.log("vppbId: ", typeof Number(newVppbId));
    //   socket.emit(
    //     "vcs:unbind",
    //     {
    //       virtualCxlSwitchId: Number(newVirtualCxlSwitchId),
    //       vppbId: Number(newVppbId),
    //     },
    //     (args) => {
    //       if (args.error) {
    //         setOpen({
    //           ...open,
    //           loading: false,
    //         });
    //         showError(args.error, vppb);
    //         return;
    //       }
    //       console.log("args: ", args);
    //       setSocketEventData((prev) => ({
    //         ...prev,
    //         virtualCxlSwitchId: null,
    //         vppbId: null,
    //       }));
    //       // handleClose();
    //       // handleRefresh();
    //     }
    //   );
    // }
    // else if (result.type === "ppb") {
    //   if (!socketEventData.virtualCxlSwitchId || !socketEventData.vppbId) {
    //     return;
    //   }
    //   setSocketEventData((prev) => ({
    //     ...prev,
    //     physicalPortId: result["ppb"],
    //   }));
    //   // 모달 띄우기

    // }

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

  return (
    <div className="w-full h-screen overflow-x-auto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgeschange}
        nodesDraggable={false}
        viewport={{ zoom: 1 }}
        onNodeClick={handleClickNode}
        deleteKeyCode={null}
      />
    </div>
  );
}
