CREATE TABLE departments
(
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE employees
(
    id            BIGSERIAL PRIMARY KEY,
    firstname     TEXT NOT NULL,
    lastname     TEXT NOT NULL,
    address       TEXT,
    phone         TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    department_id BIGINT REFERENCES departments (id),
    CONSTRAINT chk_phone CHECK (phone ~ '^\+\d{7,15}$')
);
