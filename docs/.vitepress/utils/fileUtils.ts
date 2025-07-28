import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import yaml from "js-yaml";
import { getNested } from "./stringUtils";
import { MdConfig } from "../types";

/**
 * 获取 优先级、标题
 */
export async function decideConfigInMdContent(
  filePath: string
): Promise<MdConfig> {
  const mdConfig: MdConfig = {
    priority: 999,
  };
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let inFrontMatter = false;
  let frontMatterLines: string[] = [];

  let i = 0;
  let frontMatterData:
    | {
        priority?: undefined | number;
        redirect?: string | undefined;
        title?: string | undefined;
      }
    | undefined;
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

          frontMatterData = data as object;

          if (typeof data === "object" && data && "title" in data) {
            mdConfig.title = data.title as string;
            break;
          }
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

      mdConfig.title = str;

      break;
    }
    // 如果碰到 ## 或更小的标题（不再尝试读取）此时 priority 和 title 必定已经读取完毕
    if (trimmed.startsWith("##")) {
      rl.close();
      break;
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
      mdConfig.title = str;
      break;
    }
  }

  rl.close();

  mdConfig.priority = (frontMatterData?.priority as number | undefined) ?? 999;

  return mdConfig;
}
