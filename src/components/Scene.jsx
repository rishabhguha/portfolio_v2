import { useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import Sky from './Sky.jsx';
import Sea from './Sea.jsx';
import Islands from './Islands.jsx';
import Clouds from './Clouds.jsx';
import IslandGlow from './IslandGlow.jsx';
import CameraController from './CameraController.jsx';
import useStore from '../store/useStore.js';

export default function Scene() {
  const { gl } = useThree();

  const isOverview = useStore((s) => s.isOverview);
  const currentIsland = useStore((s) => s.currentIsland);
  const targetIsland = useStore((s) => s.targetIsland);
  const scrollEnabled = useStore((s) => s.scrollEnabled);
  const cardOpen = useStore((s) => s.cardOpen);
  const isAnimating = useStore((s) => s.isAnimating);

  const enterExploreMode = useStore((s) => s.enterExploreMode);
  const navigateToIsland = useStore((s) => s.navigateToIsland);
  const openCard = useStore((s) => s.openCard);
  const closeCard = useStore((s) => s.closeCard);

  const handleSignboardClick = useCallback(
    (islandIndex) => {
      if (!cardOpen) openCard(islandIndex);
    },
    [cardOpen, openCard],
  );

  // keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (cardOpen && e.key === 'Escape') {
        closeCard();
        return;
      }
      if (!scrollEnabled || isAnimating || cardOpen || isOverview) return;
      if (
        (e.key === 'ArrowDown' || e.key === 'ArrowRight') &&
        currentIsland < 3
      ) {
        navigateToIsland(currentIsland + 1);
      } else if (
        (e.key === 'ArrowUp' || e.key === 'ArrowLeft') &&
        currentIsland > 0
      ) {
        navigateToIsland(currentIsland - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    scrollEnabled,
    isAnimating,
    cardOpen,
    isOverview,
    currentIsland,
    navigateToIsland,
    closeCard,
  ]);

  // scroll / wheel navigation
  useEffect(() => {
    let cooldown = false;
    const onWheel = (e) => {
      if (!scrollEnabled || cooldown || isAnimating || cardOpen || isOverview)
        return;
      cooldown = true;
      setTimeout(() => (cooldown = false), 2500);
      if (e.deltaY > 0 && currentIsland < 3)
        navigateToIsland(currentIsland + 1);
      else if (e.deltaY < 0 && currentIsland > 0)
        navigateToIsland(currentIsland - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [
    scrollEnabled,
    isAnimating,
    cardOpen,
    isOverview,
    currentIsland,
    navigateToIsland,
  ]);

  // touch navigation
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (!scrollEnabled || isAnimating || cardOpen || isOverview) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 120) {
        if (diff > 0 && currentIsland < 3) navigateToIsland(currentIsland + 1);
        else if (diff < 0 && currentIsland > 0)
          navigateToIsland(currentIsland - 1);
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [
    scrollEnabled,
    isAnimating,
    cardOpen,
    isOverview,
    currentIsland,
    navigateToIsland,
  ]);

  // update cursor style
  useEffect(() => {
    const canvas = gl.domElement;
    const onMouseMove = () => {
      // cursor styling is handled by the pointer-events on meshes via onPointerOver/Out
      // but we set a basic style here; individual mesh hover is done via R3F events
    };
    return () => {};
  }, [gl]);

  // click to enter explore mode on canvas background (island 0 click is on the mesh)
  // This is handled by the Island component's onPointerDown on meshes

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
        onSignboardClick={handleSignboardClick}
        onIslandClick={isOverview ? enterExploreMode : undefined}
      />

      <Clouds />

      <IslandGlow isOverview={isOverview} />

      <CameraController isOverview={isOverview} targetIsland={targetIsland} />
    </>
  );
}
