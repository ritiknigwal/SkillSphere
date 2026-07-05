function WelcomeCard() {

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (

    <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-6 shadow-lg mb-6">

      <h2 className="text-3xl font-bold">
        {greeting} 👋
      </h2>

      <p className="text-slate-200 mt-2">
        Welcome back to SkillSphere.
      </p>

      <p className="text-slate-300 mt-1">
        Learn • Teach • Connect • Grow
      </p>

    </div>

  );

}

export default WelcomeCard;