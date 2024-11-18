"use client";

import { ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import Dialog from "./_components/Dialog/Dialog";
import DeviceTooltip from "./_components/Tooltip/Tooltip";
import { useSocket } from "./_components/providers/socket-provider";
import { useCXLSocket } from "./_hooks/useCXLSocket";
import { processCXLSocketData } from "./_utils/processCXLSocketData";
import { processInitialEdges } from "./_utils/processInitialEdges";
import { processInitialNodes } from "./_utils/processInitialNodes";
import "./style.css";

export default function Overview() {
  const { socket } = useSocket();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);

  const { portData, deviceData, vcsData, mldData } = useCXLSocket(socket);
  const { host, vcs, device, ppb } = processCXLSocketData({
    portData,
    vcsData,
    deviceData,
    mldData,
  });
  const [displayData, setDisplayData] = useState({
    host: [],
    vcs: [],
    device: [],
    ppb: [],
  });
  const [socketEventData, setSocketEventData] = useState({
    virtualCxlSwitchId: null,
    vppbId: null,
    physicalPortId: null,
    ldId: null,
    eventName: null,
  });
  const [availableNode, setAvailableNode] = useState({
    vcs: null,
    vppb: null,
    ppb: [],
  });
  const [availableLD, setAvailableLD] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();

  useEffect(() => {
    setDisplayData({
      host: host,
      vcs: vcs,
      device: device,
      ppb: ppb,
    });
  }, [portData, vcsData, deviceData, mldData]);

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
        availableLD,
      });
      setNodes(initialNodes);
    }

    const initialEdges = [];
    processInitialEdges({
      nodes,
      initialEdges,
    });
    setEdges(initialEdges);
  }, [
    portData,
    deviceData,
    vcsData,
    mldData,
    socket,
    availableNode,
    availableLD,
  ]);

  const handleClickNode = (_, node) => {
    if (node.data?.type === "vppbForPPB") {
      if (availableNode.vppb) {
        setAvailableNode({ vcs: null, vppb: null, ppb: [] });
        setAvailableLD(null);
      } else {
        if (node.data.vppb.bindingStatus === "BOUND_LD") {
          const availableDevice = device.find(
            (data) => data.portId === node.data.vppb.boundPortId
          );
          setAvailableNode({
            vcs: node.data.virtualCxlSwitchId,
            vppb: node.data,
            ppb: [availableDevice],
          });
          if (availableDevice.deviceType === "MLD") {
            setAvailableLD(availableDevice.logicalDevices.boundLdId);
          }
        } else {
          const availableDevice = device.filter(
            (data) =>
              data.boundVPPBId.length === 0 ||
              (data.deviceType === "MLD" &&
                data.logicalDevices.numberOfLds >
                  data.logicalDevices.boundLdId.length)
          );
          setAvailableNode({
            vcs: node.data.virtualCxlSwitchId,
            vppb: node.data,
            ppb: [...availableDevice],
          });

          if (availableDevice.deviceType === "MLD") {
            setAvailableLD(data.logicalDevices.boundLdId);
          }
        }
      }
    } else if (node.data?.type === "device") {
      if (node.data?.deviceType === "SLD") {
        if (availableNode.vppb) {
          if (
            node.data.boundVPPBId.some(
              (data) => data === availableNode?.vppb?.vppb.vppbId
            )
          ) {
            setSocketEventData({
              virtualCxlSwitchId: Number(availableNode.vcs),
              vppbId: Number(availableNode.vppb.vppb.vppbId),
              eventName: "unbinding",
            });
            openDialog();
          } else {
            setSocketEventData({
              virtualCxlSwitchId: Number(availableNode.vcs),
              vppbId: Number(availableNode.vppb?.vppb.vppbId),
              physicalPortId: Number(node.data.portId),
              eventName: "binding",
            });
            openDialog();
          }
        }
      }
    } else if (node.data?.type === "logicalDevice") {
      if (!availableNode.vcs && !availableNode.vppb) return;
      if (
        availableNode.vppb?.vppb.boundPortId === node.data.mld.portId &&
        availableNode.vppb?.vppb.boundLdId === node.data.ldId
      ) {
        setSocketEventData({
          virtualCxlSwitchId: Number(availableNode.vcs),
          vppbId: Number(availableNode.vppb.vppb.vppbId),
          eventName: "unbinding",
        });
        openDialog();
      } else if (!availableNode.vppb?.vppb.boundPortId) {
        setSocketEventData({
          virtualCxlSwitchId: Number(availableNode.vcs),
          vppbId: Number(availableNode.vppb?.vppb.vppbId),
          physicalPortId: Number(node.data.mld.portId),
          ldId: Number(node.data.ldId),
          eventName: "binding",
        });
        openDialog();
      }
    }
  };

  const handleSocketEvent = () => {
    if (!socketEventData.physicalPortId) {
      socket.emit(
        "vcs:unbind",
        {
          virtualCxlSwitchId: socketEventData.virtualCxlSwitchId,
          vppbId: socketEventData.vppbId,
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
          setAvailableNode({ vcs: null, vppb: null, ppb: [] });
        }
      );
    } else {
      socket.emit(
        "vcs:bind",
        {
          virtualCxlSwitchId: socketEventData.virtualCxlSwitchId,
          vppbId: socketEventData.vppbId,
          physicalPortId: socketEventData.physicalPortId,
          ldId: socketEventData.ldId || null,
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
          setAvailableNode({ vcs: null, vppb: null, ppb: [] });
        }
      );
    }
    closeDialog();
  };

  const handleMouseEnter = (_, node) => {
    if (node.data?.type === "device") {
      setIsTooltipOpen(true);
      setTooltipData(node);
      return;
    }
  };

  const handleMouseLeave = (_, node) => {
    if (node.data?.type === "device") {
      setIsTooltipOpen(false);
      setTooltipData(null);
      return;
    }
  };

  return (
    <>
      <div className="w-full h-screen overflow-x-auto z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleClickNode}
          onNodeMouseEnter={handleMouseEnter}
          onNodeMouseLeave={handleMouseLeave}
          viewport={{ zoom: 1 }}
          nodesDraggable={false}
          deleteKeyCode={null}
        ></ReactFlow>
        <Dialog
          isOpen={isDialogOpen}
          closeDialog={closeDialog}
          socketEventData={socketEventData}
          handleSocketEvent={handleSocketEvent}
        />
      </div>
      <DeviceTooltip isOpen={isTooltipOpen} node={tooltipData} />
    </>
  );
}
