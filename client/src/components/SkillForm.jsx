import { useState } from "react";
import API from "../api/axios";

function SkillForm({ onSkillAdded }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    level: "Beginner",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/skills/add", form);

      alert("Skill added successfully");

      setForm({
        name: "",
        category: "",
        level: "Beginner",
        description: "",
      });

      if (onSkillAdded) {
        onSkillAdded();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add skill");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        Add New Skill
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Skill Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600"
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600"
      />

      <select
        name="level"
        value={form.level}
        onChange={handleChange}
        className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600"
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows="4"
        className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600"
      />

      <button
        type="submit"
        className="bg-green-600 px-5 py-2 rounded hover:bg-green-700"
      >
        Add Skill
      </button>
    </form>
  );
}

export default SkillForm;