'use client';

import { useSocket } from "@/components/providers/socket-provider";
import { Tag } from "antd";

export const SocketIndicator = () => {
    const { connected } = useSocket();

    return (
        <Tag
            color={connected ? '#51a52d' : '#108ee9'}
        >
            {connected
                ? "Live: Real-time Updating"
                : "Emulator not connected"
            }
        </Tag>
    );
};