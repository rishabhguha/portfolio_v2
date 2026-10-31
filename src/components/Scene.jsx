import { useEffect, useCallback } from 'react';
import Sky from './Sky.jsx';
import Sea from './Sea.jsx';
import Islands from './Islands.jsx';
import Clouds from './Clouds.jsx';
import IslandGlow from './IslandGlow.jsx';
import CameraController from './CameraController.jsx';
import SecretIsland from './SecretIsland.jsx';
import useStore from '../store/useStore.js';
import { LAST_ISLAND } from '../config/islands.js';
import { SETTLE_MS } from '../config/timings.js';

export default function Scene() {
  const isOverview = useStore((s) => s.isOverview);
  const currentIsland = useStore((s) => s.currentIsland);
  const targetIsland = useStore((s) => s.targetIsland);
  const scrollEnabled = useStore((s) => s.scrollEnabled);
  const cardOpen = useStore((s) => s.cardOpen);
  const isAnimating = useStore((s) => s.isAnimating);
  const secretPhase = useStore((s) => s.secretPhase);
  const secretActive = secretPhase !== 'off';

  const enterExploreMode = useStore((s) => s.enterExploreMode);
  const navigateToIsland = useStore((s) => s.navigateToIsland);
  const openCard = useStore((s) => s.openCard);
  const closeCard = useStore((s) => s.closeCard);
  const exitSecret = useStore((s) => s.exitSecret);

  // shared gate for every navigation input
  const canNavigate =
    scrollEnabled && !isAnimating && !cardOpen && !isOverview && !secretActive;

  // returns true only if the step lands on a real island — a no-op at the
  // boundary reports false so callers don't consume the input (see wheel cooldown)
  const step = useCallback(
    (delta) => {
      const next = currentIsland + delta;
      if (next < 0 || next > LAST_ISLAND) return false;
      navigateToIsland(next);
      return true;
    },
    [currentIsland, navigateToIsland],
  );

  const handleLabelClick = useCallback(() => {
    if (!cardOpen) openCard();
  }, [cardOpen, openCard]);

  // keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (cardOpen && e.key === 'Escape') {
        closeCard();
        return;
      }
      if (secretActive && e.key === 'Escape') {
        exitSecret();
        return;
      }
      if (!canNavigate) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canNavigate, cardOpen, closeCard, secretActive, exitSecret, step]);

  // scroll / wheel navigation
  useEffect(() => {
    let cooldown = false;
    const onWheel = (e) => {
      if (!canNavigate || cooldown || e.deltaY === 0) return;
      // only arm the cooldown if the scroll actually moved us; a scroll past the
      // last island must not lock out the immediate scroll back
      if (!step(e.deltaY > 0 ? 1 : -1)) return;
      cooldown = true;
      setTimeout(() => (cooldown = false), SETTLE_MS + 300);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [canNavigate, step]);

  // touch navigation
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (!canNavigate) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 120) step(diff > 0 ? 1 : -1);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [canNavigate, step]);

  return (
    <>
      <Sky />

      {/* lights */}
      <ambientLight color={0xfff5e6} intensity={0.6} />
      <directionalLight
        color={0xffe4b5}
        intensity={1.4}
        position={[30, 40, 20]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.001}
      />
      <directionalLight
        color={0x87ceeb}
        intensity={0.3}
        position={[-20, 10, -10]}
      />

      <Sea />

      <Islands
        currentIsland={currentIsland}
        isOverview={isOverview}
        onLabelClick={handleLabelClick}
        onIslandClick={enterExploreMode}
      />

      <Clouds />

      <IslandGlow isOverview={isOverview} />

      <SecretIsland />

      <CameraController
        isOverview={isOverview}
        secretActive={secretActive}
        targetIsland={targetIsland}
      />
    </>
  );
}
