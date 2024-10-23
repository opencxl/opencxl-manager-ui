'use client'

import { useState, useEffect } from 'react';
import { Tabs, Typography } from 'antd';
import { useSearchParams } from 'next/navigation'
import VCS from '@/app/vcs-status/VCS';
import { useSocket } from '@/app/_components/providers/socket-provider';
const { Title } = Typography;

const NoStatus = () => (
    <Title
        type='secondary'
        level={5}
    >
        No VCS Information
    </Title>
);

const VCSStatus = () => {
    const searchParams = useSearchParams();
    const vcsNumber = searchParams.get('vcs') || '0';
    const [activeKey, setActiveKey] = useState(vcsNumber);

    const { socket } = useSocket();
    const [vcsData, setVCSData] = useState([]);
    const [portData, setPortData] = useState([]);
    const [deviceData, setDeviceData] = useState([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        if (!socket) return;
        const getDevice = () => {
            socket.emit('device:get', (data) => {
                setDeviceData(data["result"]);
            });
        }
        const getPort = () => {
            socket.emit('port:get', (data) => {
                setPortData(data["result"])
            });
        }
        const getVCS = () => {
            socket.emit('vcs:get', (data) => {
                setVCSData(data["result"]);
            });
        }
        getDevice();
        getPort();
        getVCS();
        socket.on('device:updated', () => getDevice());
        socket.on('port:updated', () => getPort());
        socket.on('vcs:updated', () => getVCS());
        return () => {
            socket.off('device:updated');
            socket.off('port:updated');
            socket.off('vcs:updated');
        }
    }, [socket, refresh]);

    return (
        <>
            {
                vcsData.length === 0
                    ? <NoStatus />
                    : <Tabs
                        onChange={(key) => setActiveKey(key)}
                        type='card'
                        items={vcsData.map((vcs) => {
                            return {
                                label: `VCS ${vcs.virtualCxlSwitchId}`,
                                key: `${vcs.virtualCxlSwitchId}`,
                                children:
                                    <VCS
                                        vcs={vcs}
                                        vcses={vcsData}
                                        ports={portData}
                                        devices={deviceData}
                                        handleRefresh={() => setRefresh(!refresh)}
                                    />
                            }
                        })}
                        activeKey={activeKey}
                    />
            }
        </>
    )
};
export default VCSStatus;