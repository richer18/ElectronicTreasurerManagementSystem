<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CalendarEventController extends Controller
{
    private const HOLIDAY_COLORS = [
        'regular' => '#2E7D32',
        'special_non_working' => '#D32F2F',
        'special_working' => '#ED6C02',
    ];

    public function index()
    {
        $events = CalendarEvent::orderBy('start_at')->get()->map(function (CalendarEvent $event) {
            return $this->transformEvent($event);
        });

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        $event = new CalendarEvent();
        $this->fillEvent($event, $validated, $request);
        $event->save();

        return response()->json($this->transformEvent($event), 201);
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        $validated = $this->validatePayload($request);
        $this->fillEvent($calendarEvent, $validated, $request);
        $calendarEvent->save();

        return response()->json($this->transformEvent($calendarEvent));
    }

    public function destroy(CalendarEvent $calendarEvent)
    {
        $this->deleteAttachmentIfPresent($calendarEvent);
        $calendarEvent->delete();

        return response()->json(['message' => 'Calendar event deleted successfully']);
    }

    public function attachment(CalendarEvent $calendarEvent)
    {
        if (!$calendarEvent->attachment_path || !Storage::disk('local')->exists($calendarEvent->attachment_path)) {
            abort(404, 'Attachment not found.');
        }

        return Storage::disk('local')->download(
            $calendarEvent->attachment_path,
            $calendarEvent->attachment_name ?? basename($calendarEvent->attachment_path)
        );
    }

    public function loadPhilippineHolidays(int $year)
    {
        $holidays = $this->philippineHolidayPreset($year);
        $created = 0;
        $updated = 0;

        foreach ($holidays as $holiday) {
            $start = "{$holiday['date']} 00:00:00";
            $end = "{$holiday['date']} 23:59:59";

            $event = CalendarEvent::where('category', 'Holiday')
                ->where('title', $holiday['title'])
                ->whereDate('start_at', $holiday['date'])
                ->first();

            if ($event) {
                $updated++;
            } else {
                $event = new CalendarEvent();
                $created++;
            }

            $event->title = $holiday['title'];
            $event->description = $holiday['description'];
            $event->start_at = $start;
            $event->end_at = $end;
            $event->all_day = true;
            $event->is_system = true;
            $event->category = 'Holiday';
            $event->holiday_type = $holiday['holiday_type'];
            $event->color = self::HOLIDAY_COLORS[$holiday['holiday_type']] ?? '#2E7D32';
            $event->attachment_path = null;
            $event->attachment_name = null;
            $event->attachment_mime = null;
            $event->save();
        }

        return response()->json([
            'message' => "Philippine holidays for {$year} loaded.",
            'created' => $created,
            'updated' => $updated,
            'events' => CalendarEvent::where('category', 'Holiday')
                ->whereYear('start_at', $year)
                ->orderBy('start_at')
                ->get()
                ->map(fn (CalendarEvent $event) => $this->transformEvent($event)),
        ]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after_or_equal:start_at'],
            'all_day' => ['nullable', 'boolean'],
            'category' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:20'],
            'attachment' => ['nullable', 'file', 'max:5120'],
            'remove_attachment' => ['nullable', 'boolean'],
        ]);
    }

    private function fillEvent(CalendarEvent $event, array $validated, Request $request): void
    {
        $event->title = $validated['title'];
        $event->description = $validated['description'] ?? null;
        $event->start_at = $validated['start_at'];
        $event->end_at = $validated['end_at'];
        $event->all_day = (bool) ($validated['all_day'] ?? false);
        $event->is_system = $event->is_system ?? false;
        $event->category = $validated['category'] ?? 'Task';
        $event->holiday_type = $event->category === 'Holiday'
            ? ($event->holiday_type ?? 'regular')
            : null;
        $event->color = $validated['color'] ?? '#2196F3';

        if (($validated['remove_attachment'] ?? false) === true) {
            $this->deleteAttachmentIfPresent($event);
            $event->attachment_path = null;
            $event->attachment_name = null;
            $event->attachment_mime = null;
        }

        if ($request->hasFile('attachment')) {
            $this->deleteAttachmentIfPresent($event);
            $file = $request->file('attachment');
            $path = $file->store('calendar-attachments');
            $event->attachment_path = $path;
            $event->attachment_name = $file->getClientOriginalName();
            $event->attachment_mime = $file->getClientMimeType();
        }
    }

    private function deleteAttachmentIfPresent(CalendarEvent $event): void
    {
        if ($event->attachment_path && Storage::disk('local')->exists($event->attachment_path)) {
            Storage::disk('local')->delete($event->attachment_path);
        }
    }

    private function transformEvent(CalendarEvent $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'start' => optional($event->start_at)->toIso8601String(),
            'end' => optional($event->end_at)->toIso8601String(),
            'allDay' => $event->all_day,
            'isSystem' => $event->is_system,
            'category' => $event->category,
            'holidayType' => $event->holiday_type,
            'color' => $event->color,
            'attachmentName' => $event->attachment_name,
            'attachmentMime' => $event->attachment_mime,
            'hasAttachment' => !empty($event->attachment_path),
            'attachmentUrl' => $event->attachment_path
                ? url("/api/calendar-events/{$event->id}/attachment")
                : null,
            'createdAt' => optional($event->created_at)->toIso8601String(),
            'updatedAt' => optional($event->updated_at)->toIso8601String(),
        ];
    }

    private function philippineHolidayPreset(int $year): array
    {
        if ($year !== 2026) {
            return [];
        }

        return [
            [
                'date' => '2026-01-01',
                'title' => "New Year's Day",
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-02-17',
                'title' => 'Chinese New Year',
                'holiday_type' => 'special_non_working',
                'description' => 'Additional special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-02-25',
                'title' => 'EDSA People Power Revolution Anniversary',
                'holiday_type' => 'special_working',
                'description' => 'Special working day in the Philippines.',
            ],
            [
                'date' => '2026-04-02',
                'title' => 'Maundy Thursday',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-04-03',
                'title' => 'Good Friday',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-04-04',
                'title' => 'Black Saturday',
                'holiday_type' => 'special_non_working',
                'description' => 'Special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-04-09',
                'title' => 'Araw ng Kagitingan',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-05-01',
                'title' => 'Labor Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-06-12',
                'title' => 'Independence Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-08-21',
                'title' => 'Ninoy Aquino Day',
                'holiday_type' => 'special_non_working',
                'description' => 'Special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-08-31',
                'title' => 'National Heroes Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-11-01',
                'title' => "All Saints' Day",
                'holiday_type' => 'special_non_working',
                'description' => 'Special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-11-02',
                'title' => 'Additional Special Non-Working Day',
                'holiday_type' => 'special_non_working',
                'description' => 'Additional special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-11-30',
                'title' => 'Bonifacio Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-12-08',
                'title' => 'Feast of the Immaculate Conception of Mary',
                'holiday_type' => 'special_non_working',
                'description' => 'Special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-12-24',
                'title' => 'Christmas Eve',
                'holiday_type' => 'special_non_working',
                'description' => 'Additional special non-working day in the Philippines.',
            ],
            [
                'date' => '2026-12-25',
                'title' => 'Christmas Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-12-30',
                'title' => 'Rizal Day',
                'holiday_type' => 'regular',
                'description' => 'Regular holiday in the Philippines.',
            ],
            [
                'date' => '2026-12-31',
                'title' => 'Last Day of the Year',
                'holiday_type' => 'special_non_working',
                'description' => 'Additional special non-working day in the Philippines.',
            ],
        ];
    }
}
