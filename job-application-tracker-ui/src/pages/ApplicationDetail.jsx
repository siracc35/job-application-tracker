import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import StatusBadge from "../components/StatusBadge";
import StatusSelect from "../components/StatusSelect";
import { JOB_TYPES } from "../constants/jobType";
import {
  getApplication,
  getApplicationHistory,
  updateApplicationStatus,
  updateApplication,
  softDeleteApplication,
} from "../api/applications";

export default function ApplicationDetail() {
  const { toast, show } = useToast();

  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, h] = await Promise.all([
        getApplication(id),
        getApplicationHistory(id),
      ]);

      setApp(a.data);
      setHistory(h.data || []);

      setForm({
        company_name: a.data.company_name || "",
        position_title: a.data.position_title || "",
        location: a.data.location || "",
        job_type: a.data.job_type || "",
        source: a.data.source || "",
        applied_date: a.data.applied_date || "",
        notes: a.data.notes || "",
      });
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load");
      show("Failed to load ❌", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onChangeStatus(nextStatus) {
    if (!app) return;

    setUpdating(true);
    setError(null);
    try {
      await updateApplicationStatus(app.id, {
        status: nextStatus,
        note: "updated from detail page",
      });
      await load();
      show("Status updated ✅");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Status update failed");
      show("Status update failed ❌", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function submitEdit() {
    if (!app) return;

    setError(null);

    if (!form?.company_name?.trim() || !form?.position_title?.trim()) {
      setError("Company and Position are required.");
      show("Company & Position required ❗", "error");
      return;
    }

    try {
      await updateApplication(app.id, {
        ...form,
        job_type: form.job_type || null,
        applied_date: form.applied_date || null,
      });
      setEditOpen(false);
      await load();
      show("Saved ✅");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Update failed");
      show("Save failed ❌", "error");
    }
  }

  async function onDelete() {
    if (!app) return;

    const ok = window.confirm("Soft delete this application?");
    if (!ok) return;

    setError(null);
    try {
      await softDeleteApplication(app.id);
      show("Deleted (soft) ✅", "error");
      navigate("/applications");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Delete failed");
      show("Delete failed ❌", "error");
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <Toast open={toast.open} text={toast.text} type={toast.type} />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "tomato" }}>
        <Toast open={toast.open} text={toast.text} type={toast.type} />
        {String(error)}
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <Toast open={toast.open} text={toast.text} type={toast.type} />
        Not found
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "white", fontFamily: "Arial" }}>
      {/* ✅ Toast burada render edilir */}
      <Toast open={toast.open} text={toast.text} type={toast.type} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={{ opacity: 0.75, fontSize: 12 }}>Application</div>
          <h1 style={{ margin: 0 }}>
            {app.company_name} — {app.position_title}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="button" onClick={() => navigate("/applications")}>
            ← Back
          </button>
          <button className="button" onClick={() => setEditOpen(true)}>
            Edit
          </button>
          <button
            className="button"
            onClick={onDelete}
            style={{ borderColor: "rgba(255,80,80,0.35)" }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div style={{ fontWeight: 800 }}>Overview</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge status={app.current_status} />
            <StatusSelect
              value={app.current_status?.replace("Status.", "") || app.current_status}
              disabled={updating || app.is_deleted}
              onChange={onChangeStatus}
            />
          </div>
        </div>

        <div
          className="card-body"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Info label="Location" value={app.location || "-"} />
          <Info label="Job Type" value={app.job_type || "-"} />
          <Info label="Source" value={app.source || "-"} />
          <Info label="Applied Date" value={app.applied_date || "-"} />

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Notes</div>
            <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
              {app.notes || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div style={{ fontWeight: 800 }}>Status History</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{history.length} events</div>
        </div>

        <div className="card-body">
          {history.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No history found.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {history.map((h) => (
                <div
                  key={h.id ?? `${h.status}-${h.changed_at}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 160px 1fr",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div style={{ opacity: 0.85 }}>{formatTs(h.changed_at)}</div>
                  <div>
                    <StatusBadge status={h.status} />
                  </div>
                  <div style={{ opacity: 0.9 }}>{h.note || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal open={editOpen} title="Edit Application" onClose={() => setEditOpen(false)}>
        <FormFields form={form} setForm={setForm} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <button className="button" onClick={() => setEditOpen(false)}>
            Cancel
          </button>
          <button className="button" onClick={submitEdit}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ opacity: 0.95 }}>{String(value)}</div>
    </div>
  );
}

function FormFields({ form, setForm }) {
  if (!form) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Company*</div>
        <input
          className="input"
          value={form.company_name}
          onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Position*</div>
        <input
          className="input"
          value={form.position_title}
          onChange={(e) => setForm((p) => ({ ...p, position_title: e.target.value }))}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Location</div>
        <input
          className="input"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Job Type</div>
        <select
          className="select"
          value={form.job_type}
          onChange={(e) => setForm((p) => ({ ...p, job_type: e.target.value }))}
        >
          <option value="">(optional)</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Source</div>
        <input
          className="input"
          value={form.source}
          onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Applied Date</div>
        <input
          className="input"
          type="date"
          value={form.applied_date}
          onChange={(e) => setForm((p) => ({ ...p, applied_date: e.target.value }))}
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Notes</div>
        <textarea
          className="input"
          rows={4}
          style={{ width: "100%", resize: "vertical" }}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>
    </div>
  );
}

function formatTs(ts) {
  if (!ts) return "-";
  const s = String(ts).replace("T", " ");
  return s.slice(0, 19);
}
