function AdminStats({ stats }) {
  const cards = [
    {
      title: "Users",
      value: stats.totalUsers || 0,
      color: "border-blue-500",
      icon: "👥",
    },
    {
      title: "Skills",
      value: stats.totalSkills || 0,
      color: "border-green-500",
      icon: "🛠",
    },
    {
      title: "Sessions",
      value: stats.totalSessions || 0,
      color: "border-purple-500",
      icon: "📅",
    },
    {
      title: "Reviews",
      value: stats.totalReviews || 0,
      color: "border-yellow-500",
      icon: "⭐",
    },
    {
      title: "Exchanges",
      value: stats.totalExchanges || 0,
      color: "border-pink-500",
      icon: "🔄",
    },
    {
      title: "Connections",
      value: stats.totalConnections || 0,
      color: "border-cyan-500",
      icon: "🤝",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-slate-800 border-l-4 ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition duration-300`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">
                {card.title}
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {card.value}
              </h2>
            </div>

            <div className="text-4xl">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminStats;