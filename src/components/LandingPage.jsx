import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUserId } from '../lib/storage';
import { createGroup } from '../lib/firestore';
import './LandingPage.css';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      const userId = getStoredUserId();
      const groupId = await createGroup(trimmed, userId);
      const link = `${window.location.origin}/g/${groupId}`;
      setCreatedLink(link);
    } catch (err) {
      console.error('Failed to create group', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select the text */
    }
  };

  const handleGo = () => {
    if (!createdLink) return;
    const path = new URL(createdLink).pathname;
    navigate(path);
  };

  return (
    <div className="landing">
      <div className="landing__card">
        <div className="landing__awning">
          <span className="landing__awning-text">Chungus Meet</span>
        </div>

        <div className="landing__body">
          <h1 className="landing__title">Pick a Stupid Chungus Time</h1>
          <p className="landing__subtitle">
            Create a private group, share the link with your friends,
            and find the best time to meet.
          </p>

          {!createdLink ? (
            <div className="landing__form">
              <label className="landing__label" htmlFor="group-name">
                Group name
              </label>
              <input
                id="group-name"
                type="text"
                className="landing__input"
                placeholder="e.g. Friday Game Night"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <button
                type="button"
                className="landing__btn landing__btn--create"
                onClick={handleCreate}
                disabled={!name.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Chungus Meet'}
              </button>
            </div>
          ) : (
            <div className="landing__created">
              <p className="landing__created-label">Your group is ready! Share this link:</p>
              <div className="landing__link-row">
                <input
                  type="text"
                  className="landing__link-input"
                  value={createdLink}
                  readOnly
                  onClick={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="landing__btn landing__btn--copy"
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button
                type="button"
                className="landing__btn landing__btn--go"
                onClick={handleGo}
              >
                Go to your Chungus Meet →
              </button>
            </div>
          )}
        </div>

        <div className="landing__foliage" aria-hidden />
      </div>
    </div>
  );
}
