<script setup lang="ts">
import { useData, useRoute, useRouter } from "vitepress";
import { computed, onMounted, watchEffect } from "vue";
import DefaultTheme from "vitepress/theme";
import { normalizePath } from "../utils/stringUtils";

declare const __DOCS_ABS_PATH__: string;

const { Layout } = DefaultTheme;
const DOCS_ABS_PATH = __DOCS_ABS_PATH__;
const { page } = useData();
const router = useRouter();
const route = useRoute();

/**
 * 如果没有 redirect，记录自己的 path
 * 如果有 redirect，看下 prev 和要去的是不是一样，一样的话返回，不一样的话 go
 */
watchEffect(() => {
  const currentPath = normalizePath(router.route.path);

  console.log(history.length);
  if (!page.value.frontmatter.redirect) {
    sessionStorage.setItem("prevPath", currentPath);
    return;
  }

  const prev = sessionStorage.getItem("prevPath");
  const target = normalizePath(page.value.frontmatter.redirect);
  if (target && currentPath !== target) {
    const where = new URL(target, `http://example.com${currentPath}/`).pathname;
    console.log(target, currentPath, prev, where);
    if (prev === where) window.history.back();
    else {
      history.replaceState({}, "", where);
      router.go(where);
    }
  }
});

watchEffect(() => {});

const editLink = computed(() => {
  if (!page.value.filePath) return null;

  const absPath = `${DOCS_ABS_PATH}/${page.value.filePath}`.replace(/\\/g, "/");
  const lastUrl = `vscode://file/${absPath}`;
  return () => {
    window.open(lastUrl);
  };
});
</script>

<template>
  <Layout>
    <template #aside-top>
      <button v-if="editLink" href="#" @click="editLink" class="editButton">
        编辑此页
      </button>
    </template>
  </Layout>
</template>
<style lang="css" scoped>
.editButton {
  color: var(--vp-c-text-2);
  padding-left: 16px;
  text-align: left;
  border-left: 1px solid var(--vp-c-divider);
  width: 8em;
  margin-bottom: 2em;
  margin-left: 1px;
}

.editButton:hover {
  color: var(--vp-c-text-1);
}

/* .editButton::before {
  content: "✏️";
} */

@media (prefers-color-scheme: dark) {
  .editButton {
  }
}
</style>
