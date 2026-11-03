function CapacityBar({ used, capacity }) {
  const percent = Math.min(100, (used / capacity) * 100);

  let level = "ok";
  if (percent >= 90) level = "danger";
  else if (percent >= 70) level = "warn";

  return (
    <div className="card">
      <div className="capacity-label">
        <span>Load</span>
        <strong>
          {used}W / {capacity}W
        </strong>
      </div>
      <div className="bar">
        <div className={`bar-fill ${level}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default CapacityBar;