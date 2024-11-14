const dummyData = {
  devices: [
    {
      boundPortId: 8,
      deviceSerialNumber: "4E9FF167169AAAAA",
      pcieDeviceId: 7621,
      pcieSubsystemId: 0,
      pcieSubsystemVendorId: 0,
      pcieVendorId: 61441,
      totalCapacity: 1,
      deviceType: "MLD",
      logicalDevice: [
        {
          deviceSerialNumber: "4E9FF167169BBBBB",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169CCCCC",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169DDDDD",
          totalCapacity: 1,
        },
      ],
    },
    {
      boundPortId: 9,
      deviceSerialNumber: "4E9FF167169EEEEE",
      pcieDeviceId: 7621,
      pcieSubsystemId: 0,
      pcieSubsystemVendorId: 0,
      pcieVendorId: 61441,
      totalCapacity: 1,
      deviceType: "MLD",
      logicalDevice: [
        {
          deviceSerialNumber: "4E9FF167169FFFFFF",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169GGGGG",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169HHHHH",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169IIIII",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169JJJJJ",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169KKKKK",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169LLLLL",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169MMMMM",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169NNNNN",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169OOOOO",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169PPPPP",
          totalCapacity: 1,
        },
        {
          deviceSerialNumber: "4E9FF167169QQQQQ",
          totalCapacity: 1,
        },
      ],
    },
  ],
  ports: [
    {
      connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
      connectedDeviceType: "CXL_TYPE_3_SLD",
      currentLinkSpeed: 0,
      currentPortConfigurationState: "DSP",
      firstNegotiatedLaneNumber: 0,
      linkStateFlags: 0,
      ltssmState: "L0",
      maxLinkSpeed: 0,
      maximumLinkWidth: 0,
      negotiatedLinkWidth: 0,
      portId: 8,
      supportedCxlModes: 2,
      supportedLdCount: 0,
      supportedLinkSpeedsVector: 0,
    },
    {
      connectedDeviceMode: "CXL_68B_FLIT_AND_VH_MODE",
      connectedDeviceType: "CXL_TYPE_3_SLD",
      currentLinkSpeed: 0,
      currentPortConfigurationState: "DSP",
      firstNegotiatedLaneNumber: 0,
      linkStateFlags: 0,
      ltssmState: "L0",
      maxLinkSpeed: 0,
      maximumLinkWidth: 0,
      negotiatedLinkWidth: 0,
      portId: 9,
      supportedCxlModes: 2,
      supportedLdCount: 0,
      supportedLinkSpeedsVector: 0,
    },
  ],
  vppbs: [
    { vppbId: 2, bindingStatus: "BOUND_LD", boundPortId: 8, boundLdId: 255 },
    { vppbId: 3, bindingStatus: "BOUND_LD", boundPortId: 9, boundLdId: 255 },
  ],
};

export const processCXLSocketData = ({ portData, vcsData, deviceData }) => {
  const host = [];
  const vcs = [];
  const device = [];
  const ppb = [];

  dummyData.devices.forEach((dev) => {
    const sn = dev.deviceSerialNumber;
    if (!deviceData.some((d) => d.deviceSerialNumber === sn)) {
      deviceData.push(dev);
    }
  });

  dummyData.ports.forEach((port) => {
    if (!portData.some((p) => p.portId === port.portId)) {
      portData.push(port);
    }
  });

  dummyData.vppbs.forEach((vppb) => {
    // vcs는 2개라 가정, 2번째 vcs에 vppbs 추가
    vcsData.forEach((vcs) => {
      if (!vcs.vppbs.some((v) => v.vppbId === vppb.vppbId)) {
        vcs.vppbs.push(vppb);
      }
    });
  });

  deviceData.forEach((dev) => {
    if (!dev.deviceType) {
      dev["deviceType"] = "SLD";
    }

    const port = portData.find((p) => p.portId === dev.boundPortId);
    if (port && port.ltssmState === "L0") {
      device.push({
        portType: "DSP",
        portId: port.portId,
        boundVPPBId: [],
        deviceType: dev.deviceType,
        logicalDevices: !!dev.logicalDevice
          ? dev.logicalDevice.map((ld) => ({
              ...ld,
              allocated: -1,
            }))
          : undefined,
      });
      ppb.push({
        portType: "DSP",
        portId: port.portId,
        boundVPPBId: [],
        deviceType: dev.deviceType,
      });
    } else {
      device.push(null);
      ppb.push(null);
    }
  });

  let hostColorIndex = 0;
  portData.forEach((port) => {
    if (port.currentPortConfigurationState === "USP") {
      if (port.ltssmState === "L0") {
        const COLOR = ["#2097F6", "#65BF73"];
        host.push({
          portType: "USP",
          portId: port.portId,
          backgroundColor: COLOR[hostColorIndex],
        });
        vcs.push({
          uspId: port.portId,
          hostPort: true,
          vppb: {
            bindingStatus: null,
            boundLdId: null,
            boundPortId: port.portId,
            vppbId: null,
          },
        });
        hostColorIndex++;
      } else {
        host.push(null);
      }
    }
  });

  vcsData.forEach((data) => {
    data.vppbs.forEach((vppb) => {
      if (vppb.bindingStatus === "UNBOUND") {
        vcs.push({
          virtualCxlSwitchId: data.virtualCxlSwitchId,
          uspId: data.uspId,
          vppb: { ...vppb, hostId: null, boundPortId: null },
        });
      } else if (vppb.bindingStatus === "BOUND_LD") {
        vcs.push({
          virtualCxlSwitchId: data.virtualCxlSwitchId,
          uspId: data.uspId,
          vppb: vppb,
        });
        ppb.map((info) => {
          if (info?.portId === vppb.boundPortId) {
            info.boundVPPBId.push(vppb.vppbId);
          }
        });
      }
    });
  });

  // console.log("deviceInfo: ", device);
  // console.log("deviceData: ", deviceData);
  // device.forEach((deviceInfo) => {
  //   const boundVppb = vcs.find(
  //     (vcsInfo) => deviceInfo?.portId === vcsInfo.vppb.boundPortId
  //   );
  //   if (boundVppb && boundVppb.vppb) {
  //     deviceInfo.boundVPPBId = boundVppb.vppb.vppbId;
  //     deviceInfo.hostId = boundVppb.uspId;
  //   }
  // });
  // device.push({
  //   portType: "DSP",
  //   portId: port.portId,
  //   boundVPPBId: [],
  // });

  // ??
  // deviceData.forEach((deviceInfo) => {
  //   device.push({
  //     portType: "DSP",
  //     portId: boundPortId, // 필요 없을수있다.
  //     // type: device
  //   });
  //   // const boundVppb = vcs.find(
  //   //   (vcsInfo) => deviceInfo?.portId === vcsInfo.vppb.boundPortId
  //   // );
  //   // if (boundVppb && boundVppb.vppb) {
  //   //   deviceInfo.boundVPPBId = boundVppb.vppb.vppbId;
  //   //   deviceInfo.hostId = boundVppb.uspId;
  //   // }
  // });

  return {
    host,
    vcs,
    device,
    ppb,
  };
};
