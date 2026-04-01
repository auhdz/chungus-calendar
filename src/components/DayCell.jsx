import { useCallback, useMemo } from 'react';
import chungusImg from '../assets/Subject.png';
import './DayCell.css';

export default function DayCell({
  day,
  outside = false,
  placements = [],
  isSelected,
  currentUserId,
  calendarLocked = false,
  onSelect,
}) {
  const isDisabled = outside;
  const hasMyPlacement = useMemo(
    () => placements.some((p) => p.userId === currentUserId),
    [placements, currentUserId],
  );
  const showDeselectHint = Boolean(isSelected && hasMyPlacement && !calendarLocked);

  const handleClick = useCallback(() => {
    if (isDisabled || calendarLocked) return;
    onSelect?.(day);
  }, [isDisabled, calendarLocked, day, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (isDisabled || calendarLocked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(day);
    }
  }, [isDisabled, calendarLocked, day, onSelect]);

  if (outside) {
    return (
      <div className="day-cell day-cell--outside" aria-hidden>
        <span className="day-cell__number">{day}</span>
      </div>
    );
  }

  const titleHint = calendarLocked
    ? 'Enter your name above first'
    : showDeselectHint
      ? 'click to deselect'
      : undefined;

  return (
    <div
      role="button"
      tabIndex={calendarLocked ? -1 : 0}
      className={`day-cell ${isSelected ? 'day-cell--selected' : ''} ${calendarLocked ? 'day-cell--locked' : ''}`}
      data-day={day}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-disabled={calendarLocked}
      title={titleHint}
      aria-label={
        calendarLocked
          ? `April ${day}, 2026. Calendar locked until you enter your name.`
          : `April ${day}, 2026. ${placements.length} availability.${showDeselectHint ? ' click to deselect.' : ' Click to place or set times.'}`
      }
    >
      <span className="day-cell__number">{day}</span>
      {showDeselectHint && (
        <span className="day-cell__deselect-hint">click to deselect</span>
      )}
      <div className="day-cell__placements" aria-hidden>
        {placements.map((p, i) => {
          const offsets = [
            [50, 50], [65, 45], [35, 55], [55, 65], [40, 38], [70, 58],
          ];
          const [x, y] = offsets[i % offsets.length] || [50 + (i % 3) * 15, 50 + Math.floor(i / 3) * 12];
          const who = p.userName?.trim() || 'Unknown';
          const mine = p.userId === currentUserId;
          return (
            <span
              key={p.id}
              className={`day-cell__placement ${mine ? 'day-cell__placement--mine' : ''}`}
              style={{
                '--user-color': p.color,
                '--mask-url': `url(${chungusImg})`,
                left: `${x}%`,
                top: `${y}%`,
              }}
              aria-label={`Placed by ${who}`}
            >
              <img src={chungusImg} alt="" className="day-cell__chungus-img" draggable={false} />
              <span className="day-cell__placement-overlay" aria-hidden />
              <span className="day-cell__placement-tooltip">
                <span className="day-cell__tooltip-dot" style={{ background: p.color }} />
                {who}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
