import { remark } from "remark";
import html from "remark-html";
import gridTables from "remark-grid-tables";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(gridTables)
    .use(html)
    .process(markdown);
  return result.toString();
}