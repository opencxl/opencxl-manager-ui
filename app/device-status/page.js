"use client";

import { useEffect, useReducer } from "react";
import { Table, Space, Tag } from "antd";
import { useSocket } from "@/app/_components/providers/socket-provider";
import SideMenu from "../_components/navigation/SideMenu";

const columns = [
  {
    title: "Serial Number",
    dataIndex: "deviceSerialNumber",
    key: "deviceSerialNumber",
  },
  {
    title: "PCIe",
    children: [
      {
        title: "Vendor ID",
        dataIndex: "pcieVendorId",
        key: "pcieVendorId",
      },
      {
        title: "Device ID",
        dataIndex: "pcieDeviceId",
        key: "pcieDeviceId",
      },
      {
        title: "Subsystem Vendor ID",
        dataIndex: "pcieSubsystemVendorId",
        key: "pcieSubsystemVendorId",
      },
      {
        title: "Subsystem ID",
        dataIndex: "pcieSubsystemId",
        key: "pcieSubsystemId",
      },
    ],
  },
  {
    title: "Downstream Port",
    dataIndex: "boundPortId",
    key: "boundPortId",
    render: (text, record, index) => (
      <span key={`port-${index}`}>
        {text ? (
          <Space size={10}>
            <span>DSP {text}</span>
            {record.boundStatus && record.boundStatus.bound ? (
              <Tag color="green">
                {`Bound with VCS ${record.boundStatus.vcsId} ` +
                  `vPPB ${record.boundStatus.vppbId}`}
              </Tag>
            ) : (
              <Tag color="blue">Unbound</Tag>
            )}
          </Space>
        ) : (
          "-"
        )}
      </span>
    ),
  },
  {
    title: "Total Capacity",
    dataIndex: "totalCapacity",
    key: "totalCapacity",
    render: (text, record, index) => (
      <span key={`capacity-${index}`}>{parseInt(text) * 256} MB</span>
    ),
  },
];

const DeviceStatus = () => {
  const { socket } = useSocket();

  const processDevices = (deviceData, vcsData) => {
    return deviceData.map((device) => {
      if (device.boundPortId) {
        device.boundStatus = {};
        vcsData.forEach((vcs) => {
          vcs.vppbs.forEach((vppb, index) => {
            if (vppb.boundPortId === device.boundPortId) {
              device.boundStatus = {
                bound: true,
                vcsId: vcs.virtualCxlSwitchId,
                vppbId: index,
              };
            }
          });
        });
      }
      return device;
    });
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "UPDATE_VCS":
        return {
          vcsData: action.payload,
          deviceData: processDevices(state.deviceData, action.payload),
        };
      case "UPDATE_DEVICE":
        return {
          ...state,
          deviceData: processDevices(action.payload, state.vcsData),
        };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    vcsData: [],
    deviceData: [],
  });

  useEffect(() => {
    if (!socket) return;
    const getDevice = () => {
      socket.emit("device:get", (data) => {
        dispatch({ type: "UPDATE_DEVICE", payload: data["result"] });
      });
    };
    const getVCS = () => {
      socket.emit("vcs:get", (data) => {
        dispatch({ type: "UPDATE_VCS", payload: data["result"] });
      });
    };
    getDevice();
    getVCS();
    socket.on("device:updated", () => getDevice());
    socket.on("vcs:updated", () => getVCS());
    return () => {
      socket.off("device:updated");
      socket.off("vcs:updated");
    };
  }, [socket]);

  return (
    <SideMenu>
      <Table
        rowKey={(record) => record.deviceSerialNumber}
        columns={columns}
        dataSource={state.deviceData}
        bordered
      />
    </SideMenu>
  );
};
export default DeviceStatus;
