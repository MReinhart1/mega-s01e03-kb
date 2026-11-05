<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  // The desk's cause table has two causes. The reports it footnotes as a one-day move are a third
  // problem: a month swap never moves a date by one day.
  type Problem = 'parser' | 'hint' | 'one-day shift';
  const ORDER: Problem[] = ['parser', 'hint', 'one-day shift'];

  const rows = reports as Report[];
  const merged = $derived(uniqueById(rows).filter((r) => r.mergedInto === ticket));
  const copies = $derived(rows.length - uniqueById(rows).length);

  const problemOf = (r: Report): Problem | null => {
    if (notes.oneDayMove.includes(r.id)) return 'one-day shift';
    return causeOf(r, tenantOf(r));
  };

  const groups = $derived(
    ORDER.map((problem) => {
      const rs = merged.filter((r) => problemOf(r) === problem);
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      const tags: Record<string, number> = {};
      for (const r of rs) tags[r.meta.intakeTag] = (tags[r.meta.intakeTag] ?? 0) + 1;
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: [...new Set(rs.map((r) => r.channel))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        tags: Object.entries(tags).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ×${n}`).join(' · '),
      };
    }),
  );
  const unplaced = $derived(merged.filter((r) => problemOf(r) === null).length);
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.filter((g) => g.reports.length).length}</strong> problems ·
  {copies} exact copies in the export, counted once{unplaced ? ` · ${unplaced} not placed` : ''}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th><th>intake tagged them</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants.length}</td>
        <td>{g.channels.join(', ')}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td class="tags">{g.tags}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
