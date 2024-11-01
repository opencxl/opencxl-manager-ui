"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactFlow, addEdge, useNodesData, useNodesState } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "0",
    type: "group",
    position: { x: 0, y: 0 },
    style: { width: "100px", height: "200px" },
  },
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "1", endpoint: "host" },
    style: { width: "50px" },
  },
  {
    id: "2",
    position: { x: 150, y: 0 },
    data: { label: "2", endpoint: "host" },
    style: { width: "50px" },
  },
  {
    id: "3",
    position: { x: 300, y: 0 },
    data: { label: "3", endpoint: "host" },
    style: { width: "50px" },
  },
  {
    id: "4",
    position: { x: 450, y: 0 },
    data: { label: "4", endpoint: "host" },
    style: { width: "50px" },
  },
  {
    id: "5",
    position: { x: 0, y: 100 },
    // device에는 연결된 host도 표시가 되어야 할거 같음
    data: { label: "5", endpoint: "device" },
    style: { width: "50px" },
    parentId: "1",
    extend: "parent",
    // dragging: false,
    // draggable: false,
    // deletable: false,
    // connectable: false,
    // resizing: false,
  },
];

const initialEdges = [
  { id: "e5-1", source: "1", target: "" },
  { id: "e5-2", source: "2", target: "5" },
  { id: "e5-3", source: "3", target: "5" },
  { id: "e5-4", source: "4", target: "5" },
];

const TestReactFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgeschange] = useNodesState(initialEdges);
  const [unConnectedNodes, setUnConnectedNodes] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);
  console.log("nodes: ", nodes);
  console.log("edges: ", edges);

  useEffect(() => {
    console.log("Nodes state updated:", nodes);
  }, [nodes]);

  const handleBindUnbind = () => {
    const sourceEdge = edges.find((edge) => {
      const match = edge.id.match(/^e5-(\d+)$/);
      return match && match[1] === selectedHost;
    });
    console.log("sourceEdge: ", sourceEdge);
    console.log("click");
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === sourceEdge.id
          ? {
              ...edge,
              target: edge.target == selectedDevice ? "" : selectedDevice,
            }
          : edge
      )
    );
  };

  const handleNode = (e) => {
    const id = e.currentTarget.dataset.id;
    const unConnected = initialNodes.filter(
      (node) => node.data?.endpoint === "device"
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
