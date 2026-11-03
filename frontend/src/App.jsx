import { useEffect, useState } from "react";
import * as api from "./api";
import CapacityBar from "./components/CapacityBar";
import ApplianceList from "./components/ApplianceList";
import RegisterForm from "./components/RegisterForm";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null); 

  async function refresh() {
    try {
      setStatus(await api.getStatus());
    } catch (err) {
      setMessage({ type: "error", text: "Could not load status: " + err.message });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // runs any API call, shows what happened, then re-fetches the real state
  async function runAction(action, describe) {
    let success = true;
    try {
      const result = await action();
      setMessage({ type: "info", text: describe(result) });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      success = false;
    }
    await refresh();
    return success;
  }

  function handleOn(a) {
    runAction(
      () => api.turnOn(a.id),
      (r) =>
        r.shed.length > 0
          ? `${a.name} is ON. Shed to make room: ${r.shed.join(", ")}`
          : `${a.name} is ON.`
    );
  }

  function handleOff(a) {
    runAction(
      () => api.turnOff(a.id),
      (r) =>
        r.restored.length > 0
          ? `${a.name} is OFF. Restored: ${r.restored.join(", ")}`
          : `${a.name} is OFF.`
    );
  }

  function handleDelete(a) {
    runAction(
      () => api.removeAppliance(a.id),
      (r) =>
        r.restored.length > 0
          ? `${a.name} deleted. Restored: ${r.restored.join(", ")}`
          : `${a.name} deleted.`
    );
  }

  function handleRegister(appliance) {
    return runAction(
      () => api.addAppliance(appliance),
      (r) => `${r.name} registered.`
    );
  }

  if (!status) {
    return <div className="app">{message ? message.text : "Loading..."}</div>;
  }

  return (
    <div className="app">
      <h1>Inverter Load Manager</h1>

      <CapacityBar used={status.used} capacity={status.capacity} />

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="card">
        <ApplianceList
          appliances={status.appliances}
          onOn={handleOn}
          onOff={handleOff}
          onDelete={handleDelete}
        />
      </div>

      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}

export default App;