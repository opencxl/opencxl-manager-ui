export const processInitialNodes = ({
  host,
  vcs,
  ppb,
  device,
  initialNodes,
  availableNode,
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
    data.backgroundColor = COLOR[index] || "#EEEEFF";
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

  const defaultZIndex = 0; // default value
  const vppbZIndex = 1; // set when need to focus
  const ppbZIndex = 1; // set when need to focus
  const deviceZIndex = 1; // set when need to focus
  const wrapperZIndex = 1; // set when something focus (vppbZIndex, ppbZIndex, deviceZIndex)
  const backgrounZIndex = 0; // fixed value

  /* backgroud & wrapper */
  initialNodes.push({
    id: "wrapper",
    type: "group",
    position: {
      x: 0,
      y: 0,
    },
    style: {
      width: "100%",
      height: "100%",
      backgroundColor: "black",
      opacity: 0.5,
      zIndex: !availableNode?.vppb ? defaultZIndex : wrapperZIndex,
    },
    selectable: false,
  });

  initialNodes.push({
    id: "background",
    type: "group",
    position: {
      x: 0,
      y: 0,
    },
    style: {
      width: "100%",
      height: "100%",
      backgroundColor: "#0c1320",
      opacity: 1,
      zIndex: backgrounZIndex,
    },
    selectable: false,
  });

  /* VCS Group */
  const vcsGroup = {
    id: "group_vcs",
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
      border: "none",
    },
    selectable: false,
  };

  /* vPPB Group */
  const vppbGroup = [];
  host.map((data, index) => {
    vppbGroup.push({
      id: `group_vppb_${data.portId}`,
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
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "start",
        padding: "20px",
        fontSize: "14px",
        color: "#4C4C4C",
      },
      parentId: "group_vcs",
      extend: "parent",
      className: "vcs_group",
      selectable: false,
    });
  });

  /* ppbGroup */
  const ppbGroup = {
    id: "group_ppb",
    type: "group",
    position: { x: gap.row, y: 252 },
    style: {
      width: `${groupBox.ppbWidth}px`,
      height: "96px",
      border: "none",
      backgroundColor: "#613F00",
      borderRadius: groupBox.smallRadius,
    },
    parentId: "group_vcs",
    extend: "parent",
    selectable: false,
  };
  initialNodes.push(vcsGroup, ...vppbGroup, ppbGroup);

  /* Host */
  host.map((data, index) => {
    initialNodes.push({
      id: `host_${data.portId}`,
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
      parentId: `group_vppb_${data.portId}`,
      extend: "parent",
      selectable: false,
    });
  });

  /* vPPB For Host */
  vPPBForHOST.map((data, index) => {
    initialNodes.push({
      id: `usp_${data.uspId}`,
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
        border: "2px solid #ACA9F1",
        borderRadius: nodeBox.borderRadius,
        backgroundColor: "#0c1320",
        color: "#ACA9F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      },
      parentId: `group_vppb_${data.uspId}`,
      extend: "parent",
      selectable: false,
    });
  });

  /* vPPB For PPB */
  let currentId = null;
  let index = 0;
  vPPBForPPB.map((data) => {
    if (currentId !== data.uspId) {
      currentId = data.uspId;
      index = 0;
    }
    initialNodes.push({
      id: `vppb_usp_${data.uspId}_vcs_${data.virtualCxlSwitchId}_vppb_${data.vppb.vppbId}`,
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
        border: "2px solid #ACA9F1",
        borderRadius: nodeBox.borderRadius,
        backgroundColor:
          (availableNode?.vppb?.vppb.vppbId === data.vppb.vppbId) &
          (availableNode?.vcs === data.virtualCxlSwitchId)
            ? "#ACA9F1"
            : "#0c1320",
        color:
          (availableNode?.vppb?.vppb.vppbId === data.vppb.vppbId) &
          (availableNode?.vcs === data.virtualCxlSwitchId)
            ? "white"
            : "#ACA9F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        zIndex: !(
          (availableNode?.vppb?.vppb.vppbId === data.vppb.vppbId) &
          (availableNode?.vcs === data.virtualCxlSwitchId)
        )
          ? defaultZIndex
          : vppbZIndex,
        opacity: 1,
        position: "absolute",
      },
      className: "vppb_node",
      parentId: `group_vppb_${data.uspId}`,
      extend: "parent",
    });
    index++;
  });

  /* PPB */
  ppb.map((data, index) => {
    initialNodes.push({
      id: `ppb_${data.portId}`,
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
        zIndex: !availableNode.ppb?.some((info) => {
          return info.portId === data.portId;
        })
          ? defaultZIndex
          : ppbZIndex,
        opacity: 1,
      },
      className: `${
        !availableNode.ppb?.some((info) => {
          return info.portId === data.portId;
        })
          ? defaultZIndex
          : ppbZIndex
          ? "ppb_node"
          : ""
      }`,
      parentId: "group_ppb",
      extend: "parent",
    });
  });

  /* Device */
  device.map((data, index) => {
    initialNodes.push({
      id: `device_${data.portId}`,
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
        zIndex: true ? defaultZIndex : deviceZIndex,
        opacity: 1,
      },
      parentId: "group_ppb",
      extend: "parent",
    });
  });

  return initialNodes;
};
