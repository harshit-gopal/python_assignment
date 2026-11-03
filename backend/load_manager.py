from db import get_conn

MAX_WATTS = 800


class NotFoundError(Exception):
    pass


def _find(conn, appliance_id):
    row = conn.execute(
        "SELECT * FROM appliances WHERE id = ?", (appliance_id,)
    ).fetchone()
    if row is None:
        raise NotFoundError(f"No appliance with id {appliance_id}")
    return row


def _watts_in_use(conn):
    row = conn.execute(
        "SELECT SUM(wattage) FROM appliances WHERE state = 'running'"
    ).fetchone()
    return row[0] or 0 


def _shed(conn, appliance_id):
    row = conn.execute("SELECT MAX(shed_order) FROM appliances").fetchone()
    next_number = (row[0] or 0) + 1
    conn.execute(
        "UPDATE appliances SET state = 'shed', shed_order = ? WHERE id = ?",
        (next_number, appliance_id),
    )


def _restore_shed(conn):
    restored = []
    shed_list = conn.execute(
        "SELECT * FROM appliances WHERE state = 'shed' ORDER BY priority, shed_order"
    ).fetchall()

    room = MAX_WATTS - _watts_in_use(conn)
    for item in shed_list:
        if item["wattage"] <= room:
            conn.execute(
                "UPDATE appliances SET state = 'running', shed_order = NULL WHERE id = ?",
                (item["id"],),
            )
            room -= item["wattage"]
            restored.append(item["name"])
    return restored


def register(name, wattage, priority):
    if not name.strip():
        raise ValueError("Name cannot be empty")
    if wattage <= 0 or wattage > MAX_WATTS:
        raise ValueError(f"Wattage must be between 1 and {MAX_WATTS}")

    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO appliances (name, wattage, priority, state) VALUES (?, ?, ?, 'off')",
            (name.strip(), wattage, priority),
        )
        return dict(_find(conn, cur.lastrowid))


def turn_on(appliance_id):
    with get_conn() as conn:
        item = _find(conn, appliance_id)
        if item["state"] == "running":
            return {"appliance": dict(item), "shed": []}

        room = MAX_WATTS - _watts_in_use(conn)
        shed_names = []

        if item["wattage"] > room:
            still_needed = item["wattage"] - room

            less_important = conn.execute(
                "SELECT * FROM appliances WHERE state = 'running' AND priority > ? "
                "ORDER BY priority DESC",
                (item["priority"],),
            ).fetchall()

            to_shed = []
            for other in less_important:
                if still_needed <= 0:
                    break
                to_shed.append(other)
                still_needed -= other["wattage"]

            if still_needed > 0:
                raise ValueError("Not enough power, even after shedding lower priority loads")

            for other in to_shed:
                _shed(conn, other["id"])
                shed_names.append(other["name"])

        conn.execute(
            "UPDATE appliances SET state = 'running', shed_order = NULL WHERE id = ?",
            (appliance_id,),
        )
        return {"appliance": dict(_find(conn, appliance_id)), "shed": shed_names}


def turn_off(appliance_id):
    with get_conn() as conn:
        item = _find(conn, appliance_id)
        was_running = item["state"] == "running"

        conn.execute(
            "UPDATE appliances SET state = 'off', shed_order = NULL WHERE id = ?",
            (appliance_id,),
        )
        restored = _restore_shed(conn) if was_running else []
        return {"appliance": dict(_find(conn, appliance_id)), "restored": restored}


def delete(appliance_id):
    with get_conn() as conn:
        item = _find(conn, appliance_id)
        conn.execute("DELETE FROM appliances WHERE id = ?", (appliance_id,))
        restored = _restore_shed(conn) if item["state"] == "running" else []
        return {"deleted": appliance_id, "restored": restored}


def get_status():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM appliances ORDER BY priority, id"
        ).fetchall()
        used = _watts_in_use(conn)
        return {
            "capacity": MAX_WATTS,
            "used": used,
            "available": MAX_WATTS - used,
            "appliances": [dict(r) for r in rows],
        }