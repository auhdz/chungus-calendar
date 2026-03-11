import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import DayCell from './DayCell';
import TimeBlockPanel from './TimeBlockPanel';
import ChungusPool from './ChungusPool';
import './CalendarCard.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MARCH_2026 = new Date(2026, 2, 1);

function buildMarchGrid() {
  const start = startOfMonth(MARCH_2026);
  const end = endOfMonth(MARCH_2026);
  const weekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.map((d) => (d.getMonth() === 2 ? d.getDate() : null));
}

const MARCH_GRID = buildMarchGrid();

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
    <article className="calendar-card" aria-label="Pick a Stupid Chungus Time — March 2026">
      <div className="calendar-card__awning">
        <span className="calendar-card__awning-text">March 2026</span>
        <span className="calendar-card__chain calendar-card__chain--left" aria-hidden />
        <span className="calendar-card__chain calendar-card__chain--right" aria-hidden />
      </div>

      <div className="calendar-card__panel">
        <div className="calendar-card__vine calendar-card__vine--left" aria-hidden>
          <span className="calendar-card__leaf calendar-card__leaf--1" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--2" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--3" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--4" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--5" aria-hidden />
        </div>
        <div className="calendar-card__vine calendar-card__vine--right" aria-hidden>
          <span className="calendar-card__leaf calendar-card__leaf--6" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--7" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--8" aria-hidden />
          <span className="calendar-card__leaf calendar-card__leaf--9" aria-hidden />
        </div>

        {/* Hanging lantern string */}
        <div className="calendar-card__lantern-string" aria-hidden>
          <span className="calendar-card__lantern-rope" />
          <span className="calendar-card__lantern calendar-card__lantern--1">
            <span className="calendar-card__lantern-chain" />
            <span className="calendar-card__lantern-body">
              <span className="calendar-card__lantern-cap" />
              <span className="calendar-card__lantern-glass" />
              <span className="calendar-card__lantern-base" />
            </span>
          </span>
          <span className="calendar-card__lantern calendar-card__lantern--2">
            <span className="calendar-card__lantern-chain" />
            <span className="calendar-card__lantern-body">
              <span className="calendar-card__lantern-cap" />
              <span className="calendar-card__lantern-glass" />
              <span className="calendar-card__lantern-base" />
            </span>
          </span>
          <span className="calendar-card__lantern calendar-card__lantern--3">
            <span className="calendar-card__lantern-chain" />
            <span className="calendar-card__lantern-body">
              <span className="calendar-card__lantern-cap" />
              <span className="calendar-card__lantern-glass" />
              <span className="calendar-card__lantern-base" />
            </span>
          </span>
          <span className="calendar-card__lantern calendar-card__lantern--4">
            <span className="calendar-card__lantern-chain" />
            <span className="calendar-card__lantern-body">
              <span className="calendar-card__lantern-cap" />
              <span className="calendar-card__lantern-glass" />
              <span className="calendar-card__lantern-base" />
            </span>
          </span>
        </div>

        {/* Small butterfly decoration */}
        <span className="calendar-card__butterfly" aria-hidden>🦋</span>

        {/* Small flower decorations */}
        <span className="calendar-card__flower calendar-card__flower--1" aria-hidden>✿</span>
        <span className="calendar-card__flower calendar-card__flower--2" aria-hidden>❀</span>
        <span className="calendar-card__flower calendar-card__flower--3" aria-hidden>✿</span>

        <div className="calendar-card__content">
          <header className="calendar-card__header">
            <h1 className="calendar-card__title">Pick a Stupid Chungus Time</h1>
            <p className="calendar-card__subtitle">drag and drop a Chungus to a date then pick time</p>
          </header>

          <ChungusPool remaining={remainingChungus} onDragStart={() => {}} onResetAll={onResetAll} />

          <div className="calendar-card__grid-wrap">
            <div className="calendar-card__weekdays" role="presentation">
              {WEEKDAYS.map((label) => (
                <span key={label} className="calendar-card__weekday">
                  {label}
                </span>
              ))}
            </div>
            <div className="calendar-card__grid-outer">
            <div className="calendar-card__grid" role="grid" aria-label="March 2026">
              {MARCH_GRID.map((day, i) => (
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

      <div className="calendar-card__bottom-foliage" aria-hidden />
    </article>
  );
}
