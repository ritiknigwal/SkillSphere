function TrendingCategories() {
  const categories = [
    {
      name: "Programming",
      emoji: "💻",
      color: "bg-blue-600",
    },
    {
      name: "Design",
      emoji: "🎨",
      color: "bg-pink-600",
    },
    {
      name: "Marketing",
      emoji: "📈",
      color: "bg-green-600",
    },
    {
      name: "Music",
      emoji: "🎵",
      color: "bg-purple-600",
    },
    {
      name: "Photography",
      emoji: "📷",
      color: "bg-orange-600",
    },
    {
      name: "Language",
      emoji: "🌍",
      color: "bg-cyan-600",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mb-6">

      <h2 className="text-2xl font-bold mb-5">
        Trending Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">

        {categories.map((item) => (

          <div
            key={item.name}
            className="bg-slate-700 rounded-xl p-4 text-center hover:scale-105 transition duration-300 cursor-pointer"
          >

            <div
              className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3`}
            >
              {item.emoji}
            </div>

            <p className="font-semibold">
              {item.name}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TrendingCategories;