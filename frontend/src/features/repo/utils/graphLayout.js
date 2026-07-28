const fileLabel = (filePath) => filePath.split("/").pop();

export const buildFlowGraph = (edges) => {
  const nodeIds = new Set();
  edges.forEach((e) => {
    nodeIds.add(e.from);
    nodeIds.add(e.to);
  });

  const nodeList = Array.from(nodeIds);

  // simple layered layout: nodes with no incoming edges go on the left, others fan out right
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
    if (!(id in levels)) levels[id] = 0; // orphan/cyclic fallback
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