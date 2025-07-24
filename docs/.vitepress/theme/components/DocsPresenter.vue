<script setup lang="ts">
import { DefaultTheme } from "vitepress";
import { onMounted } from "vue";
import DocsTreeItem from "./DocsTreeItem.vue";
import { SORT_BASE } from "../../constant";
import { SidebarItem } from "../../types";
import { toSidebarItem } from "../../utils/docsUtils";

const { sidebar } = defineProps<{ sidebar: DefaultTheme.Sidebar }>();

const getPriority = (sidebarItem: DefaultTheme.SidebarItem): number => {
  if (SORT_BASE in sidebarItem) {
    return sidebarItem[SORT_BASE] as number;
  }
  return 999;
};

onMounted(() => {
  console.log("haha", sidebar);
});
</script>

<template>
  <ul v-if="!Array.isArray(sidebar)">
    <li v-for="key in Object.keys(sidebar)">
      {{ key }}
      <ul>
        <template v-if="Array.isArray(sidebar[key])">
          <li v-for="item in sidebar[key]">
            <DocsTreeItem v-bind:sidebar-item="toSidebarItem(item)" />
          </li>
        </template>
        <template v-if="!Array.isArray(sidebar[key])">
          <DocsTreeItem :sidebar-item="toSidebarItem(sidebar[key])" />
        </template>
      </ul>
      ---
    </li>
  </ul>
</template>

<style scoped></style>
