import { useSocket } from "@/app/_components/providers/socket-provider";
import React, { useState, useEffect } from "react";

const AllocatorTab = ({ connectedVCSES, deviceWithLD, handleAllocate }) => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedLogicalDevice, setSelectedLogicalDevice] = useState([]);
  useEffect(() => {
    if (selectedHost === "reset") {
      setAvailableDevices([]);
    } else if (selectedHost) {
      const unusedDevices = deviceWithLD.logicalDevice.filter((ld) => !ld.used);
      setAvailableDevices(unusedDevices);
    }
  }, [selectedHost]);

  const handleLogicalDeviceSelect = (ld) => {
    setSelectedLogicalDevice((prev) =>
      prev.includes(ld) ? prev.filter((d) => d !== ld) : [...prev, ld]
    );
  };

  const handleReset = () => {
    setSelectedLogicalDevice([]);
  };

  return (
    <>
      <div style={{ display: "flex", height: "150px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div>- Select Host</div>
            <select
              style={{ width: "100%" }}
              onChange={(e) => setSelectedHost(e.target.value)}
            >
              <option value="reset">Select</option>
              {connectedVCSES.map((vcs) => (
                <option
                  key={vcs.uspId}
                  value={vcs.uspId}
                  defaultValue={selectedHost}
                >
                  {vcs.uspId}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <div>- Logical Device</div>
            {availableDevices.map((ld) => (
              <div
                key={ld.id}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedLogicalDevice.includes(ld.id)}
                  onChange={() => handleLogicalDeviceSelect(ld.id)}
                />
                {ld.id}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          onClick={
            // 값이 설정되어있지 않을 때 에러처리 필요
            () =>
              handleAllocate({
                virtualCxlSwitchId: connectedVCSES.find(
                  (vsc) => vsc.uspId === Number(selectedHost)
                ).virtualCxlSwitchId,
                matchVppbId: connectedVCSES.find(
                  (vsc) => vsc.uspId === Number(selectedHost)
                ).matchVppbId,
                boundPortId: deviceWithLD.boundPortId,
                selectedLogicalDevice: selectedLogicalDevice,
              })
          }
          style={{
            padding: "1px 5px",
            flex: 2,
            textAlign: "center",
            boxShadow: "0 0 0 2px inset",
            cursor: "pointer",
          }}
        >
          Apply
        </div>
        <div
          onClick={handleReset}
          style={{
            padding: "1px 5px",
            flex: 1,
            textAlign: "center",
            boxShadow: "0 0 0 2px inset",
            cursor: "pointer",
          }}
        >
          Reset
        </div>
      </div>
    </>
  );
};

const DeAllocatorTab = ({ connectedVCSES, deviceWithLD, handleDeAllocate }) => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedLogicalDevice, setSelectedLogicalDevice] = useState([]);

  useEffect(() => {
    if (selectedHost === "reset") {
      setAvailableDevices([]);
    } else if (selectedHost) {
      const usedDevices = deviceWithLD.logicalDevice.filter((ld) => ld.used);
      setAvailableDevices(usedDevices);
    }
  }, [selectedHost]);

  const handleLogicalDeviceSelect = (ld) => {
    setSelectedLogicalDevice((prev) =>
      prev.includes(ld) ? prev.filter((d) => d !== ld) : [...prev, ld]
    );
  };

  const handleReset = () => {
    setSelectedLogicalDevice([]);
  };

  return (
    <>
      <div style={{ display: "flex", height: "150px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div>- Select Host</div>
            <select
              style={{ width: "100%" }}
              onChange={(e) => setSelectedHost(e.target.value)}
            >
              <option value="reset">Select</option>
              {connectedVCSES.map((vcs) => (
                <option
                  key={vcs.uspId}
                  value={vcs.uspId}
                  defaultValue={selectedHost}
                >
                  {vcs.uspId}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <div>- Logical Device</div>
            {availableDevices.map((ld) => (
              <div
                key={ld.id}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedLogicalDevice.includes(ld.id)}
                  onChange={() => handleLogicalDeviceSelect(ld.id)}
                />
                {ld.id}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          onClick={() =>
            handleDeAllocate({
              virtualCxlSwitchId: connectedVCSES.find(
                (vsc) => vsc.uspId === Number(selectedHost)
              ).virtualCxlSwitchId,
              matchVppbId: connectedVCSES.find(
                (vsc) => vsc.uspId === Number(selectedHost)
              ).matchVppbId,
              boundPortId: deviceWithLD.boundPortId,
              selectedLogicalDevice: selectedLogicalDevice,
            })
          }
          style={{
            padding: "1px 5px",
            flex: 2,
            textAlign: "center",
            boxShadow: "0 0 0 2px inset",
            cursor: "pointer",
          }}
        >
          Apply
        </div>
        <div
          onClick={handleReset}
          style={{
            padding: "1px 5px",
            flex: 1,
            textAlign: "center",
            boxShadow: "0 0 0 2px inset",
            cursor: "pointer",
          }}
        >
          Reset
        </div>
      </div>
    </>
  );
};

const AllocateDeallocateMLD = ({ vcses, device, lds, handleRefresh }) => {
  const { socket } = useSocket();

  const [tab, setTab] = useState("allocator");
  const [connectedVCSES, setConnectedVCSES] = useState([]);
  const [deviceWithLD, setDeviceWithLD] = useState({ logicalDevice: [{}] });

  useEffect(() => {
    const updateDevice = { ...device, logicalDevice: lds };
    console.log("updateDevice: ", updateDevice);

    setDeviceWithLD(updateDevice);
  }, [vcses, device]);

  useEffect(() => {
    const connectedVCSES = vcses
      .filter((vcs) =>
        vcs.vppbs.some((vppb) => vppb.boundPortId === device.boundPortId)
      )
      .map((vcs) => {
        const matchVppbId = vcs.vppbs
          .filter((vppb) => vppb.boundPortId === device.boundPortId)
          .map((vppb) => vppb.vppbId)[0];

        return {
          ...vcs,
          matchVppbId, // 새로운 속성으로 추가
        };
      });
    console.log("connectedVCSES", connectedVCSES);
    setConnectedVCSES(connectedVCSES);
  }, [vcses, device]);

  const handleAllocate = ({
    virtualCxlSwitchId,
    matchVppbId,
    boundPortId,
    selectedLogicalDevice,
  }) => {
    console.log(
      `Allocate MLD's LD ${selectedLogicalDevice} to Host ${virtualCxlSwitchId}`
    );
    console.log("virtualCxlSwitchId: ", virtualCxlSwitchId);
    console.log("matchVppbId: ", matchVppbId);
    console.log("boundPortId: ", boundPortId);
    console.log("selectedLogicalDevice: ", selectedLogicalDevice);
    socket.emit(
      "vcs:allocate",
      {
        virtualCxlSwitchId: virtualCxlSwitchId,
        vppbId: matchVppbId,
        physicalPortId: Number(boundPortId),
      },
      (args) => {
        // if (args.error) {
        //   setOpen({
        //     ...open,
        //     loading: false,
        //   });
        //   showError(args.error, vppb);
        //   return;
        // }
        // handleClose();
        console.log("allcoate response: ", args);
        handleRefresh();
      }
    );
    // 소켓 통신으로 서버에 데이터 전송하는 로직 추가
  };

  const handleDeAllocate = ({
    virtualCxlSwitchId,
    matchVppbId,
    boundPortId,
    selectedLogicalDevice,
  }) => {
    console.log(
      `DeAllocate MLD's LD ${selectedLogicalDevice} to Host ${virtualCxlSwitchId}`
    );
    console.log("virtualCxlSwitchId: ", virtualCxlSwitchId);
    console.log("matchVppbId: ", matchVppbId);
    console.log("boundPortId: ", boundPortId);
    console.log("selectedLogicalDevice: ", selectedLogicalDevice);
    socket.emit(
      "vcs:deallocate",
      {
        virtualCxlSwitchId: virtualCxlSwitchId,
        vppbId: matchVppbId,
        physicalPortId: Number(boundPortId),
      },
      (args) => {
        // if (args.error) {
        //   setOpen({
        //     ...open,
        //     loading: false,
        //   });
        //   showError(args.error, vppb);
        //   return;
        // }
        // handleClose();
        console.log("Deallcoate response: ", args);
        handleRefresh();
      }
    );
  };

  return (
    <div
      style={{
        zIndex: 1,
        display: "flex",
        gap: "10px",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center",
        border: "5px solid red",
        backgroundColor: "white",
      }}
    >
      <div style={{ display: "flex", borderBottom: "2px solid black" }}>
        <div
          onClick={() => setTab("allocator")}
          style={{
            boxShadow: tab === "allocator" ? "0 0 0 2px inset" : "",
            padding: "10px",
            flex: 1,
          }}
        >
          Allocator
        </div>
        <div
          onClick={() => setTab("deallocator")}
          style={{
            boxShadow: tab === "deallocator" ? "0 0 0 2px inset" : "",
            padding: "10px",
            flex: 1,
          }}
        >
          DeAllocator
        </div>
      </div>
      {tab === "allocator" && (
        <AllocatorTab
          connectedVCSES={connectedVCSES}
          deviceWithLD={deviceWithLD}
          handleAllocate={handleAllocate}
        />
      )}
      {tab === "deallocator" && (
        <DeAllocatorTab
          connectedVCSES={connectedVCSES}
          deviceWithLD={deviceWithLD}
          handleDeAllocate={handleDeAllocate}
        />
      )}
    </div>
  );
};

export default AllocateDeallocateMLD;
