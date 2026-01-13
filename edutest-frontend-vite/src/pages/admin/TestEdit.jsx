import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import './TestEdit.css'

const TestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.getTest(id);
        setTest(res.data);
      } catch (err) {
        setError("Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  // ✅ SAVE HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.updateTest(id, {
        title: test.title,
        description: test.description,
        duration: test.duration,
      });

      navigate("/admin/tests"); // go back to list
    } catch (err) {
      console.error(err);
      setError("Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading test...</p>;
  if (error) return <p>{error}</p>;
  if (!test) return <p>Test not found</p>;

  return (
  <div className="edit-test-page">
    <form className="edit-test-form" onSubmit={handleSubmit}>
      <h2>Edit Test</h2>

      <div className="form-group">
        <label>Title</label>
        <input
          value={test.title || ""}
          onChange={(e) =>
            setTest({ ...test, title: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <input
          type="number"
          value={test.duration || 0}
          onChange={(e) =>
            setTest({ ...test, duration: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          rows="4"
          value={test.description || ""}
          onChange={(e) =>
            setTest({ ...test, description: e.target.value })
          }
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/admin/tests")}
        >
          Cancel
        </button>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Update Test"}
        </button>
      </div>
    </form>
  </div>
);

};

export default TestEdit;
