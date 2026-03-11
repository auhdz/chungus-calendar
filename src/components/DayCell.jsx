import { useCallback } from 'react';
import chungusImg from '../assets/Subject.png';
import { DRAG_TYPE } from './ChungusPool';
import './DayCell.css';

export default function DayCell({ day, placements = [], isSelected, onSelect, onDrop }) {
  const isEmpty = day === null;

  const handleClick = useCallback(() => {
    if (!isEmpty) onSelect?.(day);
  }, [isEmpty, day, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (isEmpty) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(day);
    }
  }, [isEmpty, day, onSelect]);

  const handleDragOver = useCallback((e) => {
    if (isEmpty) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('day-cell--drag-over');
  }, [isEmpty]);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('day-cell--drag-over');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.currentTarget.classList.remove('day-cell--drag-over');
    if (isEmpty) return;
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    onDrop?.(day);
  }, [isEmpty, day, onDrop]);

  if (isEmpty) {
    return <div className="day-cell day-cell--empty" aria-hidden />;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`day-cell ${isSelected ? 'day-cell--selected' : ''}`}
      data-day={day}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-pressed={isSelected}
      aria-label={`March ${day}, 2026. ${placements.length} availability. Drop a Chungus or click to set times.`}
    >
      <span className="day-cell__number">{day}</span>
      <div className="day-cell__placements" aria-hidden>
        {placements.map((p, i) => {
          const offsets = [
            [50, 50], [65, 45], [35, 55], [55, 65], [40, 38], [70, 58],
          ];
          const [x, y] = offsets[i % offsets.length] || [50 + (i % 3) * 15, 50 + Math.floor(i / 3) * 12];
          const who = p.userName?.trim() || 'Anonymous';
          return (
            <span
              key={p.id}
              className="day-cell__placement"
              style={{
                '--user-color': p.color,
                '--mask-url': `url(${chungusImg})`,
                left: `${x}%`,
                top: `${y}%`,
              }}
              title={who}
              aria-label={`Placed by ${who}`}
            >
              <img src={chungusImg} alt="" className="day-cell__chungus-img" draggable={false} />
              <span className="day-cell__placement-overlay" aria-hidden />
              <span className="day-cell__placement-tooltip">{who}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
