export const processCXLSocketData = ({
  portData,
  vcsData,
  deviceData,
  mldData,
}) => {
  const host = [];
  const vcs = [];
  const device = [];
  const ppb = [];

  let hostColorIndex = 0;
  portData?.forEach((port) => {
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

  const summaryMap = [];
  let vcsIndex = 0;

  vcs.forEach((v) => {
    if (v.hostPort) return;

    const summary = {
      order: vcsIndex++,
      hostNo: v.uspId,
      vcsNo: v.virtualCxlSwitchId,
      ppbNo: -1,
      ldNo: -1,
      color: "#D9D9D9",
      deviceType: "UNKNOWN",
      deviceInfo: {},
    };
    summaryMap.push(summary);

    if (v.vppb && v.vppb.bindingStatus === "BOUND_LD") {
      summary.ppbNo = v.vppb.boundPortId;
      if (v.vppb && v.vppb.boundLdId !== null) summary.ldNo = v.vppb.boundLdId;
    }

    const connectedDev = portData.find((pd) => pd.portId === summary.ppbNo);
    if (connectedDev) {
      if (connectedDev.connectedDeviceType.includes("_MLD")) {
        summary.deviceType = "MLD";
        const d = mldData.find((mld) => mld.portId === summary.ppbNo);
        if (d) {
          Object.assign(summary.deviceInfo, d);
        }
      } else {
        summary.deviceType = "SLD";
      }
    } else {
      const d = deviceData[vcsIndex];
      const p = portData.find((p) => p.portId === d.boundPortId);

      summary.hostNo = -1;
      summary.ppbNo = vcsIndex;

      if (p) {
        summary.deviceType = p.connectedDeviceType.includes("_MLD")
          ? "MLD"
          : "SLD";
      }
    }

    const connectedHost = host.find((h) => h.portId === summary.hostNo);
    if (connectedHost && summary.ppbNo !== -1) {
      summary.color = connectedHost.backgroundColor;
    }
  });

  console.log("summaryMap:", summaryMap);

  deviceData.forEach((dev) => {
    const targetPort = portData.find((p) => p.portId === dev.boundPortId);
    const summary = summaryMap.find((s) => s.ppbNo === dev.boundPortId);

    if (targetPort && summary && targetPort.ltssmState === "L0") {
      device.push({
        portType: "DSP",
        portId: summary.ppbNo,
        boundVPPBId: summaryMap
          .filter((s) => s.ppbNo === dev.boundPortId)
          .map((s) => s.order),
        hosts: [],
        deviceType: summary.deviceType,
        logicalDevices: {
          ...summary.deviceInfo,
          boundLdId: summaryMap.map((s) => ({
            hostId: s.hostNo,
            vcsId: s.vcsNo,
            from: s.order,
            to: s.ldNo,
            color: s.color,
          })),
        },
        color: summary.color,
      });

      ppb.push({
        portType: "DSP",
        portId: targetPort.portId,
        boundVPPBId: summaryMap
          .filter((s) => s.ppbNo === dev.boundPortId)
          .map((s) => s.order),
        deviceType: summary.deviceType,
      });
    } else {
      // console.log("targetPort:", targetPort);
      // console.log("summary:", summary);
    }
  });

  // console.log("device:", device);

  return {
    host,
    vcs,
    device,
    ppb,
  };

  // deviceData.forEach((dev) => {
  //   const port = portData?.find((p) => p.portId === dev.boundPortId);
  //   if (port && port.ltssmState === "L0") {
  //     device.push({
  //       portType: "DSP",
  //       portId: port.portId,
  //       boundVPPBId: boundPorts,
  //       hosts,
  //       deviceType: mld ? "MLD" : "SLD",
  //       logicalDevices: mld ? mld : null,
  //     });
  //     ppb.push({
  //       portType: "DSP",
  //       portId: port.portId,
  //       boundVPPBId: boundPorts,
  //       deviceType: mld ? "MLD" : "SLD",
  //     });
  //   } else {
  //     device.push(null);
  //     ppb.push(null);
  //   }
  // });

  // device.forEach((dev, index) => {
  //   if (dev?.deviceType === "MLD") {
  //     const boundLdIds = dev.boundVPPBId.map((deviceVPPBID) => {
  //       const matchingVCS = vcs.find((v) => v.vppb.vppbId === deviceVPPBID);
  //       return {
  //         hostId: matchingVCS?.uspId,
  //         vcsId: matchingVCS?.virtualCxlSwitchId,
  //         from: matchingVCS?.vppb.vppbId ?? null,
  //         to: matchingVCS?.vppb.boundLdId,
  //       };
  //     });

  //     boundLdIds.forEach((ld, index) => {
  //       if (index >= 4) {
  //         ld.hostId = 2;
  //         ld.vcsId = 1;
  //         ld.from += 5;
  //         ld.to += 4;
  //       }
  //     });

  //     device[index] = {
  //       ...dev,
  //       logicalDevices: {
  //         ...dev.logicalDevices,
  //         boundLdId: boundLdIds,
  //       },
  //     };
  //   }
  // });

  // // console.log(device);

  // return {
  //   host,
  //   vcs,
  //   device,
  //   ppb,
  // };
};
