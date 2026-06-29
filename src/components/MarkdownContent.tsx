import { Fragment } from 'react';

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
};

const MarkdownContent = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let codeLines: string[] = [];
  let inCode = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={`code-${index}`} className="overflow-x-auto border border-border bg-background p-4 text-sm text-foreground">
            <code>{codeLines.join('\n')}</code>
          </pre>,
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) return;

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
          {renderInline(line.replace('## ', ''))}
        </h2>,
      );
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-3xl font-bold text-foreground mt-8 mb-4">
          {renderInline(line.replace('# ', ''))}
        </h1>,
      );
      return;
    }

    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={index} className="ml-6 list-decimal text-foreground/80 leading-relaxed">
          {renderInline(line.replace(/^\d+\.\s*/, ''))}
        </li>,
      );
      return;
    }

    if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-6 list-disc text-foreground/80 leading-relaxed">
          {renderInline(line.replace(/^[-]\s*/, ''))}
        </li>,
      );
      return;
    }

    elements.push(
      <p key={index} className="leading-relaxed text-foreground/90">
        {renderInline(line)}
      </p>,
    );
  });

  if (codeLines.length > 0) {
    elements.push(
      <pre key="code-open" className="overflow-x-auto border border-border bg-background p-4 text-sm text-foreground">
        <code>{codeLines.join('\n')}</code>
      </pre>,
    );
  }

  return <div className="space-y-4">{elements}</div>;
};

export default MarkdownContent;