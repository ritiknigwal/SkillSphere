import Navbar from "../components/Navbar";

function DashboardLayout({ children, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;