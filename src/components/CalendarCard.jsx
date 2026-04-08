import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import DayCell from './DayCell';
import TimeBlockPanel from './TimeBlockPanel';
import ChungusPool from './ChungusPool';
import chungusSticker from '../assets/chungus-sticker.png';
import './CalendarCard.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const APRIL_2026 = new Date(2026, 3, 1);

function buildAprilGrid() {
  const start = startOfMonth(APRIL_2026);
  const end = endOfMonth(APRIL_2026);
  const weekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.map((d) => ({
    day: d.getDate(),
    outside: d.getMonth() !== 3,
  }));
}

const APRIL_GRID = buildAprilGrid();

const STICKER_DECORATIONS = [
  { side: 'left', top: '14%', rotate: -11, scale: 1 },
  { side: 'right', top: '38%', rotate: 15, scale: 0.95 },
  { side: 'left', top: '58%', rotate: 7, scale: 1.05 },
  { side: 'right', top: '72%', rotate: -9, scale: 0.92 },
  { side: 'left', top: '82%', rotate: -14, scale: 0.88 },
  { side: 'right', top: '12%', rotate: 10, scale: 1 },
];

export default function CalendarCard({
  placements,
  selectedDate,
  panelMinimized,
  timePanelAnchorRef,
  currentUserId,
  calendarLocked,
  onDayClick,
  onTogglePanelMinimized,
  onNavigateDay,
  remainingChungus,
  checkedTimeBlocks,
  onToggleTimeBlock,
  onConfirmTimes,
  onResetTimes,
  onResetAll,
}) {
  const getPlacementsForDay = (day, outside) => (!outside && day != null ? (placements || []).filter((p) => p.date === day) : []);

  return (
    <article className="calendar-card" aria-label="Pick a Stupid Chungus Time — April 2026">
      <div className="calendar-card__awning">
        <span className="calendar-card__awning-text">April 2026</span>
      </div>

      <div className="calendar-card__panel">
        {/*
          Deck = header + pool + grid only. Side stickers use % vertical position inside
          this box so they do not jump when TimeBlockPanel mounts (first date pick).
        */}
        <div className="calendar-card__deck">
          <div className="calendar-card__stickers" aria-hidden>
            {STICKER_DECORATIONS.map((s, i) => (
              <img
                key={i}
                src={chungusSticker}
                alt=""
                className={`calendar-card__sticker calendar-card__sticker--${s.side}`}
                style={{
                  top: s.top,
                  transform: `translateX(${s.side === 'left' ? '-50%' : '50%'}) rotate(${s.rotate}deg) scale(${s.scale})`,
                }}
                draggable={false}
              />
            ))}
          </div>
          <div className="calendar-card__accent calendar-card__accent--left" aria-hidden />
          <div className="calendar-card__accent calendar-card__accent--right" aria-hidden />

          <div className="calendar-card__sakura-row" aria-hidden>
            <span className="calendar-card__sakura">🌸</span>
            <span className="calendar-card__sakura">✿</span>
            <span className="calendar-card__sakura">🌸</span>
            <span className="calendar-card__sakura">❀</span>
            <span className="calendar-card__sakura">🌸</span>
            <span className="calendar-card__sakura">✿</span>
            <span className="calendar-card__sakura">🌸</span>
          </div>

          <span className="calendar-card__flower calendar-card__flower--1" aria-hidden>❀</span>
          <span className="calendar-card__flower calendar-card__flower--2" aria-hidden>✿</span>

          <div className="calendar-card__content">
            <header className="calendar-card__header">
              <h1 className="calendar-card__title">Pick a Stupid Chungus Time</h1>
              <p className="calendar-card__subtitle">
                Place your chungus by clicking on the date you are free then select a time (5 total).
              </p>
            </header>

            <ChungusPool remaining={remainingChungus} onResetAll={onResetAll} />

            <div className={`calendar-card__grid-wrap${calendarLocked ? ' calendar-card__grid-wrap--locked' : ''}`}>
              {calendarLocked && (
                <p className="calendar-card__lock-notice calendar-card__lock-notice--animate" role="status">
                  Enter your name above to pick dates.
                </p>
              )}
              <div className="calendar-card__weekdays" role="presentation">
                {WEEKDAYS.map((label) => (
                  <span key={label} className="calendar-card__weekday">
                    {label}
                  </span>
                ))}
              </div>
              <div className="calendar-card__grid-outer">
                <div className="calendar-card__grid" role="grid" aria-label="April 2026">
                  {APRIL_GRID.map(({ day, outside }, i) => (
                    <DayCell
                      key={i}
                      day={day}
                      outside={outside}
                      placements={getPlacementsForDay(day, outside)}
                      isSelected={!outside && selectedDate === day}
                      currentUserId={currentUserId}
                      calendarLocked={calendarLocked}
                      onSelect={outside ? undefined : onDayClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <TimeBlockPanel
          anchorRef={timePanelAnchorRef}
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

      <div className="calendar-card__bottom-strip" aria-hidden />
    </article>
  );
}
