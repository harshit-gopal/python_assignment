import { useState } from "react";

function RegisterForm({ onRegister }) {
  const [name, setName] = useState("");
  const [wattage, setWattage] = useState("");
  const [priority, setPriority] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onRegister({
      name,
      wattage: Number(wattage),
      priority: Number(priority),
    });
    if (ok) {
      setName("");
      setWattage("");
      setPriority("");
    }
  }

  return (
    <form className="card register" onSubmit={handleSubmit}>
      <h2>Register appliance</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        min="1"
        placeholder="Watts"
        value={wattage}
        onChange={(e) => setWattage(e.target.value)}
        required
      />
      <input
        type="number"
        min="1"
        placeholder="Priority (1 = most important)"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default RegisterForm;