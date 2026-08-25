"""Initial schema - all tables for City Traffic Platform

Revision ID: 001_initial
Revises: None
Create Date: 2026-08-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("username", sa.String(), unique=True, nullable=False),
        sa.Column("email", sa.String(), unique=True, nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False, server_default="ROLE_OPERATOR"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_username", "users", ["username"])
    op.create_index("ix_users_email", "users", ["email"])

    # --- cameras ---
    op.create_table(
        "cameras",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("designation", sa.String(), nullable=False),
        sa.Column("district", sa.String(), server_default="Central District"),
        sa.Column("sector", sa.String(), server_default="Sector 7"),
        sa.Column("location_address", sa.String(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("direction", sa.String(), server_default="Northbound"),
        sa.Column("stream_url", sa.String(), nullable=True),
        sa.Column("resolution", sa.String(), server_default="1080p @ 60fps"),
        sa.Column("status", sa.String(), server_default="nominal"),
        sa.Column("throughput_mbps", sa.Float(), server_default="4.2"),
        sa.Column("uptime_str", sa.String(), server_default="14d 6h 22m"),
        sa.Column("ping_ms", sa.Integer(), server_default="18"),
        sa.Column("last_heartbeat", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_cameras_id", "cameras", ["id"])

    # --- camera_telemetry ---
    op.create_table(
        "camera_telemetry",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("camera_id", sa.String(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), server_default="nominal"),
        sa.Column("throughput_mbps", sa.Float(), server_default="4.2"),
        sa.Column("ping_ms", sa.Integer(), server_default="18"),
        sa.Column("frame_rate", sa.Float(), server_default="30.0"),
        sa.Column("drop_rate_pct", sa.Float(), server_default="0.0"),
    )
    op.create_index("ix_camera_telemetry_id", "camera_telemetry", ["id"])
    op.create_index("ix_camera_telemetry_camera_id", "camera_telemetry", ["camera_id"])
    op.create_index("ix_camera_telemetry_timestamp", "camera_telemetry", ["timestamp"])

    # --- detections ---
    op.create_table(
        "detections",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("camera_id", sa.String(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("raw_plate_text", sa.String(), nullable=False),
        sa.Column("normalized_plate_text", sa.String(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("ocr_confidence", sa.Float(), server_default="0.92"),
        sa.Column("model_version", sa.String(), server_default="YOLOv8-ANPR-v2.4"),
        sa.Column("vehicle_type", sa.String(), server_default="Sedan"),
        sa.Column("bounding_box", sa.Text(), nullable=True),
        sa.Column("plate_bounding_box", sa.Text(), nullable=True),
        sa.Column("evidence_image_uri", sa.String(), nullable=False),
        sa.Column("plate_crop_uri", sa.String(), nullable=True),
        sa.Column("processing_status", sa.String(), server_default="COMPLETED"),
        sa.Column("is_corrected", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("corrected_plate_text", sa.String(), nullable=True),
        sa.Column("review_status", sa.String(), server_default="UNREVIEWED"),
        sa.Column("has_alert", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("alert_type", sa.String(), nullable=True),
    )
    op.create_index("ix_detections_id", "detections", ["id"])
    op.create_index("ix_detections_camera_id", "detections", ["camera_id"])
    op.create_index("ix_detections_timestamp", "detections", ["timestamp"])
    op.create_index("ix_detections_raw_plate_text", "detections", ["raw_plate_text"])
    op.create_index("ix_detections_normalized_plate_text", "detections", ["normalized_plate_text"])
    op.create_index("ix_detections_corrected_plate_text", "detections", ["corrected_plate_text"])

    # --- ocr_corrections ---
    op.create_table(
        "ocr_corrections",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("detection_id", sa.String(), nullable=False),
        sa.Column("original_ocr", sa.String(), nullable=False),
        sa.Column("corrected_plate", sa.String(), nullable=False),
        sa.Column("reviewer_id", sa.String(), nullable=False),
        sa.Column("reviewer_username", sa.String(), nullable=False),
        sa.Column("reason", sa.String(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("revision_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_ocr_corrections_id", "ocr_corrections", ["id"])
    op.create_index("ix_ocr_corrections_detection_id", "ocr_corrections", ["detection_id"])
    op.create_index("ix_ocr_corrections_created_at", "ocr_corrections", ["created_at"])

    # --- watchlists ---
    op.create_table(
        "watchlists",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("normalized_plate", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), server_default="HIGH"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("case_number", sa.String(), nullable=True),
        sa.Column("created_by", sa.String(), server_default="system_admin"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_watchlists_id", "watchlists", ["id"])
    op.create_index("ix_watchlists_normalized_plate", "watchlists", ["normalized_plate"])
    op.create_index("ix_watchlists_is_active", "watchlists", ["is_active"])

    # --- alerts ---
    op.create_table(
        "alerts",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("detection_id", sa.String(), nullable=False),
        sa.Column("camera_id", sa.String(), nullable=False),
        sa.Column("watchlist_id", sa.String(), nullable=True),
        sa.Column("plate_matched", sa.String(), nullable=False),
        sa.Column("category", sa.String(), server_default="GENERAL_INVESTIGATION"),
        sa.Column("severity", sa.String(), server_default="HIGH"),
        sa.Column("status", sa.String(), server_default="NEW"),
        sa.Column("assigned_to", sa.String(), nullable=True),
        sa.Column("dismissal_reason", sa.String(), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_alerts_id", "alerts", ["id"])
    op.create_index("ix_alerts_detection_id", "alerts", ["detection_id"])
    op.create_index("ix_alerts_camera_id", "alerts", ["camera_id"])
    op.create_index("ix_alerts_watchlist_id", "alerts", ["watchlist_id"])
    op.create_index("ix_alerts_plate_matched", "alerts", ["plate_matched"])
    op.create_index("ix_alerts_status", "alerts", ["status"])
    op.create_index("ix_alerts_created_at", "alerts", ["created_at"])

    # --- alert_actions ---
    op.create_table(
        "alert_actions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("alert_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("from_status", sa.String(), nullable=False),
        sa.Column("to_status", sa.String(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("reason", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_alert_actions_id", "alert_actions", ["id"])
    op.create_index("ix_alert_actions_alert_id", "alert_actions", ["alert_id"])
    op.create_index("ix_alert_actions_created_at", "alert_actions", ["created_at"])

    # --- audit_logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column("target_type", sa.String(), nullable=True),
        sa.Column("target_id", sa.String(), nullable=True),
        sa.Column("details_json", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(), server_default="127.0.0.1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_username", "audit_logs", ["username"])
    op.create_index("ix_audit_logs_action_type", "audit_logs", ["action_type"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    # --- retention_policies ---
    op.create_table(
        "retention_policies",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("data_type", sa.String(), nullable=False),
        sa.Column("retention_days", sa.Integer(), server_default="90"),
        sa.Column("auto_purge_enabled", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("last_purged_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_retention_policies_id", "retention_policies", ["id"])


def downgrade() -> None:
    op.drop_table("retention_policies")
    op.drop_table("audit_logs")
    op.drop_table("alert_actions")
    op.drop_table("alerts")
    op.drop_table("watchlists")
    op.drop_table("ocr_corrections")
    op.drop_table("detections")
    op.drop_table("camera_telemetry")
    op.drop_table("cameras")
    op.drop_table("users")
