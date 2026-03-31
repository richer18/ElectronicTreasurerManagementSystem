import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useAuth } from "../../../auth/AuthContext";
import { hasPermission } from "../../../auth/permissions";

const STATUS_OPTIONS = ["active", "inactive", "suspended"];

const INITIAL_FORM = {
  username: "",
  email: "",
  phone: "",
  role: "viewer",
  status: "active",
  password: "",
};

function UserManagement() {
  const { user: authUser, refreshUser } = useAuth();
  const canCreateUsers = hasPermission(authUser, "users.create");
  const canUpdateUsers = hasPermission(authUser, "users.update");

  const [users, setUsers] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("create");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        axiosInstance.get("users"),
        axiosInstance.get("roles/permissions"),
      ]);

      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setRoles(Array.isArray(rolesResponse.data?.roles) ? rolesResponse.data.roles : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load user and role management data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const resetDialog = React.useCallback(() => {
    setDialogOpen(false);
    setDialogMode("create");
    setSelectedUser(null);
    setForm(INITIAL_FORM);
    setSaving(false);
  }, []);

  const openCreateDialog = React.useCallback(() => {
    setDialogMode("create");
    setSelectedUser(null);
    setForm(INITIAL_FORM);
    setDialogOpen(true);
    setSuccess("");
    setError("");
  }, []);

  const openEditDialog = React.useCallback((userRow) => {
    setDialogMode("edit");
    setSelectedUser(userRow);
    setForm({
      username: userRow.username || "",
      email: userRow.email || "",
      phone: userRow.phone || "",
      role: userRow.effective_role || userRow.role || "viewer",
      status: userRow.status || "active",
      password: "",
    });
    setDialogOpen(true);
    setSuccess("");
    setError("");
  }, []);

  const handleChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }, []);

  const handleSubmit = React.useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (dialogMode === "create") {
        await axiosInstance.post("users", form);
        setSuccess("User created successfully.");
      } else if (selectedUser) {
        const payload = { ...form };
        if (!payload.password) {
          delete payload.password;
        }

        await axiosInstance.put(`users/${selectedUser.id}`, payload);
        setSuccess("User updated successfully.");
      }

      resetDialog();
      await loadData();
      await refreshUser();
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.errors;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors)?.flat?.()?.[0]
        : null;

      setError(
        firstValidationMessage ||
          requestError?.response?.data?.message ||
          "Unable to save the user record."
      );
    } finally {
      setSaving(false);
    }
  }, [dialogMode, form, loadData, refreshUser, resetDialog, selectedUser]);

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, pb: 4 }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(16,42,67,0.96), rgba(40,80,126,0.92))",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <AdminPanelSettingsRoundedIcon />
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Role Management
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.88, maxWidth: 760 }}>
                Manage who can view, encode, update, delete, export, and administer
                data across treasury modules. Backend permission checks are enforced
                together with this UI.
              </Typography>
            </Box>

            {canCreateUsers ? (
              <Button
                variant="contained"
                startIcon={<PersonAddAlt1RoundedIcon />}
                onClick={openCreateDialog}
                sx={{
                  bgcolor: "#f4b942",
                  color: "#102a43",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#f0aa1a" },
                }}
              >
                Add User
              </Button>
            ) : null}
          </Stack>
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <Grid container spacing={2.5}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} xl={4} key={role.role}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #d9e2ec",
                  textAlign: "left",
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
                      {role.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#52606d" }}>
                      {role.description}
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {role.permissions.map((permission) => (
                      <Chip
                        key={`${role.role}-${permission}`}
                        label={permission}
                        size="small"
                        sx={{
                          bgcolor: permission === "*" ? "#102a43" : "#eef2f6",
                          color: permission === "*" ? "#fff" : "#243b53",
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #d9e2ec", overflow: "hidden" }}
        >
          <Box sx={{ px: 3, py: 2.25, bgcolor: "#f8fafc", textAlign: "left" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#102a43" }}>
              Users
            </Typography>
            <Typography variant="body2" sx={{ color: "#52606d" }}>
              Stored users, current role assignment, account status, and effective
              permission profile.
            </Typography>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Stored Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Effective Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Permissions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.role || "viewer"}</TableCell>
                    <TableCell>{row.effective_role || row.role || "viewer"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === "active" ? "success" : "default"}
                        variant={row.status === "active" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: "#486581" }}>
                        {Array.isArray(row.permissions)
                          ? row.permissions.slice(0, 4).join(", ")
                          : ""}
                        {Array.isArray(row.permissions) && row.permissions.length > 4
                          ? " ..."
                          : ""}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canUpdateUsers ? (
                        <Button
                          size="small"
                          startIcon={<EditRoundedIcon />}
                          onClick={() => openEditDialog(row)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#9fb3c8" }}>
                          Read only
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      <Dialog open={dialogOpen} onClose={resetDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "create" ? "Create User" : `Edit ${selectedUser?.username || "User"}`}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
              fullWidth
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.role} value={role.role}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
              required
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={dialogMode === "create" ? "Password" : "New Password (optional)"}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required={dialogMode === "create"}
              helperText={
                dialogMode === "create"
                  ? "Minimum 8 characters."
                  : "Leave blank to keep the current password."
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? "Saving..." : dialogMode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
