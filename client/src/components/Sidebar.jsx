import { NavLink } from "react-router-dom";

function Sidebar() {
  const menu = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      title: "Chat",
      path: "/chat",
      icon: "💬",
    },
    {
      title: "Profile",
      path: "/profile",
      icon: "👤",
    },
  ];

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen p-5">

      <h1 className="text-3xl font-bold text-blue-400 mb-10">
        SkillSphere
      </h1>

      <div className="flex flex-col gap-3">

        {menu.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition
              ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`
            }
          >
            <span className="text-xl">
              {item.icon}
            </span>

            <span>
              {item.title}
            </span>

          </NavLink>
        ))}

      </div>

    </div>
  );
}

export default Sidebar;