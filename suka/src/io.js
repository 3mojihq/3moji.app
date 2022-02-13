import jdown from "jdown";
import { getHighlighter } from "shiki";

// https://marked.js.org/using_advanced
const markdownOptionsFactory = (highlighter) => ({
  highlight: (code, lang) => highlighter.codeToHtml(code, lang),
});

const getContent = async (contentDir) => {
  const highlighter = await getHighlighter({ theme: "monokai" });
  const content = await jdown(contentDir, {
    markdown: markdownOptionsFactory(highlighter),
  });

  return content;
};

export { getContent };
