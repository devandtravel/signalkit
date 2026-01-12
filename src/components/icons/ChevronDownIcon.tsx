import type { IconProps } from "./types";

export const ChevronDownIcon = ({
  title = "Expand",
  size = 12,
  className,
  ...props
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <title>{title}</title>
    <path d="M19 9l-7 7-7-7" />
  </svg>
);
