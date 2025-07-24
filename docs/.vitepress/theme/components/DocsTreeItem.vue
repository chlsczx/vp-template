<script setup lang="ts">
import { DefaultTheme } from "vitepress";
import { SidebarItem } from "../../types";
import { toSidebarItem } from "../../utils/docsUtils";

const { sidebarItem: item } = defineProps<{ sidebarItem: SidebarItem }>();
</script>

<template>
  <details>
    <summary>
      <details>
        <summary class="sub">
          <code>{{ item.priority }}</code
          >: {{ item.text }}
        </summary>
        <div style="margin-left: 1em">
          <p>
            Link:
            <a :href="item.link" target="_blank" rel="noopener noreferrer">
              {{ item.link }}
            </a>
          </p>
        </div>
      </details>
    </summary>
    <!-- 展示子项 -->
    <div v-if="item.items && item.items.length" style="margin-left: 1em">
      <ul>
        <li v-for="(child, index) in item.items">
          <DocsTreeItem :sidebar-item="toSidebarItem(child)" />
        </li>
      </ul>
    </div>
  </details>
</template>

<style scoped>
summary {
  display: inline;
  background-color: hsla(0, 0%, 83%, 0.75);
}
summary::before {
  content: ">";
}
details {
  display: inline;
}
</style>
