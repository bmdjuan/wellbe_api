/**
 * Created by bmartin on 17/04/15.
 */
//To execute: node server/bin/automigrate.js

/*
 requires INSERT object, CREATE DDL, and DROP DDL rights to execute properly.

 WARNING:
 creates a new table in the database if it doesn’t exist. If the table already exists,
 it will be DESTROYED and ALL existing data will be dropped. If you want to keep the existing data,
 use datasource.autoupdate() instead.
 */
datasSource.automigrate();
