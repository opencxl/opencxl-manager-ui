'use client'

import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    theme,
    Space,
    Button,
    Tooltip,
    Divider,
    Dropdown,
    FloatButton
} from 'antd';
import styled from 'styled-components';
import Link from 'next/link';
import {
    PiPlugsBold,
    PiPlugsConnectedBold
} from 'react-icons/pi';
import {
    FaMemory,
    FaLink,
    FaLinkSlash,
} from 'react-icons/fa6';
import { DesktopOutlined, SyncOutlined } from '@ant-design/icons';
import { useSocket } from '@/app/_components/providers/socket-provider';
import { COLOR } from './color';

const { useToken } = theme;

const BoardedCard = styled(Card)`
  border-color: #9c9999;
`;

const ItemCard = styled(BoardedCard)`
  text-align: center;
  width: 105px;
  z-index: 1;
  word-break: break-word;
  background-color: ${(props) => props.bgcolor}
`;

const formatError = (error) => {
    let reformattedText = error.replaceAll('_', ' ');
    reformattedText = reformattedText.charAt(0).toUpperCase()
        + reformattedText.slice(1).toLowerCase();
    return reformattedText;
};

const FabricManagerUI = ({ vcs, devices, ports, vcses, handleRefresh }) => {
    const { socket } = useSocket();
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

    const { token } = useToken();
    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
    };
    const menuStyle = {
        boxShadow: 'none',
    };

    const [open, setOpen] = useState({
        flag: false,
        vppb: null,
        dsp: null,
        error: null,
        loading: false,
    });

    useEffect(() => setData(vcs), [vcs]);
    useEffect(() => setDeviceData(devices), [devices]);
    useEffect(() => setPortData(ports), [ports]);
    useEffect(() => setVCSData(vcses), [vcses]);
    useEffect(() => {
        let hostConnected = false;
        if (data.uspId != null) {
            const usp = portData.find((port) => port.portId === data.uspId);
            if (usp.ltssmState === 'L0') {
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
                processing.push(vppb.bindingStatus === 'BIND_OR_UNBIND_IN_PROGRESS' ? true : false);
                vPPBToDSP.push(vppb.boundPortId);
                DSP.push(vppb.boundPortId);
                const dsp = portData.find((port) => port.portId === vppb.boundPortId);
                if (dsp.ltssmState === 'L0') {
                    const device = deviceData.find((device) => device.boundPortId === dsp.portId);
                    if (device) {
                        DSPToSLD.push(dsp.portId);
                        SLD.push(device.deviceSerialNumber);
                    } else {
                        DSPToSLD.push(null);
                        SLD.push('X'.repeat(16));
                    }
                } else {
                    DSPToSLD.push(null);
                    SLD.push('X'.repeat(16));
                }
            }
            else {
                processing.push(vppb.bindingStatus === 'BIND_OR_UNBIND_IN_PROGRESS' ? true : false);
                vPPBToDSP.push(null);
                DSP.push(null);
                DSPToSLD.push(null);
                SLD.push('X'.repeat(16));
            }
        });

        const bindedPort = vcsData.reduce((record, vcs) =>
            [
                ...record,
                ...vcs.vppbs.filter(
                    vppb => (vppb.bindingStatus === 'BOUND_PHYSICAL_PORT' || vppb.bindingStatus === 'BOUND_LD')
                ).map(vppb => vppb.boundPortId)
            ], [])
        const unBindedPort = portData.filter(port =>
            !bindedPort.includes(port.portId) && port.currentPortConfigurationState === 'DSP')

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

    const handleClose = () => {
        setOpen({
            flag: false,
            vppb: null,
            dsp: null,
            error: null,
            loading: false,
        });
    };

    const handleOpenChange = (flag, vppb) => {
        if (open.flag === flag) return;
        if (open.loading) return;
        const errorTooltip = window.document.getElementsByClassName(`error-tooltip-${vppb}`)[0];
        if (!flag) {
            setOpen({
                ...open,
                flag,
                error: null,
                vppb: null,
            });
            if (errorTooltip) {
                window.document.getElementsByClassName(`error-tooltip-${vppb}`)[0].style.display = 'none';
            }
        }
        else {
            setOpen({
                ...open,
                flag,
                vppb,
            });
        }
    };

    const showError = (error, vppb) => {
        setOpen({
            ...open,
            error: formatError(error),
        });
        const errorTooltip = window.document.getElementsByClassName(`error-tooltip-${vppb}`)[0];
        if (errorTooltip) {
            window.document.getElementsByClassName(`error-tooltip-${vppb}`)[0].style.display = 'block';
        }
    };

    const handleBind = (vppb) => {
        if (open.dsp == null) return;
        console.log(`Bind vPPB ${vppb} from VCS ${vcs.virtualCxlSwitchId} to DSP ${open.dsp}`)
        setOpen({
            ...open,
            error: null,
            loading: true,
        })
        socket.emit('vcs:bind', {
            virtualCxlSwitchId: vcs.virtualCxlSwitchId,
            vppbId: vppb,
            physicalPortId: Number(open.dsp),
        }, (args) => {
            if (args.error) {
                setOpen({
                    ...open,
                    loading: false,
                });
                showError(args.error, vppb);
                return;
            }
            handleClose();
            handleRefresh();
        });

    };
    const handleUnbind = (vppb) => {
        console.log(`Unbind vPPB ${vppb} from VCS ${vcs.virtualCxlSwitchId}`)
        setOpen({
            ...open,
            error: null,
            loading: true,
        })
        socket.emit('vcs:unbind', {
            virtualCxlSwitchId: vcs.virtualCxlSwitchId,
            vppbId: Number(vppb),
        }, (args) => {
            if (args.error) {
                setOpen({
                    ...open,
                    loading: false,
                });
                showError(args.error, vppb);
                return;
            }
            handleClose();
            handleRefresh();
        });
    };
    const handleSelectDSP = (dsp) => {
        setOpen({
            ...open,
            dsp,
        });
    };

    const getUSPId = (sld) => {
        const device = deviceData.find((data) => data.deviceSerialNumber === sld);
        if (!device) return undefined;
    
        const vcs = vcsData.find((vcs) =>
            vcs.vppbs.some((vppb) => vppb.boundPortId === device.boundPortId)
        );
    
        return vcs ? vcs.uspId : undefined;
    }

    return (
        <>
            <div style={{display:"flex", flexDirection:"column", width:"20%"}}>
                <Row justify="center">
                    <ItemCard
                        style={{
                            opacity: displayData.hostConnected ? 1 : 0
                        }}
                        bodyStyle={{
                            padding: '15px 10px'
                        }}
                        bgcolor={COLOR[vcs.uspId]}
                    >
                        <Space direction='vertical' size={0}>
                            <DesktopOutlined style={{ fontSize: 30 }} />
                            <span>Host</span>
                        </Space>
                    </ItemCard>
                </Row>
                <Row justify="center">
                    <div style={{display:"flex", opacity: displayData.hostConnected ? 1 : 0,}}>
                        <div
                            style={{
                                height:"32px",
                                borderRight: '2px solid gray',
                            }}
                        >
                        </div>
                        <div
                            style={{
                                height:"32px",
                                borderLeft: '2px solid gray',
                            }}
                        >
                        </div>
                    </div>
                </Row>
                <Row justify="center">
                    <Link href='/device-status'>
                        <ItemCard
                            bodyStyle={{
                                padding: '15px 10px'
                            }}
                            hoverable
                        >
                            <Space direction='vertical' size={0}>
                                {displayData.hostConnected
                                    ? <PiPlugsConnectedBold style={{ fontSize: 25 }} />
                                    : <PiPlugsBold style={{ fontSize: 25 }} />
                                }
                                <span>Upstream Port {data.uspId}</span>
                            </Space>
                        </ItemCard>
                    </Link>
                </Row>
                <Row justify="center">
                    <div style={{display:"flex"}}>
                        <div
                            style={{
                                height:"32px",
                                borderRight: '2px solid gray',
                            }}
                        >
                        </div>
                        <div
                            style={{
                                height:"32px",
                                borderLeft: '2px solid gray',
                            }}
                        >
                        </div>
                    </div>
                </Row>
                <BoardedCard
                    bodyStyle={{ padding: 0 }}
                    bordered={false}
                    style={{
                        textAlign: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Row justify="center" style={{ padding: '50px 0px', backgroundColor: "#149185" }}>
                        VCS {data.virtualCxlSwitchId}
                    </Row>
                    <Row justify="space-around" style={{ backgroundColor: "#149185" }}>
                        {data.vppbs.map((vppb, index) => (
                            <Dropdown
                                menu={{
                                    items: displayData.unBindedPort.map((port) => ({
                                        label: `DSP ${port.portId}`,
                                        key: `${port.portId}`,
                                    })),
                                    onClick: ({ key }) => {
                                        handleSelectDSP(key)
                                    },
                                    selectable: true,
                                }}
                                dropdownRender={(menu) => (
                                    <div style={contentStyle}>
                                        <Space
                                            size={0}
                                            style={{
                                                display:
                                                    displayData.vPPBToDSP[index] != null
                                                        || displayData.unBindedPort.length === 0
                                                        ? 'none' : 'block',
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
                                                placement={'right'}
                                                overlayClassName={`error-tooltip-${index}`}
                                                fresh
                                            >
                                                {displayData.vPPBToDSP[index] != null
                                                    ? (
                                                        <Button
                                                            type="primary"
                                                            loading={open.loading}
                                                            onClick={() => handleUnbind(index)}
                                                        >Click to Unbind</Button>
                                                    ) : displayData.unBindedPort.length === 0
                                                        ? 'No port available for binding'
                                                        : (
                                                            <Button
                                                                type="primary"
                                                                loading={open.loading}
                                                                onClick={() => handleBind(index)}
                                                            >Select to Bind</Button>
                                                        )}
                                            </Tooltip>
                                        </Space>
                                    </div>
                                )}
                                onOpenChange={(open) => handleOpenChange(open, index)}
                                open={open.vppb === index && open.flag}
                                disabled={displayData.processing[index]}
                                trigger={['click']}
                                key={`vppb-bind-${index}`}
                            >
                                <Col key={`vppb-${index}`}>
                                    <Tooltip title={
                                        displayData.processing[index] ? vppb.bindingStatus : undefined
                                    }>
                                        <ItemCard
                                            bodyStyle={{
                                                padding: '15px 10px'
                                            }}
                                            hoverable={!displayData.processing[index]}
                                        >
                                            <Space direction='vertical' size={
                                                displayData.processing[index] ? 3 : 0
                                            }>
                                                {displayData.processing[index]
                                                    ? <SyncOutlined style={{ fontSize: 25 }} spin />
                                                    : displayData.vPPBToDSP[index] != null
                                                        ? <FaLink style={{ fontSize: 25 }} />
                                                        : <FaLinkSlash style={{ fontSize: 25 }} />
                                                }
                                                <span>vPPB {index}</span>
                                            </Space>
                                        </ItemCard>
                                    </Tooltip>
                                </Col>
                            </Dropdown>
                        ))}
                    </Row>
                </BoardedCard >
                <Row justify="space-around">
                    {displayData.vPPBToDSP.map((port, index) => (
                        <Col key={`vtd-${index}`}>
                            <div style={{display:"flex", opacity: port != null ? 1 : 0}}>
                                <div
                                    style={{
                                        height:"32px",
                                        borderRight: '2px solid gray',
                                    }}
                                >
                                </div>
                                <div
                                    style={{
                                        height:"32px",
                                        borderLeft: '2px solid gray',
                                    }}
                                >
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
                <Row justify="space-around">
                    {displayData.DSP.map((port, index) => (
                        <Col key={`dsp-${index}`}>
                            <ItemCard
                                hoverable
                                style={{
                                    opacity: port != null ? 1 : 0,
                                    pointerEvents: port != null ? 'auto' : 'none'
                                }}
                                bodyStyle={{
                                    padding: '15px 10px'
                                }}
                            >
                                <Link href='/port-status'>
                                    <Space direction='vertical' size={0}>
                                        {displayData.DSPToSLD[index] != null
                                            ? <PiPlugsConnectedBold style={{ fontSize: 25 }} />
                                            : <PiPlugsBold style={{ fontSize: 25 }} />}
                                        <div>Downstream</div>
                                        <div>Port {port}</div>
                                    </Space>
                                </Link>
                            </ItemCard>
                        </Col>
                    ))}
                </Row >
                <Row justify="space-around">
                    {displayData.DSPToSLD.map((port, index) => (
                        <Col key={`dts-${index}`}>
                            <div style={{display:"flex", opacity: port != null ? 1 : 0}}>
                                <div
                                    style={{
                                        height:"32px",
                                        borderRight: '2px solid gray',
                                    }}
                                >
                                </div>
                                <div
                                    style={{
                                        height:"32px",
                                        borderLeft: '2px solid gray',
                                    }}
                                >
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
                <Row justify="space-around">
                    {displayData.SLD.map((sld, index) => (
                        <Col key={`sld-${index}`}>
                            <ItemCard
                                hoverable
                                style={{
                                    opacity: sld !== 'X'.repeat(16) ? 1 : 0,
                                    pointerEvents: sld !== 'X'.repeat(16) ? 'auto' : 'none'
                                }}
                                bodyStyle={{
                                    padding: '15px 10px'
                                }}
                                bgcolor={COLOR[getUSPId(sld)]}
                            >
                                <Link href='/device-status'>
                                    <Space direction='vertical' size={0}>
                                        <FaMemory style={{ fontSize: 25 }} />
                                        <span>{`SLD "${sld}"`}</span>
                                    </Space>
                                </Link>
                            </ItemCard>
                        </Col>
                    ))}
                </Row>
            </div>
            <FloatButton.Group
                className='vcs-view-group'
                shape='square'
                style={{ right: 40 }}
            >
                <FloatButton
                    description="Hierarchy View"
                    type="primary"
                />
                <FloatButton
                    description="Decoder View"
                    tooltip={<div>Currently unavailable</div>}
                />
            </FloatButton.Group>
        </>
    )
};
export default FabricManagerUI;