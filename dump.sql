SET sql_mode='NO_BACKSLASH_ESCAPES';
CREATE TABLE IF NOT EXISTS `jour` (
	id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	username TEXT,
	password TEXT
, namn TEXT);
INSERT INTO jour VALUES(1,'admin','admin',NULL);
CREATE TABLE volunteer (
	id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name TEXT NOT NULL,
	phone TEXT NOT NULL,
	county TEXT,
	active INTEGER DEFAULT 0 NOT NULL
);
CREATE TABLE emergencies (
	id TEXT,
	name TEXT,
	volunteers_needed INTEGER,
	equipment TEXT,
	assembly TEXT,
	info TEXT,
	affected_areas TEXT
);
INSERT INTO sqlite_sequence VALUES('jour',2);
