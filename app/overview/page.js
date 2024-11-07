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
    vcs: [],
    device: [] /* SLD, MLD 구분이 가능해지면 추후 관련된 데이터 추가 필요 */,
    ppb: [],
  });
  const [eventData, setEventData] = useState({
    virtualCxlSwitchId: null,
    vppbId: null,
    physicalPortId: null,
    ld: null,
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
      });

      setNodes(initialNodes);
    }
  }, [portData, deviceData, vcsData, socket]);

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
    const parts = id.split("_");
    const result = {
      [parts[0]]: parts[1],
      [parts[2]]: parts[3],
      [parts[4]]: parts[5],
      [parts[6]]: parts[7],
      [parts[8]]: parts[9],
      [parts[10]]: parts[11],
      [parts[12]]: parts[13],
    };
    if (!result.vppb) {
      return;
    }

    if (!result.type === "vppbForPPB" || !result.type === "ppb") {
      console.log("This function is not supported");
      return;
    }
    if (result.type === "vppbForPPB") {
      const newVirtualCxlSwitchId = result["vcs"];
      const newVppbId = result["vppb"];

      setEventData((prev) => ({
        ...prev,
        virtualCxlSwitchId: result["vcs"],
        vppbId: result["vppb"],
      }));
      console.log("vcs: ", newVirtualCxlSwitchId);
      console.log("vppbId: ", newVppbId);
      socket.emit(
        "vcs:unbind",
        {
          virtualCxlSwitchId: newVirtualCxlSwitchId,
          vppbId: newVppbId,
        },
        (args) => {
          if (args.error) {
            setOpen({
              ...open,
              loading: false,
            });
            showError(args.error, vppb);
            return;
          }
          console.log("args: ", args);
          setEventData((prev) => ({
            ...prev,
            virtualCxlSwitchId: null,
            vppbId: null,
          }));
          // handleClose();
          // handleRefresh();
        }
      );
    }
    // else if (result.type === "ppb") {
    //   if (!eventData.virtualCxlSwitchId || !eventData.vppbId) {
    //     return;
    //   }
    //   setEventData((prev) => ({
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
