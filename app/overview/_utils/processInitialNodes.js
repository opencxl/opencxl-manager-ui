export const processInitialNodes = ({
  host,
  vcs,
  ppb,
  device,
  initialNodes,
}) => {
  const vPPBForHOST = [];
  const vPPBForPPB = [];
  vcs.map((data) => {
    data.hostPort ? vPPBForHOST.push(data) : vPPBForPPB.push(data);
  });

  const nodeBox = {
    width: 114,
    height: 56,
    borderRadius: 8,
  };

  const gap = {
    row: 24,
    column: 20,
  };

  const padding = {
    vPPB: 20,
    PPB: 38,
  };

  const COLOR = ["#2097F6", "#65BF73"];
  host.map((data, index) => {
    data.backgroundColor = COLOR[index];
  });

  const eachHostvPPBlength = [];
  host.map((data) => {
    eachHostvPPBlength.push(
      vPPBForPPB.filter((info) => data.portId === info.uspId).length
    );
  });
  const vcsWidth = eachHostvPPBlength.map((data) => {
    return data * nodeBox.width + gap.row * (data - 1) + padding.vPPB * 2;
  });

  const groupBox = {
    vcsWidth: vcsWidth,
    ppbWidth:
      ppb.length * nodeBox.width + gap.row * (ppb.length - 1) + padding.PPB * 2,
    switchWidth:
      ppb.length * nodeBox.width +
      gap.row * (ppb.length - 1) +
      padding.PPB +
      2 * padding.PPB,
    largeRadius: 53,
    smallRadius: 32,
  };

  /* VCS Group*/
  const vcsGroup = {
    id: "vcs",
    type: "group",
    position: {
      x: 1920 - groupBox.switchWidth - (1920 - groupBox.switchWidth) / 2,
      y: 195,
    },
    style: {
      width: `${groupBox.switchWidth}px`,
      height: "368px",
      backgroundColor: "#34362C",
      borderRadius: groupBox.largeRadius,
      zIndex: -2,
    },
    selectable: false,
  };

  /* vPPB Group */
  const vppbGroup = [];
  host.map((data, index) => {
    vppbGroup.push({
      id: `vppb__host_${data.portId}`,
      type: "default",
      position: { x: 20 * (index + 1) + index * vcsWidth[index], y: 20 },
      data: { label: `VCS${index}` },
      style: {
        width: `${vcsWidth[index]}px`,
        height: "212px",
        border: "white",
        borderRadius: 32,
        backgroundColor: "#0C1320",
        color: "white",
        zIndex: -1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "start",
        padding: "20px",
        fontSize: "14px",
        color: "#4C4C4C",
      },
      parentId: "vcs",
      extend: "parent",
      selectable: false,
    });
  });

  /* ppbGroup */
  const ppbGroup = {
    id: "ppb",
    type: "group",
    position: { x: gap.row, y: 252 },
    style: {
      width: `${groupBox.ppbWidth}px`,
      height: "96px",
      border: "none",
      backgroundColor: "#613F00",
      borderRadius: groupBox.smallRadius,
      zIndex: -1,
    },
    parentId: "vcs",
    extend: "parent",
    selectable: false,
  };
  initialNodes.push(vcsGroup, ...vppbGroup, ppbGroup);

  /* Host */
  host.map((data, index) => {
    initialNodes.push({
      id: `type_host_usp_${data.portId}_vcs_X_vppb_X_ppb_X_device_X_ld_X`, // id 변경
      position: {
        x:
          groupBox.vcsWidth[index] -
            nodeBox.width -
            (groupBox.vcsWidth[index] - nodeBox.width) / 2 || 0,
        y: -96,
      },
      data: { ...data, type: "host", label: `Host ${data.portId}` },
      type: "input",
      style: {
        width: `${nodeBox.width}px`,
        height: `${nodeBox.height}px`,
        backgroundColor: `${data.backgroundColor}`,
        border: "none",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        fontWeight: "600",
        color: "white",
      },
      parentId: `vppb__host_${data.portId}`,
      extend: "parent",
    });
  });

  /* vPPB For Host*/
  vPPBForHOST.map((data, index) => {
    initialNodes.push({
      id: `type_vppbForHost_usp_${data.uspId}_vcs_X_vppb_X_ppb_X_device_X_ld_X`, // id 변경
      position: {
        x:
          groupBox.vcsWidth[index] -
            nodeBox.width -
            (groupBox.vcsWidth[index] - nodeBox.width) / 2 || 0,
        y: 20,
      },
      data: {
        ...data,
        type: "vppb",
        label: "vPPB",
      },
      style: {
        width: `${nodeBox.width}px`,
        height: `${nodeBox.height}px`,
        backgroundColor: "#0c1320",
        border: "2px solid #ACA9F1",
        borderRadius: nodeBox.borderRadius,
        color: "#ACA9F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      },
      parentId: `vppb__host_${data.uspId}`,
      extend: "parent",
    });
  });

  /* vPPB For PPB*/
  let currentId = null;
  let index = 0;
  vPPBForPPB.map((data) => {
    if (currentId !== data.uspId) {
      currentId = data.uspId;
      index = 0;
    }
    initialNodes.push({
      id: `type_vppbForPPB_usp_${data.uspId}_vcs_${data.virtualCxlSwitchId}_vppb_${data.vppb.vppbId}_ppb_X_device_X_ld_X`, // id 변경
      position: {
        x: padding.vPPB + index * (nodeBox.width + gap.row) || 0,
        y: 136,
      },
      data: {
        ...data,
        type: "vppb",
        label: `vPPB ${data.vppb.vppbId}`,
      },
      style: {
        width: `${nodeBox.width}px`,
        height: `${nodeBox.height}px`,
        backgroundColor: "#0c1320",
        border: "2px solid #ACA9F1",
        borderRadius: nodeBox.borderRadius,
        color: "#ACA9F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      },
      parentId: `vppb__host_${data.uspId}`,
      extend: "parent",
    });
    index++;
  });

  /* PPB */
  ppb.map((data, index) => {
    initialNodes.push({
      id: `type_ppb_usp_X_vcs_X_vppb_X_ppb_${data.portId}_device_sld_ld_X`, // id 변경
      position: {
        x: padding.PPB + index * (nodeBox.width + gap.row) || 0,
        y: 20,
      },
      data: { ...data, type: "ppb", label: `PPB ${data.portId}` },
      style: {
        width: `${nodeBox.width}px`,
        height: `${nodeBox.height}px`,
        backgroundColor: "#613F00",
        border: "2px solid #ACA9F1",
        borderRadius: nodeBox.borderRadius,
        color: "#ACA9F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      },
      parentId: "ppb",
      extend: "parent",
    });
  });

  /* Device */
  device.map((data, index) => {
    initialNodes.push({
      id: `type_device_usp_X_vcs_X_vppb_X_ppb_${data.portId}_device_sld_ld_X`, // id 변경
      type: "output",
      position: {
        x: padding.PPB + index * (nodeBox.width + gap.row) || 0,
        y: 136,
      },
      data: { ...data, type: "device", label: `Device ${data.portId}` }, // SLD 또는 MLD 구분 해야함.
      style: {
        width: `${nodeBox.width}px`,
        height: `${nodeBox.height}px`,
        backgroundColor: `${
          host.find((info) => data.hostId === info.portId)?.backgroundColor ||
          "#EEEEFF"
        }`,
        border: "none",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      },
      parentId: "ppb",
      extend: "parent",
    });
  });

  return initialNodes;
};
