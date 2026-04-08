import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarCard from './CalendarCard';
import Top3Sidebar from './Top3Sidebar';
import { getStoredUserId, getUserColor } from '../lib/storage';
import { getNextChungusPlaceholder } from '../lib/chungusNames';
import { MAX_CHUNGUS_PER_USER } from '../lib/timeBlocks';
import {
  getGroup,
  addPlacement,
  updatePlacementTimeBlocks,
  updatePlacementUserName,
  deleteAllUserPlacements,
  deleteUserPlacementsOnDate,
  subscribeToPlacements,
} from '../lib/firestore';

function useDebouncedCallback(fn, delay) {
  const timer = useRef(null);
  const latest = useRef(fn);
  latest.current = fn;
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => latest.current(...args), delay);
  }, [delay]);
}

export default function CalendarPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [userId] = useState(() => getStoredUserId());
  const [userName, setUserName] = useState(() => localStorage.getItem('chungus-meet-username') || '');
  const [groupName, setGroupName] = useState('');
  const [copied, setCopied] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  /** Placements saved locally until Firestore snapshot includes them (fixes mobile lag before times work). */
  const [pendingPlacements, setPendingPlacements] = useState([]);

  const pendingNameRef = useRef(userName);
  const timePanelAnchorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getGroup(groupId).then((g) => {
      if (cancelled) return;
      if (!g) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setGroupName(g.name);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [groupId]);

  useEffect(() => {
    if (notFound) return;
    const unsub = subscribeToPlacements(groupId, (next) => {
      setPlacements(next);
    });
    return unsub;
  }, [groupId, notFound]);

  useEffect(() => {
    localStorage.setItem('chungus-meet-username', userName);
    pendingNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    setPendingPlacements((prev) =>
      prev.filter((p) => !placements.some((pl) => pl.id === p.id)),
    );
  }, [placements]);

  const displayPlacements = useMemo(() => {
    const ids = new Set(placements.map((p) => p.id));
    const extra = pendingPlacements.filter((p) => !ids.has(p.id));
    return [...placements, ...extra];
  }, [placements, pendingPlacements]);

  const myPlacements = displayPlacements.filter((p) => p.userId === userId);
  const remainingChungus = Math.max(0, MAX_CHUNGUS_PER_USER - myPlacements.length);
  const nameReady = userName.trim().length > 0;
  const namePlaceholder = getNextChungusPlaceholder(placements, userId);

  const handleDayClick = useCallback(
    async (day) => {
      if (day == null) return;
      const name = pendingNameRef.current?.trim();
      if (!name) return;

      const hasMine = myPlacements.some((p) => p.date === day);
      if (hasMine) {
        if (day === selectedDate) {
          await deleteUserPlacementsOnDate(groupId, userId, day);
          setPendingPlacements((prev) =>
            prev.filter((p) => !(p.userId === userId && p.date === day)),
          );
          setSelectedDate(null);
          setPanelMinimized(false);
          return;
        }
        setSelectedDate(day);
        setPanelMinimized(false);
        return;
      }
      if (remainingChungus <= 0) return;
      const color = getUserColor(userId);
      setSelectedDate(day);
      setPanelMinimized(false);
      try {
        const placementId = await addPlacement(groupId, {
          date: day,
          userId,
          userName: name,
          color,
          timeBlockIds: [],
        });
        setPendingPlacements((prev) => [
          ...prev,
          {
            id: placementId,
            date: day,
            userId,
            userName: name,
            color,
            timeBlockIds: [],
          },
        ]);
      } catch (err) {
        console.error('addPlacement failed', err);
        setSelectedDate((prev) => (prev === day ? null : prev));
      }
    },
    [myPlacements, selectedDate, remainingChungus, userId, groupId],
  );

  const myPlacementsOnSelectedDate = selectedDate
    ? myPlacements.filter((p) => p.date === selectedDate)
    : [];

  const checkedTimeBlocks = (() => {
    const out = {};
    if (selectedDate == null || myPlacementsOnSelectedDate.length === 0) return out;
    const first = myPlacementsOnSelectedDate[0];
    (first.timeBlockIds || []).forEach((id) => {
      out[`${selectedDate}-${id}`] = true;
    });
    return out;
  })();

  const handleToggleTimeBlock = useCallback(
    async (key) => {
      if (!pendingNameRef.current?.trim()) return;
      if (selectedDate == null || myPlacementsOnSelectedDate.length === 0) return;
      const first = myPlacementsOnSelectedDate[0];
      const blockId = key.replace(`${selectedDate}-`, '');
      const current = (first.timeBlockIds || []).includes(blockId);
      const next = current
        ? (first.timeBlockIds || []).filter((id) => id !== blockId)
        : [...(first.timeBlockIds || []), blockId].filter((v, i, a) => a.indexOf(v) === i);
      await updatePlacementTimeBlocks(groupId, first.id, next);
      setPendingPlacements((prev) =>
        prev.map((p) => (p.id === first.id ? { ...p, timeBlockIds: next } : p)),
      );
    },
    [selectedDate, myPlacementsOnSelectedDate, groupId],
  );

  const handleNavigateDay = useCallback((delta) => {
    setSelectedDate((d) => {
      if (d == null) return delta > 0 ? 1 : 30;
      const next = d + delta;
      if (next < 1) return 1;
      if (next > 30) return 30;
      return next;
    });
  }, []);

  const handleResetTimes = useCallback(async () => {
    if (selectedDate == null) return;
    await deleteUserPlacementsOnDate(groupId, userId, selectedDate);
    setPendingPlacements((prev) =>
      prev.filter((p) => !(p.userId === userId && p.date === selectedDate)),
    );
  }, [selectedDate, userId, groupId]);

  const handleResetAll = useCallback(async () => {
    await deleteAllUserPlacements(groupId, userId);
    setPendingPlacements([]);
  }, [userId, groupId]);

  const syncNameToFirestore = useDebouncedCallback(
    async (trimmed, ids) => {
      await Promise.all(ids.map((id) => updatePlacementUserName(groupId, id, trimmed)));
    },
    500,
  );

  const handleNameChange = useCallback(
    (newName) => {
      setUserName(newName);
      const trimmed = newName.trim();
      if (trimmed) {
        syncNameToFirestore(trimmed, myPlacements.map((p) => p.id));
      }
    },
    [myPlacements, groupId, syncNameToFirestore],
  );

  useEffect(() => {
    if (selectedDate == null || panelMinimized) return;
    const narrow = window.matchMedia('(max-width: 640px)');
    if (!narrow.matches) return;
    const el = timePanelAnchorRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedDate, panelMinimized]);

  if (loading) {
    return (
      <div className="app">
        <main className="app__main">
          <p style={{ color: '#b8c8a0', marginTop: 80 }}>Loading group...</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="app">
        <main className="app__main">
          <p style={{ color: '#b8c8a0', marginTop: 80 }}>Group not found. Check your link.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app__main">
        <div className="app__content-row">
          <aside className="app__sidebar">
            <Top3Sidebar placements={placements} />
          </aside>
          <div className="app__center-column">
            <div className={`app__name-row${nameReady ? '' : ' app__name-row--attention'}`}>
              <div className="app__name-top">
                <span className="app__group-name">{groupName}</span>
                <div className="app__name-actions">
                  <button
                    type="button"
                    className="app__action-btn"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {}
                    }}
                    aria-label="Share group link"
                  >
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                  <button
                    type="button"
                    className="app__action-btn"
                    onClick={() => navigate('/')}
                    aria-label="Create a new group"
                  >
                    + New Group
                  </button>
                </div>
              </div>
              <label className="app__name-label">
                Your name <span className="app__name-hint">(required)</span>
              </label>
              {!nameReady && (
                <p className="app__name-callout" role="status">
                  Enter your name here first — then you can use the calendar below.
                </p>
              )}
              <div className="app__name-field">
                <input
                  type="text"
                  className="app__name-input"
                  placeholder={namePlaceholder}
                  value={userName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={40}
                  aria-label="Your name, required to use the calendar"
                  autoComplete="nickname"
                />
                {userName.trim().length > 0 && (
                  <span className="app__name-check" aria-label="Name set">✓</span>
                )}
              </div>
            </div>
            <div className="app__card-wrap">
              <CalendarCard
                placements={displayPlacements}
                selectedDate={selectedDate}
                panelMinimized={panelMinimized}
                timePanelAnchorRef={timePanelAnchorRef}
                currentUserId={userId}
                calendarLocked={!nameReady}
                onDayClick={handleDayClick}
                onTogglePanelMinimized={() => setPanelMinimized((m) => !m)}
                onNavigateDay={handleNavigateDay}
                remainingChungus={remainingChungus}
                checkedTimeBlocks={checkedTimeBlocks}
                onToggleTimeBlock={handleToggleTimeBlock}
                onConfirmTimes={() => {
                  setPanelMinimized(true);
                  const allHaveTimes = myPlacements.every(
                    (p) => p.timeBlockIds && p.timeBlockIds.length > 0,
                  );
                  if (myPlacements.length >= MAX_CHUNGUS_PER_USER && allHaveTimes) {
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
