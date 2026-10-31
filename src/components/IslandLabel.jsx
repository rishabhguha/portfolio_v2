import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Tweakable from './Tweakable.jsx';
import useStore from '../store/useStore.js';
import useTweakStore from '../store/useTweakStore.js';

// An island's click target: a floating HTML pill (accent dot, label, arrow)
// coloured from the island's `labelTheme`. It is a real <button>, so it gets
// native hover, focus and keyboard activation and crisp text at any DPI.
//
// distanceFactor 14 renders it at ~1:1 from the focused camera (~13 units away
// at fov 55), shrinking naturally with distance in overview. zIndexRange keeps
// it under the content-card overlay (z-index 50).
const DISTANCE_FACTOR = 14;

// island-local default, at one constant height on every island (not relative
// to the island's surfaceY) so the labels line up. An island's `labelPosition`
// overrides it.
const DEFAULT_POSITION = [0, 8.5, 2];

export const labelPositionFor = (island) =>
  island.labelPosition ?? DEFAULT_POSITION;

export default function IslandLabel({ island, isCurrent, onLabelClick }) {
  const isAnimating = useStore((s) => s.isAnimating);
  const cardOpen = useStore((s) => s.cardOpen);
  const tweakEnabled = useTweakStore((s) => s.enabled);
  const select = useTweakStore((s) => s.select);
  const tweakId = `${island.id}:label`;
  const selected = useTweakStore((s) => s.selectedId === tweakId);

  const defaultPosition = labelPositionFor(island);
  // only the island in focus shows its label, and only once the camera has
  // settled on it: it fades out as a flight starts and back in on landing
  const active = isCurrent && !isAnimating;

  // gentle bob; phase accumulates per frame and the amplitude is damped, so a
  // state flip bends the motion instead of snapping it
  const groupRef = useRef();
  const phaseRef = useRef(Math.random() * Math.PI * 2);
  const ampRef = useRef(0);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    phaseRef.current += delta * 1.6;
    ampRef.current = THREE.MathUtils.damp(
      ampRef.current,
      active && !cardOpen ? 1 : 0.3,
      3,
      delta,
    );
    groupRef.current.position.y = tweakEnabled
      ? 0
      : Math.sin(phaseRef.current) * 0.12 * ampRef.current;
  });

  // in tweak mode a click selects the label for the TweakPanel instead of
  // opening its card. Html isn't raycast, so this is
  // the DOM-side equivalent of Tweakable's onClick.
  const onClick = () => {
    if (tweakEnabled)
      select(tweakId, {
        islandId: island.id,
        label: `${island.label} label`,
        defaultPosition,
        copyKey: 'labelPosition',
      });
    else if (active) onLabelClick();
  };

  const { bg, text, accent, onAccent, ring } = island.labelTheme;
  const classes = [
    'island-label',
    active ? 'is-active' : 'is-hidden',
    tweakEnabled && 'is-tweak',
    selected && 'is-selected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tweakable
      id={tweakId}
      islandId={island.id}
      label={`${island.label} label`}
      defaultPosition={defaultPosition}
    >
      <group ref={groupRef}>
        <Html
          center
          distanceFactor={DISTANCE_FACTOR}
          zIndexRange={[40, 0]}
          style={{ pointerEvents: active ? 'auto' : 'none' }}
        >
          <button
            type='button'
            className={classes}
            style={{
              '--label-bg': bg,
              '--label-text': text,
              '--label-accent': accent,
              '--label-on-accent': onAccent,
              '--label-ring': ring,
            }}
            tabIndex={active ? 0 : -1}
            aria-label={`Open ${island.label}`}
            aria-hidden={!active}
            onClick={onClick}
          >
            <span className='island-label__dot' />
            <span className='island-label__text'>{island.label}</span>
            <span className='island-label__arrow' aria-hidden='true'>
              →
            </span>
          </button>
        </Html>
      </group>
    </Tweakable>
  );
}
