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

  vcsData?.forEach((data) => {
    data.vppbs.forEach((vppb) => {
      if (vppb.bindingStatus === "UNBOUND") {
        vcs.push({
          virtualCxlSwitchId: data.virtualCxlSwitchId,
          uspId: data.uspId,
          vppb: { ...vppb, hostId: data.uspId, boundPortId: null },
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

  deviceData.forEach((dev) => {
    const mld = mldData.find((m) => m.portId === dev.boundPortId);
    let hosts = [];
    let boundPorts = [];

    vcs.forEach((v) => {
      if (v.vppb.boundPortId === dev.boundPortId) {
        const status = v.vppb.bindingStatus;
        if (status === "BOUND_LD") {
          const relatedHost = host.find((h) => h.portId === v.uspId);
          hosts.push({
            hostId: v.uspId,
            color: relatedHost?.backgroundColor,
            vppbId: v.vppb.vppbId,
            virtualCxlSwitchId: v.virtualCxlSwitchId,
          });
          boundPorts.push(v.vppb.vppbId);
        }
      } else if (!v.hostPort) {
        hosts.push({
          hostId: -1,
          color: "#D9D9D9",
          vppId: v.vppb.vppbId,
          virtualCxlSwitchId: v.virtualCxlSwitchId,
          uspId: v.uspId,
        });
      }
    });
    const port = portData?.find((p) => p.portId === dev.boundPortId);
    if (port && port.ltssmState === "L0") {
      device.push({
        portType: "DSP",
        portId: port.portId,
        boundVPPBId: boundPorts,
        hosts,
        deviceType: mld ? "MLD" : "SLD",
        logicalDevices: mld ? mld : null,
      });
      ppb.push({
        portType: "DSP",
        portId: port.portId,
        boundVPPBId: boundPorts,
        deviceType: mld ? "MLD" : "SLD",
      });
    } else {
      device.push(null);
      ppb.push(null);
    }
  });

  device.forEach((dev, index) => {
    if (dev?.deviceType === "MLD") {
      let boundLdIds = dev.hosts.map((h, index) => {
        const matchingVCS = vcs.find(
          (item) => item.uspId === h.hostId && item.vppb.vppbId === h.vppbId
        );

        if (matchingVCS) {
          return {
            hostId: matchingVCS.uspId,
            vcsId: matchingVCS.virtualCxlSwitchId,
            from: matchingVCS.vppb.vppbId ?? null,
            to: matchingVCS.vppb.boundLdId,
            order: matchingVCS.vppb.boundLdId,
          };
        } else {
          // return {
          //   hostId: h.hostId,
          //   vcsId: null,
          //   from: null,
          //   to: -1,
          //   order: index,
          // };
        }
      });

      for (let i = 0; i < dev.logicalDevices.numberOfLds; i++) {
        if (!boundLdIds.some((ld) => ld && ld.to === i)) {
          boundLdIds.push({
            hostId: -1,
            vcsId: -1,
            from: null,
            to: i,
            order: i,
          });
        }
      }

      boundLdIds = boundLdIds.filter((ld) => ld !== undefined);
      boundLdIds.sort((a, b) => a.to - b.to);

      device[index] = {
        ...dev,
        logicalDevices: {
          ...dev.logicalDevices,
          boundLdId: boundLdIds,
        },
      };
    }
  });

  return {
    host,
    vcs,
    device,
    ppb,
  };
};
