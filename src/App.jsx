import { useState, useCallback, useEffect } from 'react';
import CalendarCard from './components/CalendarCard';
import Top3Sidebar from './components/Top3Sidebar';
import { loadState, saveState, getStoredUserId, getUserColor } from './lib/storage';
import { MAX_CHUNGUS_PER_USER } from './lib/timeBlocks';
import './App.css';

function generateId() {
  return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function App() {
  const [userId] = useState(() => getStoredUserId());
  const [userName, setUserName] = useState('');
  const [placements, setPlacements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const stored = loadState();
    if (stored?.placements) setPlacements(stored.placements);
    if (stored?.userName != null) setUserName(stored.userName || '');
  }, []);

  useEffect(() => {
    saveState({ placements, userName: userName || null });
  }, [placements, userName]);

  const myPlacements = placements.filter((p) => p.userId === userId);
  const remainingChungus = Math.max(0, MAX_CHUNGUS_PER_USER - myPlacements.length);

  const handleDropChungus = useCallback(
    (day) => {
      if (remainingChungus <= 0 || day == null) return;
      const color = getUserColor(userId);
      setPlacements((prev) => [
        ...prev,
        {
          id: generateId(),
          date: day,
          userId,
          userName: userName.trim() || null,
          color,
          timeBlockIds: [],
        },
      ]);
      setSelectedDate(day);
      setPanelMinimized(false);
    },
    [remainingChungus, userId, userName]
  );

  const myPlacementsOnSelectedDate = selectedDate
    ? myPlacements.filter((p) => p.date === selectedDate)
    : [];

  const checkedTimeBlocks = (() => {
    const out = {};
    if (selectedDate == null || myPlacementsOnSelectedDate.length === 0) return out;
    const first = myPlacementsOnSelectedDate[0];
    first.timeBlockIds.forEach((id) => {
      out[`${selectedDate}-${id}`] = true;
    });
    return out;
  })();

  const setTimeBlocksForSelectedDate = useCallback(
    (blockKey, checked) => {
      if (selectedDate == null) return;
      const blockId = blockKey.replace(`${selectedDate}-`, '');
      setPlacements((prev) =>
        prev.map((p) => {
          if (p.userId !== userId || p.date !== selectedDate) return p;
          const next = checked
            ? [...(p.timeBlockIds || []), blockId].filter((v, i, a) => a.indexOf(v) === i)
            : (p.timeBlockIds || []).filter((id) => id !== blockId);
          return { ...p, timeBlockIds: next };
        })
      );
    },
    [selectedDate, userId]
  );

  const handleToggleTimeBlock = useCallback(
    (key) => {
      const current = checkedTimeBlocks[key];
      setTimeBlocksForSelectedDate(key, !current);
    },
    [checkedTimeBlocks, setTimeBlocksForSelectedDate]
  );

  const handleNavigateDay = useCallback((delta) => {
    setSelectedDate((d) => {
      if (d == null) return delta > 0 ? 1 : 31;
      const next = d + delta;
      if (next < 1) return 1;
      if (next > 31) return 31;
      return next;
    });
  }, []);

  const handleResetTimes = useCallback(() => {
    if (selectedDate == null) return;
    setPlacements((prev) =>
      prev.filter((p) => !(p.userId === userId && p.date === selectedDate))
    );
  }, [selectedDate, userId]);

  const handleResetAll = useCallback(() => {
    setPlacements((prev) => prev.filter((p) => p.userId !== userId));
  }, [userId]);

  return (
    <div className="app">
      <main className="app__main">
        <div className="app__content-row">
          <aside className="app__sidebar">
            <Top3Sidebar placements={placements} />
          </aside>
          <div className="app__center-column">
            <div className="app__name-row">
              <label className="app__name-label">
                Your name <span className="app__name-optional">(optional)</span>
              </label>
              <div className="app__name-field">
                <input
                  type="text"
                  className="app__name-input"
                  placeholder="Anonymous"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={40}
                  aria-label="Your name optional"
                />
                {userName.trim().length > 0 && (
                  <span className="app__name-check" aria-label="Name set">✓</span>
                )}
              </div>
            </div>
            <div className="app__card-wrap">
        <CalendarCard
          placements={placements}
          selectedDate={selectedDate}
          panelMinimized={panelMinimized}
          onSelectDate={(day) => {
            if (day === selectedDate) {
              setPanelMinimized(false);
            } else {
              setSelectedDate(day);
              setPanelMinimized(false);
            }
          }}
          onTogglePanelMinimized={() => setPanelMinimized((m) => !m)}
          onNavigateDay={handleNavigateDay}
          onDropChungus={handleDropChungus}
          remainingChungus={remainingChungus}
          checkedTimeBlocks={checkedTimeBlocks}
          onToggleTimeBlock={handleToggleTimeBlock}
          onConfirmTimes={() => {
            setPanelMinimized(true);
            const myCount = placements.filter((p) => p.userId === userId).length;
            const allHaveTimes = placements
              .filter((p) => p.userId === userId)
              .every((p) => p.timeBlockIds && p.timeBlockIds.length > 0);
            if (myCount >= MAX_CHUNGUS_PER_USER && allHaveTimes) {
              setShowCongrats(true);
            }
          }}
          onResetTimes={handleResetTimes}
          onResetAll={handleResetAll}
        />
            </div>
          </div>
        </div>
      </main>

      {showCongrats && (
        <div className="app__congrats-overlay" onClick={() => setShowCongrats(false)}>
          <div className="app__congrats-card" onClick={(e) => e.stopPropagation()}>
            <p className="app__congrats-text">
              congrats, now check the top times for your chungus meeting
            </p>
            <button
              type="button"
              className="app__congrats-btn"
              onClick={() => setShowCongrats(false)}
            >
              okay chungus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
