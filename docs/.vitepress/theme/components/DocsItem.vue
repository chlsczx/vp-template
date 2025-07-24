<script setup lang="ts">

const { priority, text, frontmatter } = defineProps<{ priority: number, text: string, frontmatter: object }>()

</script>

<template>
  <details>
    <summary>
      <span><code>{{ priority }}</code></span>: <span>{{ text }}</span>
    </summary>
    <pre>{{ frontmatter }}</pre>
  </details>
</template>

<style scoped></style>