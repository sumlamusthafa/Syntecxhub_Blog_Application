import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <span>Inkwell</span>
        <span className="muted">Built for the Syntecxhub Web Development internship</span>
      </footer>
    </>
  );
}
