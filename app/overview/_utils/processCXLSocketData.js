export const processCXLSocketData = ({ portData, vcsData }) => {
  const host = [];
  const vcs = [];
  const device = [];
  const ppb = [];

  portData.forEach((port) => {
    if (port.currentPortConfigurationState === "USP") {
      if (port.ltssmState === "L0") {
        host.push({
          portType: "USP",
          portId: port.portId,
          backgroundColor: null,
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
      } else {
        host.push(null);
      }
    } else if (port.currentPortConfigurationState === "DSP") {
      if (port.ltssmState === "L0") {
        device.push({
          portType: "DSP",
          portId: port.portId,
          boundVPPBId: [],
        });
        ppb.push({
          portType: "DSP",
          portId: port.portId,
          boundVPPBId: [],
          type: "SLD", // MLD, SLD를 넣는다.
        });
      } else {
        device.push(null);
        ppb.push(null);
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
        // ppb.portId와 vppb.bounPortId가 같은게 있다면, ppb.boundVPPBId에 push 해야한다.
      }
    });
  });

  device.forEach((deviceInfo) => {
    const boundVppb = vcs.find(
      (vcsInfo) => deviceInfo?.portId === vcsInfo.vppb.boundPortId
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
    ppb,
  };
};
