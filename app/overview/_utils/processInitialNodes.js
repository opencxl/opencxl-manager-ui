export const processInitialNodes = ({
  host,
  vcs,
  ppb,
  device,
  containerWidth,
  initialNodes,
}) => {
  /* Host */
  const boxWidth = 180;
  const totalBoxWidth = host.length * boxWidth;
  const remainingSpace = containerWidth - totalBoxWidth;
  const gap = remainingSpace / (host.length + 1);

  /* VCS */
  const vcsBoxWidth = containerWidth * 0.95;
  const startVCSBox = (containerWidth - vcsBoxWidth) / 2;

  const vcsGroup = {
    id: "vcs",
    type: "group",
    position: { x: startVCSBox, y: 143 },
    style: {
      width: "95%",
      height: "55%",
      backgroundColor: "#0c1320", //D1F05C
      border: "2px solid #D1F05C",
      borderRadius: 53,
    },
  };

  // Host 개수별로 생겨야함
  const vppbGroup = {
    id: "vppb",
    type: "group",
    position: { x: 0, y: 40 },
    style: { width: "30%", height: "20%" },
    parentId: "vcs",
    extend: "parent",
  };

  const ppbGroup = {
    id: "ppb",
    type: "group",
    position: { x: 0, y: 360 },
    style: { width: "20%", height: "10%" },
    parentId: "vcs",
    extend: "parent",
  };
  initialNodes.push(vcsGroup, vppbGroup, ppbGroup);

  host.map((data, index) => {
    initialNodes.push({
      id: `host${data.portId}`,
      position: { x: gap + index * (boxWidth + gap) || 0, y: 43 },
      data: { ...data, type: "host", label: `Host ${data.portId}` },
      type: "input",
      style: {
        width: "180px",
        height: "60px",
        backgroundColor: "#5452F6",
        border: "none",
        borderRadius: "8px",
        boxShadow: "5px 5px 1px #30328B",
      }, // FF5A43
    });
  });

  vcs.map((data, index) => {
    data.hostPort
      ? initialNodes.push({
          id: `host${data.uspId}_vppb${data.vppb.vppbId}`,
          position: { x: gap + index * (boxWidth + gap) || 0, y: 40 },
          data: {
            ...data,
            type: "vppb",
            label: "vPPB USP",
          },
          style: {
            width: "180px",
            height: "60px",
            backgroundColor: "#ACA9F1",
            border: "none",
            borderRadius: "8px",
            boxShadow: "5px 5px 1px #565478",
          },
          parentId: "vppb",
          extend: "parent",
        })
      : initialNodes.push({
          id: `host${data.uspId}_vppb${data.vppb.vppbId}`,
          position: { x: (index - 1) * 200 || 0, y: 180 }, // vsc 위치에 맞추서 수정 필요
          data: {
            ...data,
            type: "vppb",
            label: `vPPB ${data.vppb.vppbId}`,
          },
          style: {
            width: "180px",
            height: "60px",
            backgroundColor: "#ACA9F1",
            border: "none",
            borderRadius: "8px",
            boxShadow: "5px 5px 1px #565478",
          },
          parentId: "vppb",
          extend: "parent",
        });
  });
  ppb.map((data, index) => {
    initialNodes.push({
      id: `ppb${data.portId}`,
      position: { x: (index + 1) * 200 || 0, y: 40 },
      data: { ...data, type: "ppb", label: `PPB` },
      style: {
        width: "180px",
        height: "60px",
        backgroundColor: "#ACA9F1",
        border: "none",
        borderRadius: "8px",
        boxShadow: "5px 5px 1px #565478",
      },
      parentId: "ppb",
      extend: "parent",
    });
  });
  device.map((data, index) => {
    initialNodes.push({
      id: `device${data.portId}`,
      type: "output",
      position: { x: (index + 1) * 200 || 0, y: 723 },
      data: { ...data, type: "device", label: `Device ${data.portId}` },
      style: {
        width: "180px",
        height: "60px",
        backgroundColor: "#EEEEFF",
        border: "none",
        borderRadius: "8px",
        boxShadow: "5px 5px 1px #ACA9F1",
      },
    });
  });

  return initialNodes;
};
