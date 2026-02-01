import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusSelect from "../components/StatusSelect";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { STATUSES } from "../constants/status";
import { JOB_TYPES } from "../constants/jobType";
import {
  listApplications,
  updateApplicationStatus,
  createApplication,
  updateApplication,
  softDeleteApplication,
} from "../api/applications";

const emptyForm = {
  company_name: "",
  position_title: "",
  location: "",
  job_type: "",
  source: "",
  applied_date: "",
  notes: "",
};

export default function Applications() {
  const { toast, show } = useToast();

  // CRUD modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  // filters
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const size = 10;

  const params = useMemo(() => {
    const p = { page, size, include_deleted: false };
    if (status) p.status = status;
    if (source) p.source = source;
    return p;
  }, [page, size, status, source]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listApplications(params);
      setRows(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // -------- Status update --------
  async function onChangeStatus(appId, nextStatus) {
    setUpdatingId(appId);
    setError(null);
    try {
      await updateApplicationStatus(appId, {
        status: nextStatus,
        note: "updated from UI",
      });

      // optimistic update
      setRows((prev) =>
        prev.map((r) =>
          r.id === appId ? { ...r, current_status: nextStatus } : r
        )
      );

      show("Status updated ✅");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Status update failed");
      show("Status update failed ❌", "error");
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  // -------- CRUD helpers --------
  function openCreate() {
    setForm(emptyForm);
    setCreateOpen(true);
  }

  function openEdit(row) {
    setEditId(row.id);
    setForm({
      company_name: row.company_name || "",
      position_title: row.position_title || "",
      location: row.location || "",
      job_type: row.job_type || "",
      source: row.source || "",
      applied_date: row.applied_date || "",
      notes: row.notes || "",
    });
    setEditOpen(true);
  }

  async function submitCreate() {
    setError(null);

    if (!form.company_name.trim() || !form.position_title.trim()) {
      setError("Company and Position are required.");
      show("Company & Position required ❗", "error");
      return;
    }

    try {
      await createApplication({
        ...form,
        job_type: form.job_type || null,
        applied_date: form.applied_date || null,
      });
      setCreateOpen(false);
      await load();
      show("Created ✅");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Create failed");
      show("Create failed ❌", "error");
    }
  }

  async function submitEdit() {
    setError(null);

    if (!editId) {
      setError("Missing edit id");
      show("Missing edit id ❌", "error");
      return;
    }

    if (!form.company_name.trim() || !form.position_title.trim()) {
      setError("Company and Position are required.");
      show("Company & Position required ❗", "error");
      return;
    }

    try {
      await updateApplication(editId, {
        ...form,
        job_type: form.job_type || null,
        applied_date: form.applied_date || null,
      });
      setEditOpen(false);
      setEditId(null);
      await load();
      show("Saved ✅");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Update failed");
      show("Save failed ❌", "error");
    }
  }

  async function onDelete(appId) {
    const ok = window.confirm("Soft delete this application?");
    if (!ok) return;

    setError(null);
    try {
      await softDeleteApplication(appId);
      await load();
      show("Deleted (soft) ✅", "error");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Delete failed");
      show("Delete failed ❌", "error");
    }
  }

  return (
    <div style={{ padding: 24, color: "white", fontFamily: "Arial" }}>
      {/* ✅ Toast burada render edilir (fonksiyonların içine değil) */}
      <Toast open={toast.open} text={toast.text} type={toast.type} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Applications</h1>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Filters */}
          <select
            className="select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            className="input"
            value={source}
            onChange={(e) => {
              setPage(1);
              setSource(e.target.value);
            }}
            placeholder="Filter by source (e.g. LinkedIn)"
            style={{ width: 260 }}
          />

          {/* Add */}
          <button className="button" onClick={openCreate}>
            + Add
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgba(255,204,102,0.35)",
            borderRadius: 12,
            color: "#ffcc66",
            background: "rgba(255,204,102,0.06)",
          }}
        >
          {String(error)}
        </div>
      )}

      {/* Table Card */}
      <div className="card" style={{ marginTop: 16, overflow: "hidden" }}>
        <div className="card-header" style={{ opacity: 0.9 }}>
          <div>
            Showing page <b>{page}</b> (size {size})
          </div>
          <div style={{ fontSize: 12, color: "rgba(231,234,240,0.65)" }}>
            Tip: Use Status / Source filters
          </div>
        </div>

        {loading ? (
          <div className="card-body">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="card-body" style={{ opacity: 0.8 }}>
            No applications found.
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Source</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th style={{ width: 170 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link
                        to={`/applications/${r.id}`}
                        style={{
                          color: "white",
                          textDecoration: "underline",
                          textUnderlineOffset: 4,
                        }}
                      >
                        {r.company_name}
                      </Link>
                    </td>

                    <td>
                      <Link
                        to={`/applications/${r.id}`}
                        style={{
                          color: "white",
                          textDecoration: "underline",
                          textUnderlineOffset: 4,
                        }}
                      >
                        {r.position_title}
                      </Link>
                    </td>

                    <td style={{ opacity: 0.9 }}>{r.source || "-"}</td>
                    <td style={{ opacity: 0.9 }}>{r.applied_date || "-"}</td>

                    <td style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <StatusBadge status={r.current_status} />
                      <StatusSelect
                        value={
                          r.current_status?.replace("Status.", "") || r.current_status
                        }
                        disabled={updatingId === r.id}
                        onChange={(s) => onChangeStatus(r.id, s)}
                      />
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="button" onClick={() => openEdit(r)}>
                          Edit
                        </button>
                        <button
                          className="button"
                          onClick={() => onDelete(r.id)}
                          style={{ borderColor: "rgba(255,80,80,0.35)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          className="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <button className="button" onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>

      <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
        Note: Next button doesn't know total pages (yet). We'll add total-count endpoint if needed.
      </div>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        title="Add Application"
        onClose={() => setCreateOpen(false)}
      >
        <FormFields form={form} setForm={setForm} />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 12,
          }}
        >
          <button className="button" onClick={() => setCreateOpen(false)}>
            Cancel
          </button>
          <button className="button" onClick={submitCreate}>
            Create
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} title="Edit Application" onClose={() => setEditOpen(false)}>
        <FormFields form={form} setForm={setForm} />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 12,
          }}
        >
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

function FormFields({ form, setForm }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Company*
        </div>
        <input
          className="input"
          value={form.company_name}
          onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
          placeholder="ACME"
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Position*
        </div>
        <input
          className="input"
          value={form.position_title}
          onChange={(e) =>
            setForm((p) => ({ ...p, position_title: e.target.value }))
          }
          placeholder="Data Scientist Intern"
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Location
        </div>
        <input
          className="input"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          placeholder="Izmir / Remote"
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Job Type
        </div>
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
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Source
        </div>
        <input
          className="input"
          value={form.source}
          onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
          placeholder="LinkedIn"
        />
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Applied Date
        </div>
        <input
          className="input"
          type="date"
          value={form.applied_date}
          onChange={(e) => setForm((p) => ({ ...p, applied_date: e.target.value }))}
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          Notes
        </div>
        <textarea
          className="input"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="short notes..."
          rows={4}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>
    </div>
  );
}
