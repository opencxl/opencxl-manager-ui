'use client'

import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { useSearchParams } from 'next/navigation'
import { useSocket } from '@/app/_components/providers/socket-provider';
import FabricManagerUI from './FabricManagerUI';
const { Title } = Typography;

const NoStatus = () => (
    <Title
        type='secondary'
        level={5}
    >
        No VCS Information
    </Title>
);

const Overview = () => {
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
                console.log("device:get ", data);
            });
        }
        const getPort = () => {
            socket.emit('port:get', (data) => {
                setPortData(data["result"])
                console.log("port:get ", data);
            });
        }
        const getVCS = () => {
            socket.emit('vcs:get', (data) => {
                setVCSData(data["result"]);
                console.log("vcs:get ", data);
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
                    : 
                      <div style={{display:"flex", justifyContent:"center"}}>
                          {vcsData.map((vcs) => {
                              return (<FabricManagerUI
                                      vcs={vcs}
                                      vcses={vcsData}
                                      ports={portData}
                                      devices={deviceData}
                                      handleRefresh={() => setRefresh(!refresh)}
                                  />)
                              }
                          )}
                      </div>
          }
        </>
    )
};
export default Overview;