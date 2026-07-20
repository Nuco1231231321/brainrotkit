import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo-link" aria-label="BrainrotKit home">
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="logo-type">BR.KIT</span>
    </Link>
  );
}
