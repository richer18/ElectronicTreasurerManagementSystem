import AddTaskIcon from "@mui/icons-material/AddTask";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FlagIcon from "@mui/icons-material/Flag";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TodayIcon from "@mui/icons-material/Today";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axiosInstance from "../../../../api/axiosInstance";
import "./style.css";

const localizer = momentLocalizer(moment);

const DEFAULT_COLOR = "#2196F3";
const CATEGORY_OPTIONS = [
  { value: "Task", label: "Task", color: "#2196F3" },
  { value: "Meeting", label: "Meeting", color: "#7B61FF" },
  { value: "Deadline", label: "Deadline", color: "#F44336" },
  { value: "Reminder", label: "Reminder", color: "#FF9800" },
  { value: "Holiday", label: "Holiday", color: "#4CAF50" },
];

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  steel: "#4b5d73",
  teal: "#0f6b62",
  tealHover: "#0b544d",
  amber: "#a66700",
  bg: "#f5f7fb",
  cardGradients: [
    "linear-gradient(135deg, #0f2747, #2f4f7f)",
    "linear-gradient(135deg, #0f6b62, #2a8a7f)",
    "linear-gradient(135deg, #4b5d73, #6a7f99)",
  ],
};

const createDraftFromDate = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(10, 0, 0, 0);

  return {
    id: null,
    title: "",
    description: "",
    category: "Task",
    color: DEFAULT_COLOR,
    allDay: false,
    start,
    end,
    attachmentFile: null,
    attachmentName: "",
    attachmentUrl: "",
    removeAttachment: false,
  };
};

const parseApiEvent = (event) => {
  const allDay = Boolean(event.allDay);
  const start = new Date(event.start);
  const end = allDay
    ? moment(event.end).add(1, "second").startOf("day").toDate()
    : new Date(event.end);

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    category: event.category || "Task",
    holidayType: event.holidayType || "",
    isSystem: Boolean(event.isSystem),
    color: event.color || DEFAULT_COLOR,
    allDay,
    start,
    end,
    attachmentName: event.attachmentName || "",
    attachmentUrl: event.attachmentUrl || "",
    attachmentMime: event.attachmentMime || "",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

const toDateTimeLocal = (value) => moment(value).format("YYYY-MM-DDTHH:mm");
const toDateOnly = (value) => moment(value).format("YYYY-MM-DD");

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [draft, setDraft] = useState(createDraftFromDate(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("calendar-events");
      setEvents(response.data.map(parseApiEvent));
    } catch (fetchError) {
      console.error("Error fetching calendar events:", fetchError);
      setError("Unable to load calendar events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => moment(event.end).isSameOrAfter(moment().startOf("day")))
      .sort((a, b) => a.start - b.start)
      .slice(0, 5);
  }, [events]);

  const holidayCount = useMemo(
    () => events.filter((event) => event.category === "Holiday").length,
    [events]
  );

  const buildFormData = (eventDraft) => {
    const formData = new FormData();
    formData.append("title", eventDraft.title.trim());
    formData.append("description", eventDraft.description.trim());
    formData.append("category", eventDraft.category);
    formData.append("color", eventDraft.color || DEFAULT_COLOR);
    formData.append("all_day", eventDraft.allDay ? "1" : "0");
    formData.append("start_at", moment(eventDraft.start).toISOString());
    formData.append("end_at", moment(eventDraft.end).toISOString());
    formData.append("remove_attachment", eventDraft.removeAttachment ? "1" : "0");
    if (eventDraft.attachmentFile) {
      formData.append("attachment", eventDraft.attachmentFile);
    }
    return formData;
  };

  const openCreateDialog = useCallback((date = selectedDate) => {
    const nextDraft = createDraftFromDate(date);
    setSelectedEvent(null);
    setDraft(nextDraft);
    setDialogMode("create");
    setOpen(true);
  }, [selectedDate]);

  const handleSelectSlot = ({ start, end, action }) => {
    const allDay = action === "select" && currentView === "month";
    const nextDraft = createDraftFromDate(start);
    nextDraft.start = start;
    nextDraft.end = allDay
      ? moment(end).subtract(1, "minute").toDate()
      : end;
    nextDraft.allDay = allDay;
    nextDraft.start = allDay ? moment(start).startOf("day").toDate() : start;
    nextDraft.end = allDay
      ? moment(nextDraft.end).endOf("day").toDate()
      : end;

    setSelectedDate(start);
    setCurrentDate(start);
    setSelectedEvent(null);
    setDraft(nextDraft);
    setDialogMode("create");
    setOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDraft({
      ...event,
      attachmentFile: null,
      removeAttachment: false,
    });
    setSelectedDate(event.start);
    setCurrentDate(event.start);
    setDialogMode("view");
    setOpen(true);
  };

  const handleDateChange = (value) => {
    if (!value) return;
    const nextDate = value.toDate();
    setSelectedDate(nextDate);
    setCurrentDate(nextDate);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setDraft(createDraftFromDate(selectedDate));
    setDialogMode("create");
  };

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateTimeChange = (field, value) => {
    if (!value) return;
    const nextValue = new Date(value);
    setDraft((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleAllDayToggle = (checked) => {
    setDraft((prev) => {
      if (checked) {
        return {
          ...prev,
          allDay: true,
          start: moment(prev.start).startOf("day").toDate(),
          end: moment(prev.end || prev.start).endOf("day").toDate(),
        };
      }

      const start = moment(prev.start).hour(9).minute(0).second(0).toDate();
      const end = moment(start).add(1, "hour").toDate();
      return { ...prev, allDay: false, start, end };
    });
  };

  const handleCategoryChange = (value) => {
    const matched = CATEGORY_OPTIONS.find((option) => option.value === value);
    setDraft((prev) => ({
      ...prev,
      category: value,
      color: matched?.color || prev.color,
    }));
  };

  const validateDraft = () => {
    if (!draft.title.trim()) return "Title is required.";
    if (moment(draft.end).isBefore(moment(draft.start))) {
      return "End schedule must be after the start schedule.";
    }
    return "";
  };

  const handleSave = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const formData = buildFormData(draft);
      let response;

      if (dialogMode === "edit" && draft.id) {
        formData.append("_method", "PUT");
        response = await axiosInstance.post(`calendar-events/${draft.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post("calendar-events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const savedEvent = parseApiEvent(response.data);
      setEvents((prev) => {
        const existing = prev.some((event) => event.id === savedEvent.id);
        if (existing) {
          return prev.map((event) => (event.id === savedEvent.id ? savedEvent : event));
        }
        return [...prev, savedEvent];
      });
      setCurrentDate(savedEvent.start);
      setSelectedDate(savedEvent.start);
      handleClose();
    } catch (saveError) {
      console.error("Error saving event:", saveError);
      setError(saveError.response?.data?.message || "Unable to save calendar event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) return;

    setSaving(true);
    setError("");
    try {
      await axiosInstance.delete(`calendar-events/${selectedEvent.id}`);
      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
      handleClose();
    } catch (deleteError) {
      console.error("Error deleting event:", deleteError);
      setError(deleteError.response?.data?.message || "Unable to delete calendar event.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPhilippineHolidays = async () => {
    const targetYear = moment(selectedDate || new Date()).year();
    setLoadingHolidays(true);
    setError("");
    try {
      const response = await axiosInstance.post(
        `calendar-events/presets/philippines/${targetYear}`
      );
      const holidayEvents = response.data.events.map(parseApiEvent);

      setEvents((prev) => {
        const nonHolidayForYear = prev.filter(
          (event) =>
            !(
              event.category === "Holiday" &&
              moment(event.start).year() === targetYear
            )
        );
        return [...nonHolidayForYear, ...holidayEvents].sort(
          (a, b) => a.start - b.start
        );
      });
    } catch (holidayError) {
      console.error("Error loading holidays:", holidayError);
      setError(
        holidayError.response?.data?.message ||
          "Unable to load Philippine holidays."
      );
    } finally {
      setLoadingHolidays(false);
    }
  };

  const eventPropGetter = (event) => ({
    style:
      event.category === "Holiday"
        ? {
            backgroundColor:
              event.holidayType === "regular"
                ? alpha("#2E7D32", 0.14)
                : alpha("#D32F2F", 0.12),
            color: event.holidayType === "regular" ? "#2E7D32" : "#D32F2F",
            border: `1px solid ${
              event.holidayType === "regular"
                ? alpha("#2E7D32", 0.35)
                : alpha("#D32F2F", 0.35)
            }`,
            borderRadius: "10px",
            paddingInline: 6,
            fontWeight: 800,
          }
        : {
            backgroundColor: alpha(event.color || DEFAULT_COLOR, 0.16),
            color: event.color || DEFAULT_COLOR,
            border: `1px solid ${alpha(event.color || DEFAULT_COLOR, 0.4)}`,
            borderRadius: "10px",
            paddingInline: 6,
            fontWeight: 700,
          },
  });

  const currentCategoryColor =
    CATEGORY_OPTIONS.find((option) => option.value === draft.category)?.color || draft.color;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${alpha(
          uiColors.navy,
          0.05
        )} 0%, ${uiColors.bg} 30%, #ffffff 100%)`,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
            boxShadow: "0 18px 45px rgba(15, 39, 71, 0.08)",
            position: { lg: "sticky" },
            top: 16,
          }}
        >
          <Box
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              color: "#fff",
              background: uiColors.cardGradients[0],
              boxShadow: "0 12px 30px rgba(15, 39, 71, 0.20)",
            }}
          >
            <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 700 }}>
              Planning
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              Treasury Calendar
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Schedule tasks, meetings, deadlines, and reminders with persistent
              calendar storage.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddTaskIcon />}
              onClick={() => openCreateDialog(selectedDate)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                py: 1.2,
                backgroundColor: uiColors.navy,
                "&:hover": { backgroundColor: uiColors.navyHover },
              }}
            >
              Add Event
            </Button>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentDate(today);
              }}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                color: uiColors.teal,
                borderColor: alpha(uiColors.teal, 0.35),
                backgroundColor: alpha(uiColors.teal, 0.06),
              }}
            >
              Jump To Today
            </Button>
            <Button
              variant="outlined"
              startIcon={
                loadingHolidays ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <FlagIcon />
                )
              }
              onClick={handleLoadPhilippineHolidays}
              disabled={loadingHolidays}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                color: "#D32F2F",
                borderColor: alpha("#D32F2F", 0.28),
                backgroundColor: alpha("#D32F2F", 0.04),
              }}
            >
              {loadingHolidays
                ? "Loading Holidays..."
                : `Load ${moment(selectedDate).year()} PH Holidays`}
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
              backgroundColor: "#fff",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateCalendar
                value={moment(selectedDate)}
                onChange={handleDateChange}
                sx={{ width: "100%" }}
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
              />
            </LocalizationProvider>
          </Paper>

          <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
                boxShadow: "0 8px 18px rgba(15,39,71,0.05)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: uiColors.steel }}>
                Selected Date
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy, mt: 0.4 }}>
                {moment(selectedDate).format("dddd, MMMM D, YYYY")}
              </Typography>
            </Card>

            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(uiColors.teal, 0.08)}`,
                boxShadow: "0 8px 18px rgba(15,39,71,0.05)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: uiColors.steel }}>
                Upcoming Events
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: uiColors.teal, mt: 0.5 }}>
                {upcomingEvents.length}
              </Typography>
            </Card>

            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha("#D32F2F", 0.12)}`,
                boxShadow: "0 8px 18px rgba(15,39,71,0.05)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: uiColors.steel }}>
                Holidays Loaded
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#D32F2F", mt: 0.5 }}>
                {holidayCount}
              </Typography>
            </Card>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: uiColors.navy, mb: 1.5 }}>
              Next Schedule
            </Typography>
            <Stack spacing={1.25}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(event.color || DEFAULT_COLOR, 0.08),
                      border: `1px solid ${alpha(event.color || DEFAULT_COLOR, 0.18)}`,
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelectEvent(event)}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: uiColors.navy }}>
                      {event.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: uiColors.steel }}>
                      {event.category === "Holiday"
                        ? `${moment(event.start).format("MMM D, YYYY")} • ${event.holidayType === "regular" ? "Regular Holiday" : "Special Holiday"}`
                        : moment(event.start).format("MMM D, YYYY • h:mm A")}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: uiColors.steel }}>
                  No upcoming events yet.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: `1px solid ${alpha(uiColors.navy, 0.08)}`,
            boxShadow: "0 18px 45px rgba(15, 39, 71, 0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: uiColors.navy }}>
                Event Calendar
              </Typography>
              <Typography variant="body2" sx={{ color: uiColors.steel, mt: 0.5 }}>
                Click a date to add an event, or open an existing event to edit details.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {CATEGORY_OPTIONS.map((category) => (
                <Chip
                  key={category.value}
                  label={category.label}
                  sx={{
                    backgroundColor: alpha(category.color, 0.1),
                    color: category.color,
                    border: `1px solid ${alpha(category.color, 0.2)}`,
                    fontWeight: 700,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              allDayAccessor="allDay"
              selectable
              popup
              views={["month", "week", "day", "agenda"]}
              date={currentDate}
              view={currentView}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
              components={{
                event: ({ event }) => (
                  <Tooltip
                    title={
                      event.category === "Holiday"
                        ? `${event.title} • ${
                            event.holidayType === "regular"
                              ? "Regular Holiday"
                              : "Special Holiday"
                          }`
                        : `${event.title} • ${moment(event.start).format("MMM D, h:mm A")}`
                    }
                  >
                    <span style={{ fontWeight: 700 }}>{event.title}</span>
                  </Tooltip>
                ),
              }}
              style={{ height: 760 }}
            />
          )}
        </Paper>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: uiColors.navy }}>
          {dialogMode === "view"
            ? "Event Details"
            : dialogMode === "edit"
              ? "Edit Event"
              : "Add Event"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            {dialogMode === "view" ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
                  {draft.title}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<CategoryIcon />} label={draft.category} />
                  {draft.category === "Holiday" && draft.holidayType && (
                    <Chip
                      icon={<FlagIcon />}
                      label={
                        draft.holidayType === "regular"
                          ? "Regular Holiday"
                          : "Special Holiday"
                      }
                    />
                  )}
                  <Chip
                    icon={<ScheduleIcon />}
                    label={
                      draft.allDay
                        ? `${moment(draft.start).format("MMM D")} (All Day)`
                        : `${moment(draft.start).format("MMM D, h:mm A")} - ${moment(
                            draft.end
                          ).format("MMM D, h:mm A")}`
                    }
                  />
                </Stack>
                <Typography variant="body1" sx={{ color: uiColors.steel }}>
                  {draft.description || "No description provided."}
                </Typography>
                {draft.isSystem && (
                  <Alert severity="info">
                    This is a preset system holiday. It is shown automatically on the calendar.
                  </Alert>
                )}
                {draft.attachmentUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<AttachmentIcon />}
                    component="a"
                    href={draft.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      alignSelf: "flex-start",
                      borderRadius: "10px",
                      textTransform: "none",
                    }}
                  >
                    {draft.attachmentName || "Open attachment"}
                  </Button>
                )}
                <Divider />
                <Typography variant="caption" sx={{ color: uiColors.steel }}>
                  Created: {draft.createdAt ? moment(draft.createdAt).format("MMM D, YYYY h:mm A") : "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: uiColors.steel }}>
                  Updated: {draft.updatedAt ? moment(draft.updatedAt).format("MMM D, YYYY h:mm A") : "N/A"}
                </Typography>
              </>
            ) : (
              <>
                <TextField
                  label="Title"
                  value={draft.title}
                  onChange={(e) => handleDraftChange("title", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={draft.description}
                  onChange={(e) => handleDraftChange("description", e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    label="Category"
                    value={draft.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    fullWidth
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Color"
                    type="color"
                    value={currentCategoryColor}
                    onChange={(e) => handleDraftChange("color", e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={draft.allDay}
                      onChange={(e) => handleAllDayToggle(e.target.checked)}
                    />
                  }
                  label="All day event"
                />

                {draft.allDay ? (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={toDateOnly(draft.start)}
                      onChange={(e) => {
                        const nextStart = moment(e.target.value).startOf("day").toDate();
                        setDraft((prev) => ({
                          ...prev,
                          start: nextStart,
                          end: moment(prev.end || nextStart).isBefore(nextStart)
                            ? moment(nextStart).endOf("day").toDate()
                            : moment(prev.end).endOf("day").toDate(),
                        }));
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={toDateOnly(draft.end)}
                      onChange={(e) => {
                        const nextEnd = moment(e.target.value).endOf("day").toDate();
                        handleDraftChange("end", nextEnd);
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                ) : (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Start Schedule"
                      type="datetime-local"
                      value={toDateTimeLocal(draft.start)}
                      onChange={(e) => handleDateTimeChange("start", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="End Schedule"
                      type="datetime-local"
                      value={toDateTimeLocal(draft.end)}
                      onChange={(e) => handleDateTimeChange("end", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                )}

                <TextField
                  type="file"
                  label="Attachment"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
                  }}
                  onChange={(e) =>
                    handleDraftChange("attachmentFile", e.target.files?.[0] || null)
                  }
                  fullWidth
                />

                {(draft.attachmentName || draft.attachmentUrl) && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                    <Chip
                      icon={<AttachmentIcon />}
                      label={draft.attachmentFile?.name || draft.attachmentName}
                      sx={{ maxWidth: "100%" }}
                    />
                    {!draft.attachmentFile && draft.attachmentUrl && (
                      <Button
                        component="a"
                        href={draft.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        Open current attachment
                      </Button>
                    )}
                    <Button
                      color="error"
                      size="small"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          attachmentFile: null,
                          attachmentName: "",
                          attachmentUrl: "",
                          removeAttachment: true,
                        }))
                      }
                      sx={{ textTransform: "none" }}
                    >
                      Remove attachment
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            {dialogMode === "view" ? "Close" : "Cancel"}
          </Button>
          {dialogMode === "view" ? (
            <>
              <Button
                onClick={() => setDialogMode("edit")}
                startIcon={<EditOutlinedIcon />}
                disabled={draft.isSystem}
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
              <Button
                color="error"
                onClick={handleDelete}
                startIcon={<DeleteOutlineIcon />}
                disabled={saving || draft.isSystem}
                sx={{ textTransform: "none" }}
              >
                Delete
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={18} color="inherit" /> : <EventAvailableIcon />
              }
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                backgroundColor: uiColors.navy,
                "&:hover": { backgroundColor: uiColors.navyHover },
              }}
            >
              {saving ? "Saving..." : dialogMode === "edit" ? "Update Event" : "Save Event"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCalendar;
