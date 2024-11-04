"use client";

import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { useSocket } from "../_components/providers/socket-provider";
import { useCXLSocket } from "./_hooks/useCXLSocket";
import { processCXLSocketData } from "./_utils/processCXLSocketData";
// import Host from "./_components/Host";
// import CXLSwitch from "./_components/CXLSwitch";
// import LogicalDevice from "./_components/LogicalDevice";

// 완성 후에 RootLayout 은 따로 두고, 이 페이지는 page로 옮기자
export default function Overview() {
  const { socket } = useSocket();
  const { portData, deviceData, vcsData } = useCXLSocket(socket);
  const { host, vcs, device } = processCXLSocketData({ portData, vcsData });
  const [displayData, setDisplayData] = useState({
    host: [],
    vcs: [],
    device: [] /* SLD, MLD 구분이 가능해지면 추후 관련된 데이터 추가 필요 */,
  });

  console.log("port: ", portData);
  console.log("device: ", deviceData);
  console.log("vcs: ", vcsData);
  console.log("displayData: ", displayData);

  useEffect(() => {
    setDisplayData({
      host: host,
      vcs: vcs,
      device: device,
    });
  }, [portData, vcsData, deviceData]);

  return (
    <div className="w-screen h-screen bg-gray-200 flex flex-col justify-center items-center">
      {/* <Host />
      <CXLSwitch />
      <LogicalDevice /> */}
    </div>
  );
}
