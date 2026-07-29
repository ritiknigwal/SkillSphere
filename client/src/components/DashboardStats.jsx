function DashboardStats({ skills }) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">

      <div className="bg-sky-600 rounded-xl p-5">
        <h3 className="text-white-400">Skills</h3>
        <p className="text-3xl font-bold text-green-400">
          {skills.length}
        </p>
      </div>

      <div className="bg-sky-600 rounded-xl p-5">
        <h3 className="text-white-400">Matches</h3>
        <p className="text-3xl font-bold text-blue-400">
          0
        </p>
      </div>

      <div className="bg-sky-600 rounded-xl p-5">
        <h3 className="text-white-400">Messages</h3>
        <p className="text-3xl font-bold text-yellow-400">
          0
        </p>
      </div>

      <div className="bg-sky-600 rounded-xl p-5">
        <h3 className="text-white-400">Rating</h3>
        <p className="text-3xl font-bold text-pink-400">
          0.0
        </p>
      </div>

    </div>
  );
}

export default DashboardStats;