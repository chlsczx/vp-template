// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import MyLayout from "./MyLayout.vue";
import DocsPresenter from "./components/DocsPresenter.vue";

export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app, router, siteData }) {
    app.component("DocsPresenter", DocsPresenter);
    // ...
    router.onAfterRouteChange = (to) => {
      console.log("导航到:", to);
    };
  },
} satisfies Theme;
