
import useLenis from "../hooks/useLenis";

export default function Providers({ children }) {
  useLenis();

  return <>{children}</>;
}