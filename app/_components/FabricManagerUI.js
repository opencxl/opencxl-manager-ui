"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Space, FloatButton } from "antd";
import styled from "styled-components";
import Link from "next/link";
import { PiPlugsBold, PiPlugsConnectedBold } from "react-icons/pi";
import { FaMemory, FaLink, FaLinkSlash } from "react-icons/fa6";
import { DesktopOutlined, SyncOutlined } from "@ant-design/icons";
import { COLOR } from "../_data/color";
import BindUnbindDSP from "./BindUnbindDSP";

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
  // console.log("handleRefresh: ", handleRefresh);
  const [data, setData] = useState(vcs);
  const [deviceData, setDeviceData] = useState(devices);
  const [portData, setPortData] = useState(ports);
  const [vcsData, setVCSData] = useState(vcses);

  const [displayData, setDisplayData] = useState({
    hostConnected: false,
    vPPBToDSP: [],
    DSP: [],
    DSPToSLD: [],
    SLD: [],
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
    const DSPToSLD = [];
    const SLD = [];
    const processing = [];
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
            DSPToSLD.push(dsp.portId);
            SLD.push(device.deviceSerialNumber);
          } else {
            DSPToSLD.push(null);
            SLD.push("X".repeat(16));
          }
        } else {
          DSPToSLD.push(null);
          SLD.push("X".repeat(16));
        }
      } else {
        processing.push(
          vppb.bindingStatus === "BIND_OR_UNBIND_IN_PROGRESS" ? true : false
        );
        vPPBToDSP.push(null);
        DSP.push(null);
        DSPToSLD.push(null);
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

    // console.log("vPPBToDSP: ", vPPBToDSP);
    // console.log("DSP: ", DSP);
    // console.log("DSPToSLD: ", DSPToSLD);
    // console.log("SLD: ", SLD);
    setDisplayData({
      hostConnected,
      vPPBToDSP,
      DSP,
      DSPToSLD,
      SLD,
      processing,
      unBindedPort,
    });
  }, [data, deviceData, portData, vcsData]);

  const getUSPId = (sld) => {
    const device = deviceData.find((data) => data.deviceSerialNumber === sld);
    if (!device) return undefined;

    const vcs = vcsData.find((vcs) =>
      vcs.vppbs.some((vppb) => vppb.boundPortId === device.boundPortId)
    );

    return vcs ? vcs.uspId : undefined;
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", width: "20%" }}>
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
            style={{ padding: "50px 0px", backgroundColor: "#149185" }}
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
                    {displayData.DSPToSLD[index] != null ? (
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
          {displayData.DSPToSLD.map((port, index) => (
            // console.log("Iterater DSPToSLD: ", port),
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
          {/* vcs-vppbs에 연결된 DSP가 같은 sld 모두 나열 */}
          {vcs.vppbs.map((vppb) => (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {deviceData.map((device, index) =>
                vppb.boundPortId === device.boundPortId ? (
                  <>
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
                        bgcolor={COLOR[getUSPId(device.deviceSerialNumber)]}
                      >
                        <Link href="/device-status">
                          <Space direction="vertical" size={0}>
                            <FaMemory style={{ fontSize: 25 }} />
                            <span>{`SLD "${device.deviceSerialNumber}"`}</span>
                          </Space>
                        </Link>
                      </ItemCard>
                    </Col>
                  </>
                ) : (
                  ""
                )
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
