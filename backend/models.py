from sqlalchemy import (
    Table, Column, Integer, String,
    Boolean, Text, TIMESTAMP, ForeignKey
)
import sqlalchemy
from database import metadata

users = Table("users", metadata,
    Column("user_id",           Integer,      primary_key=True, autoincrement=True),
    Column("username",          String(50),   unique=True, nullable=False),
    Column("password_hash",     String(255),  nullable=False),
    Column("full_name",         String(100)),
    Column("emergency_contact", String(20)),
    Column("disability_details",Text),
    Column("created_at",        TIMESTAMP,    server_default=sqlalchemy.func.now()),
)

devices = Table("devices", metadata,
    Column("device_id",     Integer,     primary_key=True, autoincrement=True),
    Column("device_serial", String(50),  unique=True, nullable=False),
    Column("user_id",       Integer,     ForeignKey("users.user_id")),
    Column("device_name",   String(50)),
    Column("is_active",     Boolean,     default=True),
)

job_logs = Table("job_logs", metadata,
    Column("log_id",       Integer,      primary_key=True, autoincrement=True),
    Column("job_uuid",     String(100),  unique=True, nullable=False),
    Column("device_serial",String(50),   ForeignKey("devices.device_serial")),
    Column("status",       String(20)),
    Column("result_text",  Text),
    Column("image_path",   String(255)),
    Column("audio_path",   String(255)),
    Column("created_at",   TIMESTAMP,    server_default=sqlalchemy.func.now()),
)