import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
        h1: ({ children }) => (
          <h1 className="font-display text-lg uppercase mt-4 mb-2 text-accentSoft">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-display text-base uppercase mt-4 mb-2 text-accentSoft">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-mono text-sm font-bold mt-3 mb-1.5 text-white">{children}</h3>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 ml-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => <strong className="text-accentSoft font-bold">{children}</strong>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-border px-1.5 py-0.5 text-xs font-mono text-accentSoft rounded-sm">
              {children}
            </code>
          ) : (
            <code className="block bg-black border border-border p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 border border-border">
            <table className="w-full text-xs font-mono border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-panel border-b border-border">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border last:border-b-0">{children}</tr>,
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-accentSoft uppercase tracking-wide">{children}</th>
        ),
        td: ({ children }) => <td className="px-3 py-2 text-textMuted">{children}</td>,
        hr: () => <hr className="border-border my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;