import { useState } from 'react';
import { TIME_BLOCKS_PST } from '../lib/timeBlocks';
import './TimeBlockPanel.css';

export default function TimeBlockPanel({
  selectedDate,
  minimized,
  onMinimize,
  onPrevDay,
  onNextDay,
  checkedBlocks,
  onToggleBlock,
  onConfirmTimes,
  onResetTimes,
}) {
  const [savedFlash, setSavedFlash] = useState(false);
  if (selectedDate === null) return null;

  const handleConfirm = () => {
    onConfirmTimes?.();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const canGoPrev = selectedDate > 1;
  const canGoNext = selectedDate < 30;

  return (
    <div className={`time-block-panel ${minimized ? 'time-block-panel--minimized' : ''}`}>
      <div className="time-block-panel__header">
        <button
          type="button"
          className="time-block-panel__nav time-block-panel__nav--prev"
          onClick={onPrevDay}
          disabled={!canGoPrev}
          aria-label="Previous day"
        >
          ←
        </button>
        <span className="time-block-panel__date">
          April {selectedDate}, 2026
        </span>
        <button
          type="button"
          className="time-block-panel__nav time-block-panel__nav--next"
          onClick={onNextDay}
          disabled={!canGoNext}
          aria-label="Next day"
        >
          →
        </button>
        <button
          type="button"
          className="time-block-panel__minimize"
          onClick={onMinimize}
          aria-label={minimized ? 'Expand time options' : 'Minimize'}
          aria-expanded={!minimized}
        >
          {minimized ? '▲' : '−'}
        </button>
      </div>

      {!minimized && (
        <>
          <p className="time-block-panel__title">When can you meet? (PST)</p>
          <ul className="time-block-panel__list" role="list">
            {TIME_BLOCKS_PST.map((block) => {
              const key = `${selectedDate}-${block.id}`;
              const checked = checkedBlocks?.[key] ?? false;
              return (
                <li key={key} className="time-block-panel__item">
                  <label className="time-block-slot">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleBlock?.(key)}
                      className="time-block-slot__input"
                      aria-label={`${block.labelPST} — ${checked ? 'selected' : 'not selected'}`}
                    />
                    <span className="time-block-slot__box" aria-hidden />
                    <span className="time-block-slot__labels">
                      <span className="time-block-slot__label time-block-slot__label--pst">{block.labelPST}</span>
                      <span className="time-block-slot__label time-block-slot__label--et">{block.labelET}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="time-block-panel__actions">
            <button
              type="button"
              className="time-block-panel__btn time-block-panel__btn--confirm"
              onClick={handleConfirm}
              aria-label="Confirm times"
            >
              {savedFlash ? 'Saved!' : 'Confirm times'}
            </button>
            <button
              type="button"
              className="time-block-panel__btn time-block-panel__btn--reset"
              onClick={onResetTimes}
              aria-label="Reset times for this day"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}
