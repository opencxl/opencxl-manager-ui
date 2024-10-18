'use client'

import { useRouter } from 'next/navigation'
import {
    HomeOutlined,
    ClusterOutlined,
    DatabaseOutlined,
    NodeIndexOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { Layout, Menu, Space, Typography, theme } from 'antd';
import { SocketIndicator } from '@/app/_components/ui/socket-indicator';
const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const StyledText = styled(Text)`
    &.ant-typography {
        color: white;
    }
`;

const getItem = (label, key, icon, children) => {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem('Overview', '/', <HomeOutlined />),
    getItem('VCS Status', '/vcs-status', <NodeIndexOutlined />),
    getItem('Port Status', '/port-status', <ClusterOutlined />),
    getItem('Device Status', '/device-status', <DatabaseOutlined />),
];

const SideMenu = ({
    children,
}) => {
    const router = useRouter();
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    return (
        <Layout style={{ height: "100vh" }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 50,
                }}
            >
                <Space size={10}>
                    <StyledText strong>Fabric Manager</StyledText>
                    <SocketIndicator />
                </Space>
            </Header>
            <Layout>
                <Sider theme='light' collapsible>
                    <Menu
                        defaultSelectedKeys={['1']}
                        items={items}
                        onClick={({ key }) => router.push(`${key}`)}
                    />
                </Sider>
                <Layout>
                    <Content
                        style={{
                            margin: 10,
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            overflowY: 'auto',
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};
export default SideMenu;