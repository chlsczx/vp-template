import { DefaultTheme, defineConfig, UserConfig } from "vitepress";
import { createSidebarConfig, toDocsAbsoultePath } from "./utils/docsUtils";
import { withMermaid } from "vitepress-plugin-mermaid";
import path from "path";
import { CHINESE_SEARCH_CONFIG, USE_MERMAID } from "./constant";
import { ljr } from "./utils/logUtils";
import { DocsConfig, DocsConfigValue } from "./types";
import { statSync } from "fs";
import { bench } from "./utils/timeUtils";

const docsConfig: DocsConfig = {
  all: "/",
  example: ["/vp-example/"],
};

const existDocDir = (relativePath: string): boolean => {
  const fullPath = toDocsAbsoultePath(relativePath);
  try {
    if (statSync(fullPath).isFile()) return false;
  } catch (e) {
    return false;
  }
  return true;
};

const checkIfExistDocDir = (relativePath: string): boolean => {
  if (relativePath === "/") return true;
  relativePath = relativePath.replace(/^\//, "").replace(/\/$/, "");

  if (!existDocDir(relativePath)) {
    console.error(
      `Link "${relativePath}" doesn't exist, ignored, please fix the config.`
    );
    return false;
  }
  return true;
};

const constructNav = (text: string, link: string) => ({
  text,
  link,
});

const getLink = (dcv: DocsConfigValue): string => {
  if (typeof dcv === "string") return dcv;
  if (typeof dcv === "object") {
    if (Array.isArray(dcv)) return dcv[0];
    return dcv.links;
  }
  throw new Error("never");
};

const isShown = (docsConfigValue: DocsConfigValue): boolean => {
  if (typeof docsConfigValue === "string") return false;
  if (typeof docsConfigValue === "object") {
    if (Array.isArray(docsConfigValue)) {
      return docsConfigValue[1] ?? true;
    }
    return docsConfigValue.show;
  }
  throw new Error("never");
};

const createSidebarFromDocsConfig = (docsConfig: DocsConfig) => {
  return createSidebarConfig(
    Object.keys(docsConfig)
      .map((k) => docsConfig[k])
      .map((v) => getLink(v))
      .filter((l) => checkIfExistDocDir(l))
  );
};

const createNavFromDocsConfig = (docsConfig: DocsConfig) => {
  return Object.keys(docsConfig)
    .filter((k) => checkIfExistDocDir(getLink(docsConfig[k])))
    .filter((k) => isShown(docsConfig[k]))
    .map((k) => constructNav(k, getLink(docsConfig[k])));
};

const customConfig: (
  config: UserConfig<DefaultTheme.Config>
) => UserConfig<DefaultTheme.Config> = USE_MERMAID ? withMermaid : defineConfig;

// https://vitepress.dev/reference/site-config
export default await bench("config", async () => {
  return customConfig({
    title: "vp-templates",
    description: "Show how to work with perfect vp config.",
    vite: {
      define: {
        __DOCS_ABS_PATH__: JSON.stringify(
          path.resolve(__dirname, "../../docs")
        ),
      },
    },
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: createNavFromDocsConfig(docsConfig),
      sidebar: await createSidebarFromDocsConfig(docsConfig),
      socialLinks: [{ icon: "github", link: "" }],
      outline: {
        level: [2, 4],
      },
      search: CHINESE_SEARCH_CONFIG,
    },
  } satisfies UserConfig<DefaultTheme.Config>);
});
