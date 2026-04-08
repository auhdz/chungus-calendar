import { TIME_BLOCKS_PST } from '../lib/timeBlocks';
import './Top3Sidebar.css';

function countPeopleOnDay(placements, date) {
  const ids = new Set();
  (placements || []).forEach((p) => {
    if (p.date === date && p.userId) ids.add(p.userId);
  });
  return ids.size;
}

function getCalendarMembers(placements) {
  const byUser = new Map();
  (placements || []).forEach((p) => {
    if (!p.userId) return;
    const name = (p.userName || '').trim();
    const prev = byUser.get(p.userId);
    if (!prev) {
      byUser.set(p.userId, { userId: p.userId, userName: name || 'Unknown' });
    } else if (name && prev.userName === 'Unknown') {
      prev.userName = name;
    }
  });
  return [...byUser.values()].sort((a, b) =>
    a.userName.localeCompare(b.userName, undefined, { sensitivity: 'base' }),
  );
}

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
      const peopleOnDay = countPeopleOnDay(placements, date);
      return {
        date,
        blockId,
        slotCount: count,
        peopleOnDay,
        label: blockLabel[blockId] || blockId,
      };
    })
    .sort((a, b) => b.slotCount - a.slotCount)
    .slice(0, limit);
}

export default function Top3Sidebar({ placements }) {
  const top = getTopDateTimes(placements || [], 3);
  const members = getCalendarMembers(placements || []);

  return (
    <aside className="top3-sidebar" aria-label="Top meet times and members">
      <div className="top3-sidebar__section">
        <div className="top3-sidebar__title">Top times</div>
        {top.length === 0 ? (
          <div className="top3-sidebar__empty">Add times to see top picks</div>
        ) : (
          <ul className="top3-sidebar__list">
            {top.map(({ date, blockId, slotCount, peopleOnDay, label }, i) => (
              <li
                key={`${date}-${blockId}-${i}`}
                className="top3-sidebar__item"
                aria-label={`April ${date}, ${label}. ${slotCount} at this time, ${peopleOnDay} placed on this day.`}
              >
                <div className="top3-sidebar__item-main">
                  <span className="top3-sidebar__text">
                    Apr {date} · {label}
                  </span>
                </div>
                <div className="top3-sidebar__meta">
                  <span>
                    {slotCount} {slotCount === 1 ? 'person' : 'people'} at this time
                  </span>
                  <span className="top3-sidebar__meta-sep" aria-hidden>
                    ·
                  </span>
                  <span>
                    {peopleOnDay} on this day
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="top3-sidebar__section top3-sidebar__section--members">
        <div className="top3-sidebar__title">Members</div>
        {members.length === 0 ? (
          <div className="top3-sidebar__empty">No one has placed yet</div>
        ) : (
          <ul className="top3-sidebar__members" aria-label="People who placed a chungus">
            {members.map(({ userId, userName }) => (
              <li key={userId} className="top3-sidebar__member">
                <span className="top3-sidebar__member-dot" aria-hidden />
                <span className="top3-sidebar__member-name">{userName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
