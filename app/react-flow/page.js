"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactFlow, addEdge, useNodesData, useNodesState } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "1", connected: false, type: "host" },
    style: { width: "50px" },
  },
  {
    id: "2",
    position: { x: 150, y: 0 },
    data: { label: "2", connected: false, type: "host" },
    style: { width: "50px" },
  },
  {
    id: "3",
    position: { x: 300, y: 0 },
    data: { label: "3", connected: false, type: "host" },
    style: { width: "50px" },
  },
  {
    id: "4",
    position: { x: 450, y: 0 },
    data: { label: "4", connected: false, type: "host" },
    style: { width: "50px" },
  },
  {
    id: "5",
    position: { x: 0, y: 100 },
    data: { label: "5", connected: false, type: "device" },
    // device에는 연결된 host도 표시가 되어야 할거 같음
    style: { width: "50px" },
    // dragging: false,
    // draggable: false,
    // deletable: false,
    // connectable: false,
    // resizing: false,
  },
];

const TestReactFlow = () => {
  const initialEdges = [
    { id: "e5-1", source: "5", target: "" },
    { id: "e5-2", source: "5", target: "" },
    { id: "e5-3", source: "5", target: "" },
    { id: "e5-4", source: "5", target: "" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgeschange] = useNodesState(initialEdges);
  const [unConnectedNodes, setUnConnectedNodes] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);
  console.log("initialNodes: ", initialNodes);
  // console.log("unConnected: ", unConnectedNodes);
  // console.log("selectedDevice: ", selectedDevice);
  // console.log("selectedHost: ", selectedHost);
  // console.log("selectedHost: ", selectedHost);
  useEffect(() => {
    console.log("Nodes state updated:", initialNodes);
  }, [initialNodes]);

  const handleBindUnbind = () => {
    const targetEdge = initialEdges.find((edge) => {
      const match = edge.id.match(/^e5-(\d+)$/);
      return match && match[1] === selectedHost;
    });
    console.log("click");
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === targetEdge.id
          ? {
              ...edge,
              target: edge.target == selectedHost ? "" : selectedHost,
            }
          : edge
      )
    );
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === selectedHost) {
          console.log("Updating node:", node.id); // 노드 업데이트 로그
          console.log("node: ", node.data);
          return {
            ...node,
            data: { ...node.data, connected: true },
          };
        }
        return node;
        // console.log(
        //   "node id: ",
        //   typeof node.id,
        //   "selectedHost: ",
        //   typeof selectedHost,
        //   "current connected state: ",
        //   node.data.connected,
        //   "compare: ",
        //   node.id === selectedHost
        // );
        // return node.id === selectedHost
        //   ? {
        //       ...node,
        //       data: { ...node.data, connected: true },
        //     }
        //   : node;
      })
    );
  };

  // if (edges[0].target === "") {
  //   setEdges([{ id: "e1-2", source: "1", target: "2" }]);
  // } else if (edges[0].target === "2") {
  //   setEdges([{ id: "e1-2", source: "1", target: "" }]);
  // }
  const handleNode = (e) => {
    const id = e.currentTarget.dataset.id;
    const unConnected = initialNodes.filter(
      (node) => node.data.type === "device"
    );

    console.log("id: ", id);
    console.log("unConnected: ", unConnected);
    setUnConnectedNodes(unConnected);
    setSelectedHost(id);
  };

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  return (
    <>
      <div
        style={{
          width: "",
          height: "50vh",
          backgroundColor: "white",
          display: "flex",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgeschange}
          nodesDraggable={false} // 노드 고정
          viewport={{ zoom: 1 }} // 스크롤로 확대 축소 금지
          style={{ margin: "100px" }}
          onNodeClick={handleNode}
          deleteKeyCode={null} // Delete 안되도록 설정
        />
      </div>
      <select onChange={(e) => setSelectedDevice(e.target.value)}>
        <option value="reset">Select</option>
        {unConnectedNodes.map((node) => (
          <option key={node.id} value={node.id} defaultValue={node.id}>
            {node.id}
          </option>
        ))}
      </select>
      <div>
        <button onClick={handleBindUnbind}>Bind&UnBind</button>
      </div>
    </>
  );
};

export default TestReactFlow;
