"use client";

import React, { useState } from "react";
import {
  theme,
  Button,
  Tooltip,
  Divider,
  Dropdown,
  Col,
  Card,
  Space,
} from "antd";
import { FaLink, FaLinkSlash } from "react-icons/fa6";
import { SyncOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { handleBindUnbind } from "../_utils/handleBindUnbind";

const { useToken } = theme;

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

const formatError = (error) => {
  let reformattedText = error.replaceAll("_", " ");
  reformattedText =
    reformattedText.charAt(0).toUpperCase() +
    reformattedText.slice(1).toLowerCase();
  return reformattedText;
};

const BindUnbindDSP = ({ displayData, index, vppb, vcs, handleRefresh }) => {
  const { token } = useToken();
  const [open, setOpen] = useState({
    flag: false,
    vppb: null,
    dsp: null,
    error: null,
    loading: false,
  });

  const handleClose = () => {
    setOpen({
      flag: false,
      vppb: null,
      dsp: null,
      error: null,
      loading: false,
    });
  };

  const showError = (error, vppb) => {
    setOpen({
      ...open,
      error: formatError(error),
    });
    const errorTooltip = window.document.getElementsByClassName(
      `error-tooltip-${vppb}`
    )[0];
    if (errorTooltip) {
      window.document.getElementsByClassName(
        `error-tooltip-${vppb}`
      )[0].style.display = "block";
    }
  };

  const { handleBind, handleUnbind } = handleBindUnbind(
    vcs.virtualCxlSwitchId,
    index,
    open,
    setOpen,
    handleClose,
    showError,
    handleRefresh
  );

  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };
  const menuStyle = {
    boxShadow: "none",
  };

  const handleOpenChange = (flag, vppb) => {
    if (open.flag === flag) return;
    if (open.loading) return;
    const errorTooltip = window.document.getElementsByClassName(
      `error-tooltip-${vppb}`
    )[0];
    if (!flag) {
      setOpen({
        ...open,
        flag,
        error: null,
        vppb: null,
      });
      if (errorTooltip) {
        window.document.getElementsByClassName(
          `error-tooltip-${vppb}`
        )[0].style.display = "none";
      }
    } else {
      setOpen({
        ...open,
        flag,
        vppb,
      });
    }
  };

  const handleSelectDSP = (dsp) => {
    console.log("dsp: ", dsp);
    setOpen({
      ...open,
      dsp,
    });
  };

  return (
    <>
      <Dropdown
        menu={{
          items: displayData.unBindedPort.map((port) => ({
            label: `DSP ${port.portId}`,
            key: `${port.portId}`,
          })),
          onClick: ({ key }) => {
            handleSelectDSP(key);
          },
          selectable: true,
        }}
        dropdownRender={(menu) => (
          <div style={contentStyle}>
            <Space
              size={0}
              style={{
                display:
                  displayData.vPPBToDSP[index] != null ||
                  displayData.unBindedPort.length === 0
                    ? "none"
                    : "block",
              }}
            >
              {React.cloneElement(menu, {
                style: menuStyle,
              })}
              <Divider
                style={{
                  margin: 0,
                }}
              />
            </Space>
            <Space
              style={{
                padding: 8,
              }}
            >
              <Tooltip
                title={open.error}
                open={open.error}
                placement={"right"}
                overlayClassName={`error-tooltip-${index}`}
                fresh
              >
                {displayData.vPPBToDSP[index] != null ? (
                  // <Button
                  //   type="primary"
                  //   loading={open.loading}
                  //   onClick={() =>
                  //     handleUnbind(
                  //       vcs.virtualCxlSwitchId,
                  //       index,
                  //       open,
                  //       setOpen,
                  //       handleClose,
                  //       showError,
                  //       handleRefresh,
                  //       socket
                  //     )
                  //   }
                  // >
                  <Button
                    type="primary"
                    loading={open.loading}
                    onClick={() => handleUnbind()}
                  >
                    Click to Unbind
                  </Button>
                ) : displayData.unBindedPort.length === 0 ? (
                  "No port available for binding"
                ) : (
                  <Button
                    type="primary"
                    loading={open.loading}
                    onClick={() => handleBind()}
                  >
                    Select to Bind
                  </Button>
                )}
              </Tooltip>
            </Space>
          </div>
        )}
        onOpenChange={(open) => handleOpenChange(open, index)}
        open={open.vppb === index && open.flag}
        disabled={displayData.processing[index]}
        trigger={["click"]}
        key={`vppb-bind-${index}`}
      >
        <Col key={`vppb-${index}`}>
          <Tooltip
            title={
              displayData.processing[index] ? vppb.bindingStatus : undefined
            }
          >
            <ItemCard
              bodyStyle={{
                padding: "15px 10px",
              }}
              hoverable={!displayData.processing[index]}
            >
              <Space
                direction="vertical"
                size={displayData.processing[index] ? 3 : 0}
              >
                {displayData.processing[index] ? (
                  <SyncOutlined style={{ fontSize: 25 }} spin />
                ) : displayData.vPPBToDSP[index] != null ? (
                  <FaLink style={{ fontSize: 25 }} />
                ) : (
                  <FaLinkSlash style={{ fontSize: 25 }} />
                )}
                <span>vPPB {index}</span>
              </Space>
            </ItemCard>
          </Tooltip>
        </Col>
      </Dropdown>
    </>
  );
};

export default BindUnbindDSP;
