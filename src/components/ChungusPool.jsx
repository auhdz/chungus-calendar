import { useRef, useCallback } from 'react';
import chungusImg from '../assets/Subject.png';
import './ChungusPool.css';

const DRAG_TYPE = 'application/x-chungus-meet';

function preventScroll(e) {
  e.preventDefault();
}

export default function ChungusPool({ remaining, onDragStart, onResetAll, onDropChungus }) {
  const total = 5;
  const used = total - remaining;
  const ghostRef = useRef(null);
  const hoveredCellRef = useRef(null);

  const handleDragStart = (e) => {
    if (remaining <= 0) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_TYPE, '1');
    e.dataTransfer.effectAllowed = 'copy';
    try {
      e.dataTransfer.setDragImage(e.currentTarget.querySelector('.chungus-pool__img-wrap'), 0, 0);
    } catch (_) {}
    onDragStart?.(e);
  };

  const getDayCellAt = useCallback((x, y) => {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) {
      const cell = el.closest('[data-day]');
      if (cell) return cell;
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (remaining <= 0) return;
    e.preventDefault();

    const touch = e.touches[0];
    const ghost = document.createElement('img');
    ghost.src = chungusImg;
    ghost.className = 'chungus-pool__ghost';
    ghost.style.cssText = `
      position: fixed;
      width: 48px;
      height: 48px;
      object-fit: contain;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.85;
      filter: drop-shadow(0 0 6px rgba(90, 156, 188, 0.6));
      left: ${touch.clientX - 24}px;
      top: ${touch.clientY - 24}px;
    `;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    hoveredCellRef.current = null;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventScroll, { passive: false });
  }, [remaining]);

  const handleTouchMove = useCallback((e) => {
    if (!ghostRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    ghostRef.current.style.left = `${touch.clientX - 24}px`;
    ghostRef.current.style.top = `${touch.clientY - 24}px`;

    const cell = getDayCellAt(touch.clientX, touch.clientY);
    if (hoveredCellRef.current && hoveredCellRef.current !== cell) {
      hoveredCellRef.current.classList.remove('day-cell--drag-over');
    }
    if (cell) {
      cell.classList.add('day-cell--drag-over');
    }
    hoveredCellRef.current = cell;
  }, [getDayCellAt]);

  const handleTouchEnd = useCallback(() => {
    document.removeEventListener('touchmove', preventScroll);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    const cell = hoveredCellRef.current;
    if (cell) {
      cell.classList.remove('day-cell--drag-over');
      const day = parseInt(cell.dataset.day, 10);
      if (!isNaN(day)) {
        onDropChungus?.(day);
      }
    }
    hoveredCellRef.current = null;
  }, [onDropChungus]);

  return (
    <div className="chungus-pool" aria-label={`${remaining} of ${total} Chungus left to place`}>
      <div className="chungus-pool__header">
        <span className="chungus-pool__label">Drag to a date ({remaining} left)</span>
        <button
          type="button"
          className="chungus-pool__reset"
          onClick={onResetAll}
          aria-label="Reset all your Chungus back to default"
        >
          Reset
        </button>
      </div>
      <div className="chungus-pool__slots">
        {Array.from({ length: total }, (_, i) => {
          const available = i < remaining;
          return (
            <div
              key={i}
              className={`chungus-pool__slot ${available ? 'chungus-pool__slot--available' : 'chungus-pool__slot--used'}`}
              draggable={available}
              onDragStart={handleDragStart}
              onTouchStart={available ? handleTouchStart : undefined}
              onTouchMove={available ? handleTouchMove : undefined}
              onTouchEnd={available ? handleTouchEnd : undefined}
              role={available ? 'button' : undefined}
              aria-label={available ? `Drag Chungus ${i + 1} to a date` : 'Placed'}
            >
              <span className="chungus-pool__img-wrap">
                {available && (
                  <img src={chungusImg} alt="" className="chungus-pool__img" draggable={false} />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { DRAG_TYPE };
