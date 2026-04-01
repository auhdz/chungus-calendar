import chungusImg from '../assets/Subject.png';
import './ChungusPool.css';

const TOTAL = 5;

export default function ChungusPool({ remaining, onResetAll }) {
  const used = TOTAL - remaining;

  return (
    <div
      className="chungus-pool"
      aria-label={`${remaining} of ${TOTAL} day slots left to place`}
    >
      <div className="chungus-pool__header">
        <span className="chungus-pool__label">
          Up to {TOTAL} days — {remaining} left
        </span>
        <button
          type="button"
          className="chungus-pool__reset"
          onClick={onResetAll}
          aria-label="Reset all your Chungus back to default"
        >
          Reset
        </button>
      </div>
      <div className="chungus-pool__slots" aria-hidden>
        {Array.from({ length: TOTAL }, (_, i) => {
          const showChungus = i >= used;
          return (
            <div
              key={i}
              className={`chungus-pool__slot ${showChungus ? 'chungus-pool__slot--available' : 'chungus-pool__slot--used'}`}
            >
              <span className="chungus-pool__img-wrap">
                {showChungus && (
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
