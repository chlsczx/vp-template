<script setup lang="ts">
import { useData, useRoute, useRouter } from "vitepress";
import { computed, onMounted, watchEffect } from "vue";
import DefaultTheme from "vitepress/theme";
import { normalizePath } from "../utils/stringUtils";

declare const __DOCS_ABS_PATH__: string;

const { Layout } = DefaultTheme;
const DOCS_ABS_PATH = __DOCS_ABS_PATH__;
const { page } = useData();

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
