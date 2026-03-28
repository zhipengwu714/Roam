import Home from "./pages/Home";
import Session from "./pages/Session";

export default function App() {
  const path = window.location.pathname;
  if (path === "/session") return <Session />;
  return <Home />;
}