import { useState, useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { useSymbolTrace } from "../hooks/useSymbolTrace";
import { buildTraceFlowGraph } from "../utils/graphLayout";

const TraceSymbolPanel = ({ repoId }) => {
  const [input, setInput] = useState("");
  const { trace, loading, error, runTrace, clearTrace } = useSymbolTrace(repoId);

  const { nodes, edges } = useMemo(() => (trace ? buildTraceFlowGraph(trace) : { nodes: [], edges: [] }), [trace]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) runTrace(input.trim());
  };

  return (
    <div className="flex-1 flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 px-6 py-3 border-b border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a component/function name (e.g. Navbar)"
          className="flex-1 bg-transparent border border-border px-3 py-2 font-mono text-xs placeholder:text-textMuted focus:border-accent outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase px-4"
        >
          {loading ? "Tracing..." : "Trace"}
        </button>
        {trace && (
          <button
            type="button"
            onClick={clearTrace}
            className="border border-border text-textMuted hover:text-white font-mono text-xs px-3"
          >
            ✕
          </button>
        )}
      </form>

      {error && <p className="font-mono text-xs text-accent px-6 py-3">{error}</p>}

      {!trace && !loading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase text-center px-6">
            Enter a symbol name to trace its callers and callees
          </p>
        </div>
      )}

      {trace && (
        <>
          <div className="px-6 py-2 font-mono text-xs text-textMuted border-b border-border">
            {trace.calledBy.length} caller{trace.calledBy.length !== 1 ? "s" : ""} ·{" "}
            {trace.calls.length} call{trace.calls.length !== 1 ? "s" : ""}
          </div>
          <div className="flex-1">
            <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
              <Background color="#262626" gap={20} />
              <Controls className="!bg-panel !border !border-border" />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
};

export default TraceSymbolPanel;