"use client";

import { useEffect, useReducer } from "react";
import { Table, Tag } from "antd";
import { useSocket } from "@/app/_components/providers/socket-provider";
import SideMenu from "../_components/navigation/SideMenu";

const columns = [
  {
    title: "Port ID",
    dataIndex: "portId",
    key: "portId",
  },
  {
    title: "Port Configuration State",
    dataIndex: "currentPortConfigurationState",
    key: "currentPortConfigurationState",
    render: (text, record, index) => {
      const colorMap = {
        USP: "blue",
        DSP: "purple",
        DISABLED: "#dddddd",
        BIND_IN_PROGRESS: "orange",
        UNBIND_IN_PROGRESS: "orange",
      };
      return (
        <Tag key={`config-state-${index}`} color={colorMap[text]}>
          {text.replaceAll("_", " ")}
        </Tag>
      );
    },
  },
  {
    title: "Connected Device Type",
    dataIndex: "connectedDeviceType",
    key: "connectedDeviceType",
    render: (text, record, index) => {
      let reformattedText = text;
      if (reformattedText) {
        if (!text.includes("CXL")) {
          reformattedText = reformattedText.replaceAll("_", " ");
          reformattedText =
            reformattedText.charAt(0).toUpperCase() +
            reformattedText.slice(1).toLowerCase();
        } else {
          reformattedText = reformattedText.replaceAll("_", " ");
        }
      } else {
        reformattedText = "-";
      }
      return (
        <span key={`device-type-${index}`}>
          {record.currentPortConfigurationState === "USP"
            ? record.ltssmState === "L0"
              ? "Host detected"
              : "No host detected"
            : reformattedText}
        </span>
      );
    },
  },
  {
    title: "Bound Status",
    dataIndex: "boundStatus",
    key: "boundStatus",
    render: (text, record, index) => {
      let status = "";
      let color = "green";
      if (text && text.bound) {
        status = `Bound with VCS ${text.vcsId}`;
        if (text.vppbId != undefined) {
          status += ` vPPB ${text.vppbId}`;
        }
      } else {
        status = "Unbound";
        color = "blue";
      }
      return (
        <span key={`bound-status-${index}`}>
          <Tag color={color}>{status}</Tag>
        </span>
      );
    },
  },
];

const PortStatus = () => {
  const { socket } = useSocket();

  const processPorts = (portData, vcsData) => {
    return portData.map((port) => {
      port.boundStatus = {};
      if (port.currentPortConfigurationState === "DSP") {
        vcsData.forEach((vcs) => {
          vcs.vppbs.forEach((vppb, index) => {
            if (vppb.boundPortId === port.portId) {
              port.boundStatus = {
                bound: true,
                vcsId: vcs.virtualCxlSwitchId,
                vppbId: index,
              };
            }
          });
        });
      } else if (port.currentPortConfigurationState === "USP") {
        vcsData.forEach((vcs) => {
          if (vcs.uspId === port.portId) {
            port.boundStatus = {
              bound: true,
              vcsId: vcs.virtualCxlSwitchId,
            };
          }
        });
      }
      return port;
    });
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_PORT":
        return {
          ...state,
          portData: processPorts(action.payload, state.vcsData),
        };
      case "UPDATE_VCS":
        return {
          vcsData: action.payload,
          portData: processPorts(state.portData, action.payload),
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    portData: [],
    vcsData: [],
  });

  useEffect(() => {
    if (!socket) return;
    const getPort = () => {
      socket.emit("port:get", (data) => {
        dispatch({ type: "UPDATE_PORT", payload: data["result"] });
      });
    };
    const getVCS = () => {
      socket.emit("vcs:get", (data) => {
        dispatch({ type: "UPDATE_VCS", payload: data["result"] });
      });
    };
    getPort();
    getVCS();
    socket.on("port:updated", () => getPort());
    socket.on("vcs:updated", () => getVCS());
    return () => {
      socket.off("port:updated");
      socket.off("vcs:updated");
    };
  }, [socket]);

  return (
    <SideMenu>
      <Table
        rowKey={(record) => record.portId}
        columns={columns}
        dataSource={state.portData}
        bordered
      />
    </SideMenu>
  );
};
export default PortStatus;
