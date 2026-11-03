function ApplianceList({ appliances, onOn, onOff, onDelete }) {
  if (appliances.length === 0) {
    return <p className="empty">No appliances yet. Add one below.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Watts</th>
          <th>Priority</th>
          <th>State</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {appliances.map((a) => (
          <tr key={a.id}>
            <td>{a.name}</td>
            <td>{a.wattage}W</td>
            <td>{a.priority}</td>
            <td>
              <span className={`badge ${a.state}`}>{a.state}</span>
            </td>
            <td className="actions">
              {a.state === "off" ? (
                <button onClick={() => onOn(a)}>Turn ON</button>
              ) : (
                <button onClick={() => onOff(a)}>Turn OFF</button>
              )}
              <button className="danger" onClick={() => onDelete(a)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApplianceList;