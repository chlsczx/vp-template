import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import yaml from "js-yaml";
import { getNested } from "./stringUtils";

export async function decideTitleInContent(
  filePath: string
): Promise<string | undefined> {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let inFrontMatter = false;
  let frontMatterLines: string[] = [];

  let i = 0;
  let frontMatterData;
  let str: string;
  for await (const line of rl) {
    i++;
    const trimmed = line.trim();

    // frontmatter
    if (trimmed === "---") {
      if (!inFrontMatter && i === 1) {
        inFrontMatter = true;
        continue;
      } else if (inFrontMatter) {
        try {
          const data = yaml.load(frontMatterLines.join("\n"));
          if (typeof data === "object" && data && "title" in data) {
            rl.close();
            return (data as any).title;
          }
          frontMatterData = data;
        } catch (e) {}
        inFrontMatter = false;
        continue;
      }
    }

    if (inFrontMatter) {
      frontMatterLines.push(line);
      continue;
    }

    // 非 Front Matter 部分，找第一个 # 开头的标题（但忽略 ## 或更多级标题）
    if (trimmed.startsWith("# ") && !inFrontMatter) {
      rl.close();
      str = trimmed.replace(/^#\s+/, "").trim();
      // 解析多个 {{ $frontmatter.xxx }}
      const matches = str.match(/\{\{\s*\$frontmatter\.([^\}\s]+)\s*\}\}/g);
      if (matches && frontMatterData) {
        for (const match of matches) {
          const key = match.match(
            /^\{\{\s*\$frontmatter\.([^\}\s]+)\s*\}\}$/
          )?.[1];
          if (!key) {
            continue;
          }
          str = str.replace(match, getNested(frontMatterData, key));
        }
      }

      return str;
    }
    // 如果碰到 ## 或更小的标题（不再尝试读取）
    if (trimmed.startsWith("##")) {
      rl.close();
      return undefined;
    }

    // Check for <h1>{{ $frontmatter.xxx }}</h1>
    const match = trimmed.match(/^<h1>\s*(.*)\s*<\/h1>$/);
    if (match) {
      rl.close();
      str = match[1].trim();
      const matches = str.match(/\{\{\s*\$frontmatter\.([^\}\s]+)\s*\}\}/g);
      if (matches && frontMatterData) {
        for (const match of matches) {
          const key = match.match(
            /^\{\{\s*\$frontmatter\.([^\}\s]+)\s*\}\}$/
          )?.[1];
          if (!key) {
            continue;
          }
          str = str.replace(match, getNested(frontMatterData, key));
        }
      }
      return str;
    }
  }

  rl.close();
  return undefined;
}
