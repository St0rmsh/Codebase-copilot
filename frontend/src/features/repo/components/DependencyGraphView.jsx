import { useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { useRepoGraph } from "../hooks/useRepoGraph";
import { buildFlowGraph } from "../utils/graphLayout";
import Button from "../../../components/Button";

const DependencyGraphView = ({ repoId, onNodeClick }) => {
  const { graph, loading, error, loadGraph, generateGraph } = useRepoGraph(repoId);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const { nodes, edges } = useMemo(() => buildFlowGraph(graph), [graph]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase animate-pulse">
          Mapping dependencies...
        </p>
      </div>
    );
  }

  if (graph.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          No dependency graph generated yet
        </p>
        {error && <p className="font-mono text-xs text-accent">{error}</p>}
        <Button variant="primary" onClick={generateGraph}>
          Generate Graph
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center px-6 py-3 border-b border-border">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          {nodes.length} modules · {edges.length} dependencies
        </p>
        <Button variant="outline" className="py-1.5 px-3 text-xs" onClick={generateGraph}>
          Regenerate
        </Button>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, node) => onNodeClick?.(node.data.fullPath)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#262626" gap={20} />
          <Controls className="!bg-panel !border !border-border" />
          <MiniMap
            className="!bg-panel !border !border-border"
            nodeColor="#E8302A"
            maskColor="rgba(10,10,10,0.8)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DependencyGraphView;