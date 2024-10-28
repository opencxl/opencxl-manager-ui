"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Space, FloatButton, Dropdown } from "antd";
import styled from "styled-components";
import Link from "next/link";
import { PiPlugsBold, PiPlugsConnectedBold } from "react-icons/pi";
import { FaMemory, FaLink, FaLinkSlash } from "react-icons/fa6";
import { DesktopOutlined, SyncOutlined } from "@ant-design/icons";
import { COLOR } from "../_data/color";
import BindUnbindDSP from "./BindUnbindDSP";
import AllocateDeallocateMLD from "./AllocateDeallocateMLD";

const lds = [
  { id: "1000", used: true, host: "3" },
  { id: "1001", used: false, host: null },
  { id: "1002", used: false, host: null },
  { id: "1003", used: true, host: "3" },
  { id: "1004", used: true, host: "3" },
];

const mldData = [
  {
    connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
    connectedDeviceType: "CXL_TYPE_3_SLD",
    currentLinkSpeed: 0,
    currentPortConfigurationState: "DSP",
    firstNegotiatedLaneNumber: 0,
    linkStateFlags: 0,
    ltssmState: "L0",
    maxLinkSpeed: 0,
    maximumLinkWidth: 0,
    negotiatedLinkWidth: 0,
    portId: 99,
    supportedCxlModes: 2,
    supportedLdCount: 0,
    supportedLinkSpeedsVector: 0,
  },
  {
    connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
    connectedDeviceType: "CXL_TYPE_3_SLD",
    currentLinkSpeed: 0,
    currentPortConfigurationState: "DSP",
    firstNegotiatedLaneNumber: 0,
    linkStateFlags: 0,
    ltssmState: "L0",
    maxLinkSpeed: 0,
    maximumLinkWidth: 0,
    negotiatedLinkWidth: 0,
    portId: 98,
    supportedCxlModes: 2,
    supportedLdCount: 0,
    supportedLinkSpeedsVector: 0,
  },
  {
    connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
    connectedDeviceType: "CXL_TYPE_3_SLD",
    currentLinkSpeed: 0,
    currentPortConfigurationState: "DSP",
    firstNegotiatedLaneNumber: 0,
    linkStateFlags: 0,
    ltssmState: "L0",
    maxLinkSpeed: 0,
    maximumLinkWidth: 0,
    negotiatedLinkWidth: 0,
    portId: 97,
    supportedCxlModes: 2,
    supportedLdCount: 0,
    supportedLinkSpeedsVector: 0,
  },
  {
    connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
    connectedDeviceType: "CXL_TYPE_3_SLD",
    currentLinkSpeed: 0,
    currentPortConfigurationState: "DSP",
    firstNegotiatedLaneNumber: 0,
    linkStateFlags: 0,
    ltssmState: "L0",
    maxLinkSpeed: 0,
    maximumLinkWidth: 0,
    negotiatedLinkWidth: 0,
    portId: 96,
    supportedCxlModes: 2,
    supportedLdCount: 0,
    supportedLinkSpeedsVector: 0,
  },
];

const BoardedCard = styled(Card)`
  border-color: #9c9999;
`;

const ItemCard = styled(BoardedCard)`
  text-align: center;
  width: 105px;
  z-index: 1;
  word-break: break-word;
  background-color: ${(props) => props.bgcolor};
`;

const FabricManagerUI = ({ vcs, devices, ports, vcses, handleRefresh }) => {
  // console.log("devices: ", devices);
  // console.log("ports: ", ports);
  // console.log("vcses: ", vcses);
  const [data, setData] = useState(vcs);
  const [deviceData, setDeviceData] = useState(devices);
  const [portData, setPortData] = useState(ports);
  const [vcsData, setVCSData] = useState(vcses);

  const [displayData, setDisplayData] = useState({
    hostConnected: false,
    vPPBToDSP: [],
    DSP: [],
    DSPToSLDMLD: [],
    SLD: [],
    // MLD
    MLD: [],
    processing: [],
    unBindedPort: [],
  });

  useEffect(() => setData(vcs), [vcs]);
  useEffect(() => setDeviceData(devices), [devices]);
  useEffect(() => setPortData(ports), [ports]);
  useEffect(() => setVCSData(vcses), [vcses]);
  useEffect(() => {
    let hostConnected = false;
    if (data.uspId != null) {
      const usp = portData.find((port) => port.portId === data.uspId);
      if (usp.ltssmState === "L0") {
        hostConnected = true;
      }
    }
    const vPPBToDSP = [];
    const DSP = [];
    const DSPToSLDMLD = [];
    const SLD = [];
    const processing = [];
    // MLD
    const MLD = [];
    data.vppbs.forEach((vppb) => {
      if (vppb.boundPortId) {
        processing.push(
          vppb.bindingStatus === "BIND_OR_UNBIND_IN_PROGRESS" ? true : false
        );
        vPPBToDSP.push(vppb.boundPortId);
        DSP.push(vppb.boundPortId);
        const dsp = portData.find((port) => port.portId === vppb.boundPortId);
        if (dsp.ltssmState === "L0") {
          const device = deviceData.find(
            (device) => device.boundPortId === dsp.portId
          );
          if (device) {
            DSPToSLDMLD.push(dsp.portId);
            SLD.push(device.deviceSerialNumber);
          } else {
            DSPToSLDMLD.push(null);
            SLD.push("X".repeat(16));
          }
        } else {
          DSPToSLDMLD.push(null);
          SLD.push("X".repeat(16));
        }
      } else {
        processing.push(
          vppb.bindingStatus === "BIND_OR_UNBIND_IN_PROGRESS" ? true : false
        );
        vPPBToDSP.push(null);
        DSP.push(null);
        DSPToSLDMLD.push(null);
        SLD.push("X".repeat(16));
      }
    });

    const bindedPort = vcsData.reduce(
      (record, vcs) => [
        ...record,
        ...vcs.vppbs
          .filter(
            (vppb) =>
              vppb.bindingStatus === "BOUND_PHYSICAL_PORT" ||
              vppb.bindingStatus === "BOUND_LD"
          )
          .map((vppb) => vppb.boundPortId),
      ],
      []
    );
    const unBindedPort = portData.filter(
      (port) =>
        !bindedPort.includes(port.portId) &&
        port.currentPortConfigurationState === "DSP"
    );
    // MLD
    MLD.push(mldData[0], mldData[1], mldData[2], mldData[3]);
    // console.log("vPPBToDSP: ", vPPBToDSP);
    // console.log("DSP: ", DSP);
    // console.log("DSPToSLDMLD: ", DSPToSLDMLD);
    // console.log("SLD: ", SLD);
    setDisplayData({
      hostConnected,
      vPPBToDSP,
      DSP,
      DSPToSLDMLD,
      SLD,
      // MLD
      MLD,
      processing,
      unBindedPort,
    });
  }, [data, deviceData, portData, vcsData]);

  const getUSPIdByLD = (ld) => {
    const device = deviceData.find((data) => data.deviceSerialNumber === ld);
    if (!device) return undefined;

    const vcs = vcsData.find((vcs) =>
      vcs.vppbs.some((vppb) => vppb.boundPortId === device.boundPortId)
    );

    return vcs ? vcs.uspId : undefined;
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", width: "80%" }}>
        <Row justify="center">
          <ItemCard
            style={{
              opacity: displayData.hostConnected ? 1 : 0,
            }}
            bodyStyle={{
              padding: "15px 10px",
            }}
            bgcolor={COLOR[vcs.uspId]}
          >
            <Space direction="vertical" size={0}>
              <DesktopOutlined style={{ fontSize: 30 }} />
              <span>Host</span>
            </Space>
          </ItemCard>
        </Row>
        <Row justify="center">
          <div
            style={{
              display: "flex",
              opacity: displayData.hostConnected ? 1 : 0,
            }}
          >
            <div
              style={{
                height: "32px",
                borderRight: "2px solid gray",
              }}
            ></div>
            <div
              style={{
                height: "32px",
                borderLeft: "2px solid gray",
              }}
            ></div>
          </div>
        </Row>
        <Row justify="center">
          <Link href="/device-status">
            <ItemCard
              bodyStyle={{
                padding: "15px 10px",
              }}
              hoverable
            >
              <Space direction="vertical" size={0}>
                {displayData.hostConnected ? (
                  <PiPlugsConnectedBold style={{ fontSize: 25 }} />
                ) : (
                  <PiPlugsBold style={{ fontSize: 25 }} />
                )}
                <span>Upstream Port {data.uspId}</span>
              </Space>
            </ItemCard>
          </Link>
        </Row>
        <Row justify="center">
          <div style={{ display: "flex" }}>
            <div
              style={{
                height: "32px",
                borderRight: "2px solid gray",
              }}
            ></div>
            <div
              style={{
                height: "32px",
                borderLeft: "2px solid gray",
              }}
            ></div>
          </div>
        </Row>
        <BoardedCard
          bodyStyle={{ padding: 0 }}
          bordered={false}
          style={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <Row
            justify="center"
            style={{ padding: "25px 0px", backgroundColor: "#149185" }}
          >
            VCS {data.virtualCxlSwitchId}
          </Row>
          <Row justify="space-around" style={{ backgroundColor: "#149185" }}>
            {data.vppbs.map((vppb, index) => (
              <BindUnbindDSP
                displayData={displayData}
                index={index}
                vppb={vppb}
                vcs={vcs}
                handleRefresh={handleRefresh}
                key={index}
              />
            ))}
          </Row>
          <Row
            style={{ padding: "10px 0px", backgroundColor: "#149185" }}
          ></Row>
        </BoardedCard>
        <Row justify="space-around">
          {displayData.vPPBToDSP.map((port, index) => (
            <Col key={`vtd-${index}`}>
              <div style={{ display: "flex", opacity: port != null ? 1 : 0 }}>
                <div
                  style={{
                    height: "32px",
                    borderRight: "2px solid gray",
                  }}
                ></div>
                <div
                  style={{
                    height: "32px",
                    borderLeft: "2px solid gray",
                  }}
                ></div>
              </div>
            </Col>
          ))}
        </Row>
        <Row justify="space-around">
          {displayData.DSP.map((port, index) => (
            // console.log("Iterater DSP: ", port),
            <Col key={`dsp-${index}`}>
              <ItemCard
                hoverable
                style={{
                  opacity: port != null ? 1 : 0,
                  pointerEvents: port != null ? "auto" : "none",
                }}
                bodyStyle={{
                  padding: "15px 10px",
                }}
              >
                <Link href="/port-status">
                  <Space direction="vertical" size={0}>
                    {displayData.DSPToSLDMLD[index] != null ? (
                      <PiPlugsConnectedBold style={{ fontSize: 25 }} />
                    ) : (
                      <PiPlugsBold style={{ fontSize: 25 }} />
                    )}
                    <div>Downstream</div>
                    <div>Port {port}</div>
                  </Space>
                </Link>
              </ItemCard>
            </Col>
          ))}
        </Row>
        <Row justify="space-around">
          {displayData.DSPToSLDMLD.map((port, index) => (
            // console.log("Iterater DSPToSLDMLD: ", port),
            <Col key={`dts-${index}`}>
              <div style={{ display: "flex", opacity: port != null ? 1 : 0 }}>
                <div
                  style={{
                    height: "32px",
                    borderRight: "2px solid gray",
                  }}
                ></div>
                <div
                  style={{
                    height: "32px",
                    borderLeft: "2px solid gray",
                  }}
                ></div>
              </div>
            </Col>
          ))}
        </Row>
        {/* 바인딩 및 바인딩 해제는 vcs와 vbbp 데이터로만 하기 때문에 vbbp 를 굳이 dsp sld 와 묶을 필요가 없을 것 같다. */}
        <Row justify="space-around">
          {vcs.vppbs.map((vppb, index) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px",
                backgroundColor: "white",
                border: "1px solid black",
              }}
              key={index}
            >
              {deviceData.map((device, index) =>
                // device의 boundPortId 와 vppb
                vppb.boundPortId === device.boundPortId ? (
                  // SLD, MLD 분기 나누기
                  // 원래는 SLD, MLD를 나타내는 속성으로 해야하는데 없으니까 일단 pcieDeviceId로
                  !device.pcieDeviceId ? (
                    <Col key={index}>
                      <ItemCard
                        hoverable
                        style={{
                          opacity:
                            device.deviceSerialNumber !== "X".repeat(16)
                              ? 1
                              : 0,
                          pointerEvents:
                            device.deviceSerialNumber !== "X".repeat(16)
                              ? "auto"
                              : "none",
                        }}
                        bodyStyle={{
                          padding: "15px 10px",
                        }}
                        bgcolor={COLOR[getUSPIdByLD(device.deviceSerialNumber)]}
                      >
                        {/* <Link href="/device-status"> */}
                        <Space direction="vertical" size={0}>
                          <FaMemory style={{ fontSize: 25 }} />
                          <span>{`SLD "${device.deviceSerialNumber}"`}</span>
                        </Space>
                        {/* </Link> */}
                      </ItemCard>
                    </Col>
                  ) : (
                    <Dropdown
                      // MLD - MLD 및 UnBindedPort 나오도록 작동
                      // ld를 menu로 넘기고, 여기서 ld 까지 보여줘야함
                      menu={{
                        items: lds,
                      }}
                      dropdownRender={(menu) => (
                        <AllocateDeallocateMLD
                          vcses={vcses}
                          device={device}
                          lds={menu.props.items}
                          handleRefresh={handleRefresh}
                        />
                      )}
                      placement="bottom"
                      trigger={["click"]}
                      key={`vppb-bind-${index}`}
                    >
                      <Col>
                        <ItemCard
                          hoverable
                          style={{
                            opacity:
                              device.deviceSerialNumber !== "X".repeat(16)
                                ? 1
                                : 0,
                            pointerEvents:
                              device.deviceSerialNumber !== "X".repeat(16)
                                ? "auto"
                                : "none",
                          }}
                          bodyStyle={{
                            padding: "15px 10px",
                          }}
                        >
                          {/* <Link href="/device-status"> */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                            size={0}
                          >
                            <FaMemory style={{ fontSize: 25 }} />
                            <span>{`MLD "${device.deviceSerialNumber}"`}</span>
                            <div
                              style={{
                                width: "90%",
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                              }}
                            >
                              {lds.map((ld) => {
                                return (
                                  <div
                                    style={{
                                      backgroundColor: ld.used
                                        ? COLOR[ld.host]
                                        : "#eee",
                                    }}
                                  >
                                    {`LD ${ld.id}`}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* </Link> */}
                        </ItemCard>
                      </Col>
                    </Dropdown>
                  )
                ) : null
              )}
            </div>
          ))}
        </Row>
      </div>
      <FloatButton.Group
        className="vcs-view-group"
        shape="square"
        style={{ right: 40 }}
      >
        <FloatButton description="Hierarchy View" type="primary" />
        <FloatButton
          description="Decoder View"
          tooltip={<div>Currently unavailable</div>}
        />
      </FloatButton.Group>
    </>
  );
};
export default FabricManagerUI;
