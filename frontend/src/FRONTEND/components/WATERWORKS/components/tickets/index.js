import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import axiosInstance from "../../../../../api/axiosInstance";

const defaultForm = {
  taxpayer_name: "",
  local_tin: "",
  account_number: "",
  meter_number: "",
  concern_type: "LEAK",
  priority: "NORMAL",
  assigned_to: "",
  description: "",
};

function Index() {
  const [formData, setFormData] = useState(defaultForm);
  const [tickets, setTickets] = useState([]);
  const [taxpayerSearch, setTaxpayerSearch] = useState("");
  const [taxpayerOptions, setTaxpayerOptions] = useState([]);
  const [loadingTaxpayers, setLoadingTaxpayers] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolveTicket, setResolveTicket] = useState(null);
  const [resolveIssue, setResolveIssue] = useState("");
  const [resolving, setResolving] = useState(false);

  const loadTickets = async () => {
    try {
      const response = await axiosInstance.get("/waterworks/tickets");
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load waterworks tickets:", err);
      setTickets([]);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingTaxpayers(true);

      try {
        const response = await axiosInstance.get("/waterworks/taxpayers", {
          params: {
            search: taxpayerSearch || undefined,
            limit: 20,
          },
        });

        setTaxpayerOptions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load taxpayer options:", err);
        setTaxpayerOptions([]);
      } finally {
        setLoadingTaxpayers(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [taxpayerSearch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaxpayerSearch = (event) => {
    const value = event.target.value;
    setTaxpayerSearch(value);
    setFormData((prev) => ({
      ...prev,
      taxpayer_name: value,
    }));
  };

  const handleSelectTaxpayer = (option) => {
    setTaxpayerSearch(option.taxpayer || "");
    setTaxpayerOptions([]);
    setFormData((prev) => ({
      ...prev,
      taxpayer_name: option.taxpayer || "",
      local_tin: option.localTin || "",
    }));
  };

  const handleCreateTicket = async () => {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      const response = await axiosInstance.post("/waterworks/tickets", formData);
      setFeedback(response.data?.message || "Ticket created.");
      setFormData(defaultForm);
      setTaxpayerSearch("");
      setTaxpayerOptions([]);
      await loadTickets();
    } catch (err) {
      console.error("Failed to create waterworks ticket:", err);
      setError(err.response?.data?.message || "Failed to create ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await axiosInstance.put(`/waterworks/tickets/${ticketId}`, { status });
      await loadTickets();
    } catch (err) {
      console.error("Failed to update waterworks ticket:", err);
      setError(err.response?.data?.message || "Failed to update ticket status.");
    }
  };

  const handleOpenResolveModal = (ticket) => {
    setResolveTicket(ticket);
    setResolveIssue(ticket?.remarks || "");
  };

  const handleResolveTicket = async () => {
    if (!resolveTicket) {
      return;
    }

    if (!resolveIssue.trim()) {
      setError("Main issue is required before resolving the ticket.");
      return;
    }

    setResolving(true);
    setError("");

    try {
      await axiosInstance.put(`/waterworks/tickets/${resolveTicket.id}`, {
        status: "RESOLVED",
        remarks: resolveIssue.trim(),
      });

      setResolveTicket(null);
      setResolveIssue("");
      await loadTickets();
    } catch (err) {
      console.error("Failed to resolve waterworks ticket:", err);
      setError(err.response?.data?.message || "Failed to resolve ticket.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Taxpayer Name</Form.Label>
            <Form.Control
              name="taxpayer_name"
              value={taxpayerSearch}
              onChange={handleTaxpayerSearch}
              autoComplete="off"
            />
            {loadingTaxpayers ? (
              <Form.Text className="text-muted">Searching taxpayers...</Form.Text>
            ) : null}
            {taxpayerOptions.length > 0 ? (
              <div
                style={{
                  border: "1px solid #dee2e6",
                  borderTop: "none",
                  borderRadius: "0 0 0.375rem 0.375rem",
                  maxHeight: "180px",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  position: "relative",
                  zIndex: 5,
                }}
              >
                {taxpayerOptions.map((option, index) => (
                  <div
                    key={`${option.localTin || option.taxpayer}-${index}`}
                    onClick={() => handleSelectTaxpayer(option)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom:
                        index === taxpayerOptions.length - 1
                          ? "none"
                          : "1px solid #f1f3f5",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{option.taxpayer || "-"}</div>
                    <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                      {option.localTin || "No Local TIN"}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Local TIN</Form.Label>
            <Form.Control
              name="local_tin"
              value={formData.local_tin}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Meter Number</Form.Label>
            <Form.Control
              name="meter_number"
              value={formData.meter_number}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Concern Type</Form.Label>
            <Form.Select
              name="concern_type"
              value={formData.concern_type}
              onChange={handleChange}
            >
              <option value="LEAK">Leak</option>
              <option value="BILLING">Billing</option>
              <option value="METER">Meter</option>
              <option value="DISCONNECTION">Disconnection</option>
              <option value="RECONNECTION">Reconnection</option>
              <option value="OTHER">Other</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Priority</Form.Label>
            <Form.Select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Assigned To</Form.Label>
            <Form.Control
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Button variant="primary" onClick={handleCreateTicket} disabled={saving}>
            {saving ? "Saving..." : "Create Ticket"}
          </Button>
        </Col>
      </Row>

      {feedback ? <Alert className="mt-3" variant="success">{feedback}</Alert> : null}
      {error ? <Alert className="mt-3" variant="danger">{error}</Alert> : null}

      <hr />
      <h6>Ticket List</h6>
      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Ticket No</th>
            <th>Taxpayer</th>
            <th>Concern</th>
            <th>Main Issue</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.ticket_no}</td>
                <td>{ticket.taxpayer_name || "-"}</td>
                <td>{ticket.concern_type}</td>
                <td>{ticket.remarks || "-"}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
                <td>{ticket.assigned_to || "-"}</td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleStatusChange(ticket.id, "IN_PROGRESS")}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleOpenResolveModal(ticket)}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleStatusChange(ticket.id, "CLOSED")}
                    >
                      Close
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">
                No waterworks tickets found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={Boolean(resolveTicket)} onHide={() => setResolveTicket(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Resolve Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Main Issue</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={resolveIssue}
              onChange={(event) => setResolveIssue(event.target.value)}
              placeholder="Enter the main issue or resolution details"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setResolveTicket(null)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleResolveTicket} disabled={resolving}>
            {resolving ? "Resolving..." : "Resolve Ticket"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Index;
