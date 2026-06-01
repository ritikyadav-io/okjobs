export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-extrabold tracking-tight text-2xl leading-none ${className}`}>
      <span style={{ color: "#2BB3EE" }}>Ok</span>
      <span style={{ color: "#5A6B2F" }}>Jobs</span>
    </div>
  );
}
