
'use client'

import { Spin } from 'antd';
import { useEffect, useState } from 'react';

const Loading = ({ loading = true }) => {
    const [spinning, setSpinning] = useState(loading);

    useEffect(() => {
        setSpinning(loading);
    }, [loading]);

    return (
        <Spin spinning={spinning} fullscreen />
    );
};
export default Loading;