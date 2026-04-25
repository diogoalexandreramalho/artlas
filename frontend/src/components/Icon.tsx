import type { SVGProps } from 'react';

/** Icon set used across the redesigned UI.
 *
 * 1.5px-stroke, currentColor — drop in next to text and they pick up the
 * surrounding `text-*` colour. Ported from the Claude Design handoff
 * (`/tmp/artlas-handoff/artlas/project/components.jsx`). */
type IconProps = SVGProps<SVGSVGElement>;

const baseStroke: IconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
};

export const Icon = {
  search: (p: IconProps = {}) => (
    <svg width="16" height="16" viewBox="0 0 16 16" {...baseStroke} {...p}>
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3 3" />
    </svg>
  ),
  heart: ({ filled, ...p }: IconProps & { filled?: boolean } = {}) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...p}
    >
      <path d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 4-5 7-5 7Z" />
    </svg>
  ),
  map: (p: IconProps = {}) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...p}
    >
      <path d="M1 4l4-2 6 2 4-2v10l-4 2-6-2-4 2V4z" />
      <path d="M5 2v10M11 4v10" />
    </svg>
  ),
  pin: (p: IconProps = {}) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...p}
    >
      <path d="M8 14s5-4.5 5-8.5A5 5 0 0 0 3 5.5C3 9.5 8 14 8 14Z" />
      <circle cx="8" cy="5.5" r="1.6" />
    </svg>
  ),
  user: (p: IconProps = {}) => (
    <svg width="16" height="16" viewBox="0 0 16 16" {...baseStroke} {...p}>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  ),
  arrow: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M3 7h8M8 4l3 3-3 3" />
    </svg>
  ),
  arrowLeft: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M11 7H3M6 10L3 7l3-3" />
    </svg>
  ),
  close: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  ),
  filter: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M2 4h10M4 7h6M5.5 10h3" />
    </svg>
  ),
  external: (p: IconProps = {}) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      {...p}
    >
      <path d="M5 3H3v6h6V7M7 3h2v2M9 3L5.5 6.5" />
    </svg>
  ),
  plus: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M7 3v8M3 7h8" />
    </svg>
  ),
  check: (p: IconProps = {}) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M3 7l3 3 5-6" />
    </svg>
  ),
  globe: (p: IconProps = {}) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      {...p}
    >
      <circle cx="7" cy="7" r="5" />
      <path d="M2 7h10M7 2c1.5 1.8 1.5 8.2 0 10M7 2c-1.5 1.8-1.5 8.2 0 10" />
    </svg>
  ),
  sort: (p: IconProps = {}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" {...baseStroke} {...p}>
      <path d="M3 4h8M4 7h6M5 10h4" />
    </svg>
  ),
};
