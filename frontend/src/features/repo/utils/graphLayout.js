const fileLabel = (filePath) => filePath.split("/").pop();

export const buildFlowGraph = (edges) => {
  const nodeIds = new Set();
  edges.forEach((e) => {
    nodeIds.add(e.from);
    nodeIds.add(e.to);
  });

  const nodeList = Array.from(nodeIds);

  const incomingCount = {};
  nodeList.forEach((id) => (incomingCount[id] = 0));
  edges.forEach((e) => {
    incomingCount[e.to] = (incomingCount[e.to] || 0) + 1;
  });

  const roots = nodeList.filter((id) => incomingCount[id] === 0);
  const visited = new Set();
  const levels = {};

  const assignLevel = (id, level) => {
    if (visited.has(id) && levels[id] >= level) return;
    visited.add(id);
    levels[id] = Math.max(levels[id] || 0, level);
    edges.filter((e) => e.from === id).forEach((e) => assignLevel(e.to, level + 1));
  };

  roots.forEach((id) => assignLevel(id, 0));
  nodeList.forEach((id) => {
    if (!(id in levels)) levels[id] = 0;
  });

  const levelCounts = {};
  const nodes = nodeList.map((id) => {
    const level = levels[id];
    const indexInLevel = levelCounts[level] || 0;
    levelCounts[level] = indexInLevel + 1;

    return {
      id,
      data: { label: fileLabel(id), fullPath: id },
      position: { x: level * 260, y: indexInLevel * 90 },
      style: {
        background: "#141414",
        color: "#fff",
        border: "1px solid #262626",
        borderRadius: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        padding: "8px 12px",
        width: 200,
      },
    };
  });

  const flowEdges = edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.from,
    target: e.to,
    style: { stroke: "#E8302A", strokeWidth: 1.5 },
    animated: false,
  }));

  return { nodes, edges: flowEdges };
};

// Builds a focused call-graph view for a single symbol: it, its callers, and its callees
export const buildTraceFlowGraph = (traceData) => {
  const { symbol, calledBy, calls, fullGraph } = traceData;

  const centerX = 300;
  const nodes = [
    {
      id: symbol,
      data: { label: symbol },
      position: { x: centerX, y: 200 },
      style: {
        background: "#E8302A",
        color: "#fff",
        border: "1px solid #E8302A",
        borderRadius: 0,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: "bold",
        padding: "10px 16px",
        width: 180,
      },
    },
    ...calledBy.map((name, i) => ({
      id: `caller-${name}`,
      data: { label: name },
      position: { x: 0, y: i * 90 },
      style: nodeStyleMuted(),
    })),
    ...calls.map((name, i) => ({
      id: `callee-${name}`,
      data: { label: name },
      position: { x: centerX + 300, y: i * 90 },
      style: nodeStyleMuted(),
    })),
  ];

  const edges = [
    ...calledBy.map((name, i) => ({
      id: `in-${i}`,
      source: `caller-${name}`,
      target: symbol,
      style: { stroke: "#F2A79D", strokeWidth: 2 },
      animated: true,
    })),
    ...calls.map((name, i) => ({
      id: `out-${i}`,
      source: symbol,
      target: `callee-${name}`,
      style: { stroke: "#E8302A", strokeWidth: 2 },
      animated: true,
    })),
  ];

  return { nodes, edges };
};

const nodeStyleMuted = () => ({
  background: "#141414",
  color: "#CFCFCF",
  border: "1px solid #262626",
  borderRadius: 0,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  padding: "8px 14px",
  width: 160,
});