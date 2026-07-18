import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Server component: markdown is parsed and sanitised on the server, the
// client receives plain HTML. Sanitisation stays on even though authors are
// committee members — trusted-author content is still untrusted input.
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose prose-emn mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
