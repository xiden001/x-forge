export interface HeadingSection {
  title: string;
  content: string;
}

export const markdownToPlainText = (input: string): string => {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const splitMarkdownByHeading = (input: string): HeadingSection[] => {
  const lines = input.replace(/\r/g, "").split("\n");
  const sections: HeadingSection[] = [];
  let currentTitle = "Overview";
  let buffer: string[] = [];

  const flush = () => {
    const content = markdownToPlainText(buffer.join("\n")).trim();
    if (content) {
      sections.push({ title: currentTitle, content });
    }
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      currentTitle = heading[2].trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections.length ? sections : [{ title: "Overview", content: markdownToPlainText(input) }];
};
