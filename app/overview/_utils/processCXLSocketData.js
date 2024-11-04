export const processCXLSocketData = ({ portData, vcsData }) => {
  const host = [];
  const vcs = [];
  const device = [];

  portData.forEach((port) => {
    if (port.currentPortConfigurationState === "USP") {
      if (port.ltssmState === "L0") {
        host.push({ portType: "USP", portId: port.portId });
      } else {
        host.push(null);
      }
    } else if (port.currentPortConfigurationState === "DSP") {
      if (port.ltssmState === "L0") {
        device.push({
          portType: "DSP",
          portId: port.portId,
          boundVPPBId: null,
        });
      } else {
        device.push(null);
      }
    }
  });

  vcsData.forEach((data) => {
    data.ppb_info_list.forEach((vppb) => {
      if (vppb.bindingStatus === "UNBOUND") {
        vcs.push({
          uspId: data.uspId,
          vppb: { ...vppb, hostId: null, boundPortId: null },
        });
      } else if (vppb.bindingStatus === "BOUND_LD") {
        vcs.push({ uspId: data.uspId, vppb: vppb });
      }
    });
  });

  device.forEach((deviceInfo) => {
    const boundVppb = vcs.find(
      (vcsInfo) => deviceInfo.portId === vcsInfo.vppb.boundPortId
    );
    if (boundVppb && boundVppb.vppb) {
      deviceInfo.boundVPPBId = boundVppb.vppb.vppbId;
      deviceInfo.hostId = boundVppb.uspId;
    }
  });

  return {
    host,
    vcs,
    device,
  };
};
