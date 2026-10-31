import { useEffect, useRef, useState } from 'react';
import useStore from '../../store/useStore.js';
import { SECRET_ANSWER } from '../../config/secretIsland.js';
import Confetti from './Confetti.jsx';

// HTML chrome for the secret Plastic Beach island: a way back to the islands
// (shown from the moment the egg starts, so a visitor can bail mid-flight), and
// once the mist has parted, the "name the album" quiz. A right answer fires
// confetti in from every edge.

const normalise = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export default function SecretOverlay() {
  const phase = useStore((s) => s.secretPhase);
  const track = useStore((s) => s.secretTrack);
  const exitSecret = useStore((s) => s.exitSecret);
  const solveSecret = useStore((s) => s.solveSecret);

  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState(false);
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const inputRef = useRef();

  const active = phase !== 'off';
  const quizUp = phase === 'revealed' || phase === 'solved';

  // a fresh visit starts with a blank quiz
  useEffect(() => {
    if (phase === 'flying') {
      setGuess('');
      setWrong(false);
    }
  }, [phase]);

  // focus the answer box once the card has faded in (it waits for the mist)
  useEffect(() => {
    if (phase !== 'revealed') return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 1300);
    return () => clearTimeout(t);
  }, [phase]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!guess.trim()) return;
    if (normalise(guess) === SECRET_ANSWER) {
      solveSecret();
      setConfetti((k) => k + 1);
      inputRef.current?.blur();
    } else {
      setWrong(true);
      // restart the shake even if the last one is still playing
      setShake(false);
      requestAnimationFrame(() => setShake(true));
    }
  };

  return (
    <>
      {active && (
        <button type='button' className='secret-back' onClick={exitSecret}>
          <span aria-hidden='true'>←</span> Back to the islands
        </button>
      )}

      <div
        className={`secret-card${quizUp ? ' is-visible' : ''}${shake ? ' is-shaking' : ''}`}
        onAnimationEnd={(e) => e.animationName === 'secret-shake' && setShake(false)}
        aria-hidden={!quizUp}
      >
        {track && (
          <div className='secret-now-playing'>
            <span className='secret-eq' aria-hidden='true'>
              <i />
              <i />
              <i />
            </span>
            {/* the title track shares the album's name, so naming the song
                before the quiz is solved would give the answer away */}
            {phase === 'solved' ? `Now playing — ${track}` : 'Now playing'}
          </div>
        )}

        {phase === 'solved' ? (
          <div className='secret-solved' role='status'>
            <h3>Plastic Beach.</h3>
            <p>You got it. Welcome to the end of the world — mind the plastic.</p>
          </div>
        ) : (
          <form className='secret-form' onSubmit={onSubmit}>
            <label htmlFor='secret-guess'>Which album is this island from?</label>
            <div className='secret-row'>
              <input
                id='secret-guess'
                ref={inputRef}
                type='text'
                autoComplete='off'
                spellCheck={false}
                placeholder='Name the album'
                value={guess}
                tabIndex={quizUp ? 0 : -1}
                onChange={(e) => {
                  setGuess(e.target.value);
                  setWrong(false);
                }}
              />
              <button type='submit' tabIndex={quizUp ? 0 : -1}>
                Guess
              </button>
            </div>
            <p className={`secret-hint${wrong ? ' is-wrong' : ''}`} role='status'>
              {wrong ? 'Not quite — listen closer.' : 'Hint: you can hear it.'}
            </p>
          </form>
        )}
      </div>

      {confetti > 0 && <Confetti key={confetti} onDone={() => setConfetti(0)} />}
    </>
  );
}
