const BASE = "http://127.0.0.1:8000";

async function request(path, method = "GET", body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? "Please check the values you entered"
      : data.detail;
    throw new Error(detail || "Something went wrong");
  }
  return data;
}

export const getStatus = () => request("/status");
export const addAppliance = (appliance) => request("/appliances", "POST", appliance);
export const turnOn = (id) => request(`/appliances/${id}/on`, "POST");
export const turnOff = (id) => request(`/appliances/${id}/off`, "POST");
export const removeAppliance = (id) => request(`/appliances/${id}`, "DELETE");