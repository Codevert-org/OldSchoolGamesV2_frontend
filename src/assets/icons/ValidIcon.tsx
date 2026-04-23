type ValidIconProps = Readonly<{
  className?: string;
  size?: number;
}>;

export default function ValidIcon({ className, size = 12 }: ValidIconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}
