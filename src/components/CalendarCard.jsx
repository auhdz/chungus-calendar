import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import DayCell from './DayCell';
import TimeBlockPanel from './TimeBlockPanel';
import ChungusPool from './ChungusPool';
import './CalendarCard.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const APRIL_2026 = new Date(2026, 3, 1);

function buildAprilGrid() {
  const start = startOfMonth(APRIL_2026);
  const end = endOfMonth(APRIL_2026);
  const weekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.map((d) => (d.getMonth() === 3 ? d.getDate() : null));
}

const APRIL_GRID = buildAprilGrid();

export default function CalendarCard({
  placements,
  selectedDate,
  panelMinimized,
  onSelectDate,
  onTogglePanelMinimized,
  onNavigateDay,
  onDropChungus,
  remainingChungus,
  checkedTimeBlocks,
  onToggleTimeBlock,
  onConfirmTimes,
  onResetTimes,
  onResetAll,
}) {
  const getPlacementsForDay = (day) => (day != null ? (placements || []).filter((p) => p.date === day) : []);

  return (
    <article className="calendar-card" aria-label="Pick a Stupid Chungus Time — April 2026">
      <div className="calendar-card__awning">
        <span className="calendar-card__awning-text">April 2026</span>
      </div>

      <div className="calendar-card__panel">
        <div className="calendar-card__accent calendar-card__accent--left" aria-hidden />
        <div className="calendar-card__accent calendar-card__accent--right" aria-hidden />

        <span className="calendar-card__flower calendar-card__flower--1" aria-hidden>✿</span>
        <span className="calendar-card__flower calendar-card__flower--2" aria-hidden>❀</span>
        <span className="calendar-card__flower calendar-card__flower--3" aria-hidden>✿</span>

        <div className="calendar-card__content">
          <header className="calendar-card__header">
            <h1 className="calendar-card__title">Pick a Stupid Chungus Time</h1>
            <p className="calendar-card__subtitle">drag and drop a Chungus to a date then pick time</p>
          </header>

          <ChungusPool remaining={remainingChungus} onDragStart={() => {}} onResetAll={onResetAll} onDropChungus={onDropChungus} />

          <div className="calendar-card__grid-wrap">
            <div className="calendar-card__weekdays" role="presentation">
              {WEEKDAYS.map((label) => (
                <span key={label} className="calendar-card__weekday">
                  {label}
                </span>
              ))}
            </div>
            <div className="calendar-card__grid-outer">
            <div className="calendar-card__grid" role="grid" aria-label="April 2026">
              {APRIL_GRID.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  placements={getPlacementsForDay(day)}
                  isSelected={selectedDate === day}
                  onSelect={onSelectDate}
                  onDrop={onDropChungus}
                />
              ))}
            </div>
            </div>
          </div>

          <TimeBlockPanel
            selectedDate={selectedDate}
            minimized={panelMinimized}
            onMinimize={onTogglePanelMinimized}
            onPrevDay={() => onNavigateDay?.(-1)}
            onNextDay={() => onNavigateDay?.(1)}
            checkedBlocks={checkedTimeBlocks}
            onToggleBlock={onToggleTimeBlock}
            onConfirmTimes={onConfirmTimes}
            onResetTimes={onResetTimes}
          />
        </div>
      </div>

      <div className="calendar-card__bottom-strip" aria-hidden />
    </article>
  );
}
