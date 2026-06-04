import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-foreground mt-5 mb-2 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground mt-4 mb-1.5">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-foreground/80 leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 mb-3">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 mb-3">{children}</ol>,
  li: ({ children }) => <li className="text-sm text-foreground/80 leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 text-muted-foreground italic my-2">
      {children}
    </blockquote>
  ),
};

const largeComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-foreground mt-8 mb-3 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base text-muted-foreground leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-5 space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-5 space-y-2 mb-4">{children}</ol>,
  li: ({ children }) => (
    <li className="text-base text-muted-foreground leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-4 text-muted-foreground italic my-3">
      {children}
    </blockquote>
  ),
};

interface Props {
  content: string;
  size?: 'sm' | 'lg';
}

export function MarkdownContent({ content, size = 'sm' }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={size === 'lg' ? largeComponents : components}
    >
      {content}
    </ReactMarkdown>
  );
}
