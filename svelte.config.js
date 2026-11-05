import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook: runbook } }),
  ],
  kit: {
    adapter: adapter({ fallback: undefined }),
    inlineStyleThreshold: 100000,
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb', '/kb/triage/dedupe', '/kb/decisions/0001-dedupe-by-subject', '/kb/incidents/4471', '/kb/incidents/4471-three-problems'], handleHttpError: 'warn' },
  },
};
