"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Divider, Space } from "antd";
import styled from "styled-components";
import Link from "next/link";
import { DesktopOutlined } from "@ant-design/icons";
import { PiPlugsBold, PiPlugsConnectedBold } from "react-icons/pi";
import { FaMemory } from "react-icons/fa6";
import SideMenu from "./_components/navigation/SideMenu";
import { useSocket } from "./_components/providers/socket-provider";

const BoardedCard = styled(Card)`
  border-color: #9c9999;
`;

const ItemCard = styled(BoardedCard)`
  text-align: center;
  z-index: 1;
  width: 105px;
  word-break: break-word;
`;

const Overview = () => {
  const { socket } = useSocket();
  const [portData, setPortData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [vcsData, setVCSData] = useState([]);
  const [displayData, setDisplayData] = useState({
    host: [],
    hostToUSP: [],
    USP: [],
    USPVCS: [],
    DSP: [],
    DSPToSLD: [],
    SLD: [],
    DSPVCS: [],
  });

  useEffect(() => {
    if (!socket) return;
    const getDeviceData = () => {
      socket.emit("device:get", (data) => {
        setDeviceData(data["result"]);
      });
    };
    const getPortData = () => {
      socket.emit("port:get", (data) => {
        setPortData(data["result"]);
      });
    };
    const getVCSData = () => {
      socket.emit("vcs:get", (data) => {
        setVCSData(data["result"]);
      });
    };
    getDeviceData();
    getPortData();
    getVCSData();
    socket.on("device:updated", () => getDeviceData());
    socket.on("port:updated", () => getPortData());
    socket.on("vcs:updated", () => getVCSData());
    return () => {
      socket.off("device:updated");
      socket.off("port:updated");
      socket.off("vcs:updated");
    };
  }, [socket]);

  useEffect(() => {
    const host = [];
    const hostToUSP = [];
    const USP = [];
    const USPVCS = [];
    const DSP = [];
    const DSPToSLD = [];
    const SLD = [];
    const DSPVCS = [];

    portData.forEach((port) => {
      if (port.currentPortConfigurationState === "USP") {
        USP.push(port.portId);
        if (port.ltssmState === "L0") {
          host.push(port.portId);
          hostToUSP.push(port.portId);
        } else {
          host.push(null);
          hostToUSP.push(null);
        }
        const foundVCS = vcsData.find((vcs) => vcs.uspId === port.portId);
        if (foundVCS) {
          USPVCS.push(foundVCS.virtualCxlSwitchId);
        } else {
          USPVCS.push(null);
        }
      } else if (port.currentPortConfigurationState !== "DISABLED") {
        DSP.push(port.portId);
        if (port.ltssmState === "L0") {
          const device = deviceData.find(
            (device) => device.boundPortId === port.portId
          );
          if (device) {
            DSPToSLD.push(port.portId);
            SLD.push(device.deviceSerialNumber);
          } else {
            DSPToSLD.push(null);
            SLD.push("X".repeat(16));
          }
        } else {
          DSPToSLD.push(null);
          SLD.push("X".repeat(16));
        }
        const foundVCS = vcsData.find((vcs) => {
          return vcs.ppb_info_list.find(
            (vppb) => vppb.boundPortId === port.portId
          );
        });
        if (foundVCS) {
          DSPVCS.push(foundVCS.virtualCxlSwitchId);
        } else {
          DSPVCS.push(null);
        }
      }
    });
    setDisplayData({
      host,
      hostToUSP,
      USP,
      USPVCS,
      DSP,
      DSPToSLD,
      SLD,
      DSPVCS,
    });
  }, [portData, deviceData, vcsData]);

  return (
    <SideMenu>
      <Col span={18} offset={3}>
        <Row justify="space-around">
          {displayData.host.map((host, index) => (
            <Col key={`host-${index}`}>
              <ItemCard
                style={{
                  opacity: host != null ? 1 : 0,
                }}
                bodyStyle={{
                  padding: "15px 10px",
                }}
              >
                <Space direction="vertical" size={0}>
                  <DesktopOutlined style={{ fontSize: 30 }} />
                  <span>Host</span>
                </Space>
              </ItemCard>
            </Col>
          ))}
        </Row>
        <Row justify="space-around">
          {displayData.hostToUSP.map((port, index) => (
            <Col key={`htu-${index}`}>
              <Card
                bordered={false}
                bodyStyle={{
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                style={{
                  width: 100,
                  textAlign: "center",
                  opacity: port != null ? 1 : 0,
                }}
              >
                <Divider
                  type="vertical"
                  style={{
                    borderLeft: "2px solid #9c9999",
                    height: 32,
                    top: 0,
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        <BoardedCard
          bodyStyle={{ padding: 0 }}
          style={{
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <Row justify="space-around">
            {displayData.USP.map((port, index) => (
              <Col key={`usp-${index}`}>
                <ItemCard
                  hoverable={displayData.USPVCS[index] !== null}
                  style={{
                    opacity: port != null ? 1 : 0,
                    pointerEvents:
                      port != null && displayData.USPVCS[index] !== null
                        ? "auto"
                        : "none",
                  }}
                  bodyStyle={{
                    padding: "15px 10px",
                  }}
                >
                  <Link
                    href={{
                      pathname: "/vcs-status",
                      query: { vcs: displayData.USPVCS[index] },
                    }}
                  >
                    <Space direction="vertical" size={0}>
                      {displayData.hostToUSP[index] != null ? (
                        <PiPlugsConnectedBold style={{ fontSize: 25 }} />
                      ) : (
                        <PiPlugsBold style={{ fontSize: 25 }} />
                      )}
                      <span>Upstream Port {port}</span>
                    </Space>
                  </Link>
                </ItemCard>
              </Col>
            ))}
          </Row>
          <Row justify="center" style={{ margin: "50px 0px" }}>
            CXL Switch
          </Row>
          <Row justify="space-around">
            {displayData.DSP.map((port, index) => (
              <Col key={`dsp-${index}`}>
                <ItemCard
                  hoverable={displayData.DSPVCS[index] !== null}
                  style={{
                    backgroundColor:
                      displayData.DSPVCS[index] == null
                        ? "lightgrey"
                        : "inherit",
                    opacity: port != null ? 1 : 0,
                    pointerEvents:
                      port != null && displayData.DSPVCS[index] !== null
                        ? "auto"
                        : "none",
                  }}
                  bodyStyle={{
                    padding: "15px 10px",
                  }}
                >
                  <Link
                    href={{
                      pathname: "/vcs-status",
                      query: { vcs: displayData.DSPVCS[index] },
                    }}
                  >
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
        </BoardedCard>
        <Row justify="space-around">
          {displayData.DSPToSLD.map((port, index) => (
            <Col key={`dts-${index}`}>
              <Card
                bordered={false}
                bodyStyle={{
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                style={{
                  width: 100,
                  textAlign: "center",
                  opacity: port != null ? 1 : 0,
                }}
              >
                <Divider
                  type="vertical"
                  style={{
                    borderLeft: "2px solid #9c9999",
                    height: 32,
                    top: 0,
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        <Row justify="space-around">
          {displayData.SLD.map((sld, index) => (
            <Col key={`sld-${index}`}>
              <ItemCard
                hoverable={displayData.DSPVCS[index] !== null}
                style={{
                  opacity: sld != "X".repeat(16) ? 1 : 0,
                  pointerEvents:
                    sld !== "X".repeat(16) && displayData.DSPVCS[index] !== null
                      ? "auto"
                      : "none",
                }}
                bodyStyle={{
                  padding: "15px 10px",
                }}
              >
                <Link
                  href={{
                    pathname: "/vcs-status",
                    query: { vcs: displayData.DSPVCS[index] },
                  }}
                >
                  <Space direction="vertical" size={0}>
                    <FaMemory style={{ fontSize: 25 }} />
                    <span>{`SLD "${sld}"`}</span>
                  </Space>
                </Link>
              </ItemCard>
            </Col>
          ))}
        </Row>
      </Col>
    </SideMenu>
  );
};
export default Overview;
