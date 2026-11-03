Create table if not exists appliances (
    id integer primary key autoincrement,
    name text not null,
    wattage integer not null check (wattage > 0),
    priority integer not null,
    state text not null default 'off' check (state in ('running', 'off','shed')),
    shed_order integer
);