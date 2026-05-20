import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const { refreshMe } = useAuth();
  const [me, setMe] = useState(null);
  const location = useLocation();

  useEffect(() => {
    refreshMe()
      .then(setMe)
      .catch(() => {});
  }, [location.pathname, refreshMe]);

  return (
    <div className="min-h-screen bg-base">
      <Sidebar me={me} />
      <main className="ml-60 min-h-screen p-8 overflow-y-auto">
        <Outlet context={{ me, refreshMe: () => refreshMe().then(setMe) }} />
      </main>
    </div>
  );
}
