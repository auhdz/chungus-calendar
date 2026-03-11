import chungusImg from '../assets/Subject.png';
import './ChungusPool.css';

const DRAG_TYPE = 'application/x-chungus-meet';

export default function ChungusPool({ remaining, onDragStart, onResetAll }) {
  const total = 5;
  const used = total - remaining;

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
