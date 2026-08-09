'use client';

import { useEffect, type CSSProperties } from 'react';
import { motion, useAnimation, useMotionValue, type Transition } from 'motion/react';

import './circular-text.css';
import { useAnimationEnabled } from './animation-toggle';

type OnHover = 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';

interface CircularTextProps {
  /** The text to display in a circular layout. */
  text: string;
  /** Seconds for one full rotation. */
  spinDuration?: number;
  /** Hover behaviour variant. */
  onHover?: OnHover;
  /** Extra classes (e.g. `text-emn-black` sets the letter colour via currentColor). */
  className?: string;
  /**
   * Inline style — mainly to size the ring via the `--circular-text-size` and
   * `--circular-text-font-size` custom properties (see circular-text.css).
   */
  style?: CSSProperties;
}

const getRotationTransition = (duration: number, from: number, loop = true) =>
  ({
    from,
    to: from + 360,
    ease: 'linear',
    duration,
    type: 'tween',
    repeat: loop ? Infinity : 0,
  }) as Transition;

const getTransition = (duration: number, from: number) =>
  ({
    rotate: getRotationTransition(duration, from),
    scale: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  }) as Transition;

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  style,
}: CircularTextProps) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const animationEnabled = useAnimationEnabled();

  useEffect(() => {
    // Respect the site-wide animation toggle — hold the ring still when off.
    if (!animationEnabled) {
      controls.stop();
      return;
    }
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  }, [spinDuration, text, onHover, controls, rotation, animationEnabled]);

  const handleHoverStart = () => {
    if (!onHover || !animationEnabled) return;
    const start = rotation.get();

    let transitionConfig: Transition;
    let scaleVal = 1;

    switch (onHover) {
      case 'slowDown':
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case 'speedUp':
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case 'pause':
        transitionConfig = {
          rotate: { type: 'spring', damping: 20, stiffness: 300 },
          scale: { type: 'spring', damping: 20, stiffness: 300 },
        } as Transition;
        scaleVal = 1;
        break;
      case 'goBonkers':
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    if (!animationEnabled) return;
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  return (
    <motion.div
      className={`circular-text ${className}`}
      style={{ rotate: rotation, ...style }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const factor = Math.PI / letters.length;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

        return (
          <span key={i} style={{ transform, WebkitTransform: transform }}>
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
}
