import os
import threading
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from twilio.rest import Client

from app import db
from app.models import BroadcastJob, BroadcastLog, Contact, ContactList

messages_bp = Blueprint("messages", __name__)


def get_twilio_client():
    """Create a Twilio client from environment variables."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    if not account_sid or not auth_token:
        return None
    return Client(account_sid, auth_token)


def send_broadcast_async(app, job_id):
    """Send messages to all contacts in a broadcast job (runs in a background thread)."""
    with app.app_context():
        job = BroadcastJob.query.get(job_id)
        if not job:
            return

        job.status = "sending"
        db.session.commit()

        logs = BroadcastLog.query.filter_by(job_id=job.id).all()
        client = get_twilio_client()
        from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

        for log in logs:
            try:
                if client:
                    # Send via Twilio WhatsApp
                    message = client.messages.create(
                        body=job.message_body,
                        from_=from_number,
                        to=f"whatsapp:{log.contact_phone}",
                    )
                    log.twilio_sid = message.sid
                    log.status = "sent"
                else:
                    # Demo mode — simulate sending
                    print(f"[DEMO] Sending to {log.contact_phone}: {job.message_body[:50]}...")
                    log.status = "sent"

                log.sent_at = datetime.utcnow()
                job.sent += 1

            except Exception as e:
                log.status = "failed"
                log.error_message = str(e)
                job.failed += 1
                print(f"[ERROR] Failed to send to {log.contact_phone}: {e}")

            db.session.commit()

        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.session.commit()
        print(f"[INFO] Broadcast job {job.id} completed: {job.sent} sent, {job.failed} failed")


# ── Create & send broadcast ─────────────────────────────────────

@messages_bp.route("/send", methods=["POST"])
@jwt_required()
def send_broadcast():
    user_id = get_jwt_identity()
    data = request.get_json()

    list_id = data.get("list_id")
    message_body = data.get("message", "").strip()

    if not list_id:
        return jsonify({"error": "Contact list is required"}), 400
    if not message_body:
        return jsonify({"error": "Message body is required"}), 400

    # Validate contact list belongs to user
    contact_list = ContactList.query.filter_by(id=list_id, user_id=int(user_id)).first()
    if not contact_list:
        return jsonify({"error": "Contact list not found"}), 404

    # Get valid contacts
    contacts = Contact.query.filter_by(list_id=list_id, is_valid=True).all()
    if not contacts:
        return jsonify({"error": "No valid contacts in this list"}), 400

    # Create broadcast job
    job = BroadcastJob(
        user_id=int(user_id),
        contact_list_id=list_id,
        list_name=contact_list.name,
        message_body=message_body,
        status="pending",
        total=len(contacts),
    )
    db.session.add(job)
    db.session.flush()

    # Create log entries for each contact
    for contact in contacts:
        log = BroadcastLog(
            job_id=job.id,
            contact_id=contact.id,
            contact_phone=contact.phone,
            contact_name=contact.name,
        )
        db.session.add(log)

    db.session.commit()

    # Start sending in a background thread
    app = current_app._get_current_object()
    thread = threading.Thread(target=send_broadcast_async, args=(app, job.id))
    thread.daemon = True
    thread.start()

    return jsonify({
        "message": "Broadcast started",
        "job": job.to_dict(),
    }), 201


# ── Get all broadcast jobs ──────────────────────────────────────

@messages_bp.route("/jobs", methods=["GET"])
@jwt_required()
def get_jobs():
    user_id = get_jwt_identity()
    jobs = BroadcastJob.query.filter_by(user_id=int(user_id)).order_by(BroadcastJob.created_at.desc()).all()
    return jsonify({"jobs": [j.to_dict() for j in jobs]}), 200


# ── Get job details with logs ───────────────────────────────────

@messages_bp.route("/jobs/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job_detail(job_id):
    user_id = get_jwt_identity()
    job = BroadcastJob.query.filter_by(id=job_id, user_id=int(user_id)).first()
    if not job:
        return jsonify({"error": "Job not found"}), 404

    logs = BroadcastLog.query.filter_by(job_id=job.id).all()
    return jsonify({
        "job": job.to_dict(),
        "logs": [l.to_dict() for l in logs],
    }), 200
