CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rolle TEXT NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    adress TEXT,
    birthdate TEXT,
    peletong_id INTEGER,
    FOREIGN KEY(peletong_id) REFERENCES peletong(id)
);

CREATE TABLE IF NOT EXISTS kompani (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS peletong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kompani_id INTEGER,
    FOREIGN KEY(kompani_id) REFERENCES kompani(id)
);

CREATE TABLE IF NOT EXISTS foreldre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

DELETE FROM peletong WHERE id = 1;
DELETE FROM peletong WHERE id = 2;
DELETE FROM peletong WHERE id = 3;
DELETE FROM peletong WHERE id = 4;

