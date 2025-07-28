import type { DefaultTheme } from "vitepress";
import { decideConfigInMdContent } from "./fileUtils";
import * as fs from "fs";
import * as path from "path";
import { BASE_ROOT, NO_INDEX_DIR_MARK, SORT_BASE } from "../constant";
import { MdConfig, SidebarItem } from "../types";
import { ljr } from "./logUtils";

const getPriority = (sidebarItem: DefaultTheme.SidebarItem): number => {
  if (SORT_BASE in sidebarItem) {
    return sidebarItem[SORT_BASE] as number;
  }
  return 999;
};

export const toSidebarItem = (
  sidebarItem: DefaultTheme.SidebarItem
): SidebarItem => {
  const a = {
    ...sidebarItem,
    priority: getPriority(sidebarItem),
  };

  return a as SidebarItem;
};

export function removeExtensionSuffix(filepath: string): string {
  const ext = path.extname(filepath);
  return filepath.replace(ext, "");
}

export function toDocsAbsoultePath(relative: string, baseLang?: string) {
  let dirname = __dirname;
  if (!dirname.includes(".vitepress"))
    throw new Error("Script must be under .vitepress");
  while (!dirname.endsWith("\\.vitepress")) {
    dirname = path.resolve(
      dirname,
      ".." // to docs
    );

    if (dirname.endsWith(":\\")) {
      throw new Error("No .vitepress found!");
    }
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

  const fullPath = toDocsAbsoultePath(root, baseLang);

  if (!fs.statSync(fullPath).isDirectory()) {
    throw new Error("root not dir");
  }
}

function padNumber(numStr: string, length: number) {
  return numStr.padStart(length, "0");
}

const sortItem = (a: string | number, b: string | number) => {
  let strA = "" + a;
  let strB = "" + b;
  if (typeof a === "number" && typeof b === "number")
    if (strA.length !== strB.length) {
      if (strA.length > strB.length) strB = strB.padStart(strA.length, "0");
      else strA = strA.padStart(strB.length, "0");
    }
  return strA > strB ? 1 : -1;
};

async function getSidebarItemsTree(
  relativeDirPath: string,
  config?: {
    releaseSp?: boolean;
  }
): Promise<(DefaultTheme.SidebarItem & { [SORT_BASE]: number }) | undefined> {
  config = {
    ...config,
    releaseSp: config?.releaseSp ?? true,
  };
  const fullPath = toDocsAbsoultePath(relativeDirPath);
  const fileState = fs.statSync(fullPath);
  const rootName: string = relativeDirPath
    .split("/")
    .pop()
    ?.replace(".md", "") as string;

  /**
   * Handle file
   */
  if (fileState.isFile()) {
    if (path.extname(fullPath) !== ".md") {
      return undefined;
    }
    const mdConfig = await decideConfigInMdContent(fullPath);

    const title = mdConfig.title ?? rootName;

    return {
      text: title,
      link: removeExtensionSuffix(
        `${BASE_ROOT ? `/${BASE_ROOT}` : ``}/${relativeDirPath}`
      ),
      [SORT_BASE]: mdConfig.priority,
    };
  }

  if (fileState.isDirectory()) {
    const subFiles = fs.readdirSync(fullPath);

    const hasIndex: boolean = !subFiles.every((file) => file !== "index.md");
    const clickable = hasIndex;
    let mdConfig: MdConfig = {
      priority: 999,
    };
    if (hasIndex) {
      mdConfig = await decideConfigInMdContent(fullPath + "/index.md");
    }
    const title: string = hasIndex ? mdConfig.title ?? rootName : rootName;

    return {
      text: (clickable ? "" : `${NO_INDEX_DIR_MARK} `) + title,
      link: clickable
        ? removeExtensionSuffix(
            `${BASE_ROOT ? `/${BASE_ROOT}` : ``}/${relativeDirPath}`
          )
        : undefined,
      [SORT_BASE]: mdConfig.priority,
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
              const result = await getSidebarItemsTree(rp);
              return result;
            })
        )
      )
        .filter((i) => i !== undefined)
        // .flatMap((i) => {
        //   if (!i.link) return i;
        //   if (config.releaseSp && i.link.endsWith("/_sp_intro") && i.items) {
        //     const items = i.items;
        //     return [i, ...i.items] as Array<
        //       DefaultTheme.SidebarItem & {
        //         ".sort_base": number;
        //       }
        //     >;
        //   }
        //   return i;
        // })
        .sort((a, b) => {
          if (a.link?.endsWith("/_sp_intro")) {
            a.collapsed = false;
            return -1;
          }
          if (b.link?.endsWith("/_sp_intro")) {
            b.collapsed = false;
            return 1;
          }
          // 文件排前面
          if (!!a.items !== !!b.items) return a.items ? 1 : -1;
          // 根据 SORT_BASE
          return sortItem(a[SORT_BASE], b[SORT_BASE]);
        })
        .map((i) => {
          if (i.link?.endsWith("/_sp_intro"))
            i.link = i.link?.replace("/_sp_intro", "/");
          else i.link = i.link?.replace("/_sp_intro", "");
          return i;
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

  const rootSidebar = await getSidebarItemsTree(root, { releaseSp: false });
  const sidebarItems = rootSidebar?.items;
  if (!sidebarItems) {
    throw new Error("Unexpected fault, check root!");
  }

  return sidebarItems;
}

export async function createSidebarConfig(
  rootArr: string[]
): Promise<DefaultTheme.Sidebar> {
  const config = {};
  await Promise.all(
    rootArr.map(async (r) => {
      Object.defineProperty(config, r, {
        value: await getSidebar(r.replace(/^\//, "").replace(/\/$/, "")),
        enumerable: true,
        configurable: true,
      });
    })
  );
  return config;
}
