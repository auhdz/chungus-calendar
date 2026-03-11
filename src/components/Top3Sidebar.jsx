import { TIME_BLOCKS_PST } from '../lib/timeBlocks';
import './Top3Sidebar.css';

function getTopDateTimes(placements, limit = 3) {
  const keyCount = {};
  placements.forEach((p) => {
    (p.timeBlockIds || []).forEach((blockId) => {
      const key = `${p.date}-${blockId}`;
      keyCount[key] = (keyCount[key] || 0) + 1;
    });
  });
  const blockLabel = Object.fromEntries(TIME_BLOCKS_PST.map((b) => [b.id, b.labelPST]));
  return Object.entries(keyCount)
    .map(([key, count]) => {
      const m = key.match(/^(\d+)-(.+)$/);
      const date = m ? parseInt(m[1], 10) : 0;
      const blockId = m ? m[2] : '';
      return { date, blockId, count, label: blockLabel[blockId] || blockId };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function Top3Sidebar({ placements }) {
  const top = getTopDateTimes(placements || [], 3);
  if (top.length === 0) {
    return (
      <aside className="top3-sidebar" aria-label="Top meet times">
        <div className="top3-sidebar__title">Top times</div>
        <div className="top3-sidebar__empty">Add times to see top picks</div>
      </aside>
    );
  }
  return (
    <aside className="top3-sidebar" aria-label="Top meet times">
      <div className="top3-sidebar__title">Top times</div>
      <ul className="top3-sidebar__list">
        {top.map(({ date, blockId, count, label }, i) => (
          <li key={`${date}-${blockId}-${i}`} className="top3-sidebar__item">
            <span className="top3-sidebar__text">Mar {date} · {label}</span>
            <span className="top3-sidebar__tally">{count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
