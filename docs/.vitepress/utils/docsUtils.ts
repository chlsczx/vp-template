import type { DefaultTheme } from "vitepress";
import { decideTitleInContent } from "./fileUtils";
import * as fs from "fs";
import * as path from "path";
import { title } from "process";
import { BASE_ROOT, NO_INDEX_DIR_MARK, SORT_BASE } from "../constant";
import { logAndRt } from "./logUtils";

function toAbsoultePath(relative: string, baseLang?: string) {
  let dirname = __dirname;
  if (!dirname.includes(".vitepress"))
    throw new Error("Script must be under .vitepress");
  while (!dirname.endsWith("\\.vitepress")) {
    dirname = path.resolve(
      dirname,
      ".." // to docs
    );
  }
  return path.resolve(
    dirname,
    "..",
    BASE_ROOT,
    baseLang ?? "", // if need
    relative
  );
}

/**
 * 本函数用来确保属性名所对应的相对路径存在
 * @param root
 * @param baseLang
 */
function check(root: string, baseLang?: string) {
  baseLang = baseLang ?? "";
  if (path.isAbsolute(baseLang) || path.isAbsolute(root))
    throw new Error("only accept relative path");

  const fullPath = toAbsoultePath(root, baseLang);

  if (!fs.statSync(fullPath).isDirectory()) {
    throw new Error("root not dir");
  }
}

const sortName = (a: string, b: string) => {
  return a > b ? 1 : -1;
};

async function getSidebarItemsTree(
  relativeDirPath: string
): Promise<DefaultTheme.SidebarItem | undefined> {
  const fullPath = toAbsoultePath(relativeDirPath);
  console.log(relativeDirPath, fullPath);
  const fileState = fs.statSync(fullPath);
  const rootName: string = relativeDirPath
    .split("/")
    .pop()
    ?.replace(".md", "") as string;

  if (fileState.isFile()) {
    if (path.extname(fullPath) !== ".md") {
      return undefined;
    }

    const title = (await decideTitleInContent(fullPath)) ?? rootName;

    return {
      text: title,
      link: `${BASE_ROOT ? `/${BASE_ROOT}` : ``}/${relativeDirPath}`,
    };
  }

  if (fileState.isDirectory()) {
    const subFiles = fs.readdirSync(fullPath);

    const hasIndex: boolean = !subFiles.every((file) => file !== "index.md");
    const clickable = hasIndex;
    const title: string = hasIndex
      ? (await decideTitleInContent(fullPath + "/index.md")) ?? rootName
      : rootName;

    return {
      text: (clickable ? "" : `${NO_INDEX_DIR_MARK} `) + title,
      link: clickable
        ? `${BASE_ROOT ? `/${BASE_ROOT}` : ``}/${relativeDirPath}`
        : undefined,
      collapsed: true,
      items: (
        await Promise.all(
          subFiles
            .filter((f) => {
              return (
                (f.endsWith(".md") && f !== "index.md") ||
                (fs.statSync(fullPath + "\\" + f).isDirectory() &&
                  !f.startsWith("."))
              );
            })
            .map(async (f) => {
              const rp = `${relativeDirPath ? `${relativeDirPath}/` : ""}` + f;
              return {
                ...(await getSidebarItemsTree(rp)),
                [SORT_BASE]: f,
              };
            })
        )
      ).sort((a, b) => {
        if (!!a.items !== !!b.items) return a.items ? 1 : -1;
        return sortName(a[SORT_BASE], b[SORT_BASE]);
      }),
    };
  }
  return undefined;
}

export async function getSidebar(
  root: string,
  baseLang?: string
): Promise<DefaultTheme.SidebarItem[]> {
  baseLang = baseLang ?? "";

  check(root, baseLang);

  const sidebarItems = (await getSidebarItemsTree(root))?.items;
  if (!sidebarItems) {
    throw new Error("Unexpected fault, check root!");
  }

  return logAndRt(sidebarItems);
}

export async function createSidebarConfig(
  rootArr: string[]
): Promise<DefaultTheme.Sidebar> {
  const config = {};
  await Promise.all(
    rootArr.map(async (r) => {
      Object.defineProperty(config, r, {
        value: await getSidebar(r.replace(/^\//, "")),
        enumerable: true,
        configurable: true,
      });
    })
  );
  return config;
}
