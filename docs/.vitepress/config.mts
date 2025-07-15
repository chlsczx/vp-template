import { defineConfig } from "vitepress";
import { createSidebarConfig, getSidebar } from "./utils/docsUtils";
import { logAndRt } from "./utils/logUtils";

const defSb = [
  {
    text: "Examples",
    collapsed: true,
    items: [
      { text: "Markdown Examples", link: "/on/markdown-examples" },
      { text: "Runtime API Examples", link: "/on/api-examples" },
    ],
  },
  {
    text: "Examples",
    collapsed: true,
    items: [
      {
        text: "Markdown Examples",
        link: "/markdown-examples",
      },
      {
        text: "Runtime API Examples",
        link: "/api-examples",
      },
    ],
  },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vp-templates",
  description: "Show how to work with perfect vp config.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: logAndRt(await createSidebarConfig(["/", "/api", "/api-aaa"])),

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
