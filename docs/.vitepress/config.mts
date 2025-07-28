import { DefaultTheme, defineConfig, UserConfig } from "vitepress";
import { createSidebarConfig, toDocsAbsoultePath } from "./utils/docsUtils";
import { withMermaid } from "vitepress-plugin-mermaid";
import path from "path";
import { CHINESE_SEARCH_CONFIG, USE_MERMAID } from "./constant";
import { ljr } from "./utils/logUtils";
import { DocsConfig, DocsConfigValue, Enabled } from "./types";
import { statSync } from "fs";
import { bench } from "./utils/timeUtils";
import { docsConfig } from "../config";

const existDocDir = (
  relativePath: string,
  config: { acceptFile?: boolean }
): boolean => {
  const { acceptFile = false } = config;
  const fullPath = toDocsAbsoultePath(relativePath);
  try {
    if (statSync(fullPath).isFile()) {
      return acceptFile;
    }
  } catch (e) {
    return false;
  }
  return true;
};

const checkIfExistDocDir = (
  relativePath: string,
  config?: { acceptFile?: boolean }
): boolean => {
  const { acceptFile } = config ?? {
    acceptFile: false,
  };
  if (relativePath === "/") return true;
  relativePath = relativePath.replace(/^\//, "").replace(/\/$/, "");

  if (!existDocDir(relativePath, { acceptFile })) {
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

const getLink = (dcv: DocsConfigValue, isNav?: boolean): string => {
  const flags = {
    isNav: isNav ?? false,
  };
  if (typeof dcv === "string") return dcv;
  if (typeof dcv === "object") {
    if (Array.isArray(dcv)) {
      if (flags.isNav && dcv.length === 3 && dcv[2]) {
        return dcv[2];
      }
      return dcv[0];
    }
    return dcv.links;
  }
  throw new Error("never");
};

const isEnabled = (enabled: Enabled): boolean => {
  if (typeof enabled === "number") {
    return enabled === 1;
  }
  return enabled;
};

const isShown = (docsConfigValue: DocsConfigValue): boolean => {
  if (typeof docsConfigValue === "string") return false;
  if (typeof docsConfigValue === "object") {
    if (Array.isArray(docsConfigValue)) {
      return docsConfigValue[1] !== undefined &&
        typeof docsConfigValue[1] !== "string"
        ? isEnabled(docsConfigValue[1])
        : true;
    }
    return isEnabled(docsConfigValue.show);
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
    .map((k) => {
      checkIfExistDocDir(getLink(docsConfig[k], true), { acceptFile: true });
      return k;
    })
    .filter((k) => isShown(docsConfig[k]))
    .map((k) => constructNav(k, getLink(docsConfig[k], true)));
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
    rewrites(id) {
      return id.replace(/^(.*)\/_sp_intro\//, "$1/");
    },
  } satisfies UserConfig<DefaultTheme.Config>);
});
