/**
 * The brand's most recognizable element:
 * a horizontal red→orange→yellow→cream gradient band that sits
 * above the footer on every page.
 */
export function SunsetStripe({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full ${className}`} aria-hidden="true">
      <div className="h-2 w-full bg-sunset-stripe" />
    </div>
  );
}
