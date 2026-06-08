# Mobile Device Development Constitution for AI Coding Agents

**Purpose:** This document is a strict guide for building exam-ready mobile applications that behave logically, handle errors professionally, validate user input, and simulate real-life usage even when there is no backend.

**Scope:** Mobile app only. No backend implementation is required. The app may use mock data, local storage, in-memory data, or local database storage depending on the exam instructions.

---

## 1. Core Rule

The mobile app must not only look good. It must behave like a real system.

Every screen, button, form, and action must answer these questions:

1. Can a real user understand what to do?
2. Can the user make a mistake safely?
3. Does the app prevent impossible actions?
4. Does the app show clear feedback after every action?
5. Does the app handle empty, loading, success, and error states?
6. Does the app preserve important data when the user navigates away?
7. Does the app work on different screen sizes?

If the answer is no, the feature is incomplete.

---

## 2. Mobile-Only Architecture Rules

Even without a backend, the app must be structured professionally.

Recommended structure:

```text
lib/
  main.dart / MainActivity / App.js
  core/
    constants/
    theme/
    validators/
    utils/
    mock_data/
    local_storage/
  models/
  screens/
  widgets/
  services/
  controllers/ or providers/ or viewmodels/
  routes/
```

Rules:

- Do not put all logic directly inside UI screens.
- Keep validation logic in separate validator files where possible.
- Keep reusable UI components in a widgets/components folder.
- Keep mock data in a dedicated file, not scattered everywhere.
- Keep route names centralized.
- Keep colors, spacing, and text styles centralized.
- Avoid hardcoded repeated values.
- Use meaningful names for files, classes, variables, and functions.

Bad example:

```text
Button1, Text1, screen2, dataList, temp, abc
```

Good example:

```text
LoginScreen, CustomerDashboardScreen, validatePhoneNumber(), pendingRequests
```

---

## 3. UI/UX Standards

### 3.1 General UI Rules

Every screen must have:

- Clear title.
- Clear main action.
- Consistent spacing.
- Consistent colors.
- Consistent typography.
- Back navigation where needed.
- No overcrowded layouts.
- No unclear icons without labels unless very obvious.
- No hidden important actions.

The user should know:

- Where they are.
- What they can do.
- What will happen after pressing a button.
- Whether an action succeeded or failed.

### 3.2 Mobile Layout Rules

The app must respect mobile screen behavior:

- Avoid text overflow.
- Avoid buttons going outside the screen.
- Use scroll views for long pages.
- Avoid tiny touch targets.
- Keep important buttons easy to reach.
- Use responsive layout where possible.
- Test both small and large phone screens.
- Avoid placing important content behind the keyboard.
- Forms must scroll when the keyboard opens.

### 3.3 Touch Target Rules

- Buttons must be large enough to tap easily.
- Avoid placing two dangerous actions close together.
- Use enough spacing between buttons.
- Do not use small icons as the only way to perform critical actions.

Bad:

```text
Delete icon next to Edit icon with no confirmation.
```

Good:

```text
Delete button opens a confirmation dialog explaining the consequence.
```

---

## 4. Navigation Rules

Navigation must be logical and realistic.

Rules:

- Login should not return to onboarding after successful login unless user logs out.
- Logout should clear the session and return to login screen.
- Back button should not expose protected screens after logout.
- Bottom navigation should only be used for main sections.
- Do not use too many nested screens unnecessarily.
- Use clear screen names.
- After creating something, navigate to a logical place such as detail page or list page.
- After updating something, show success feedback and display updated data.
- After deleting something, remove it from the list immediately.

Example:

```text
Login -> Dashboard -> Request Form -> Request Details -> Back to My Requests
```

Not logical:

```text
Login -> Settings -> Unknown Page -> Dashboard randomly
```

---

## 5. Authentication Simulation Rules

Even without backend, authentication must behave realistically.

### 5.1 Login

Login screen must validate:

- Email or username is required.
- Password is required.
- Password minimum length should be checked.
- Invalid credentials should show a clear error.
- Login button should show loading state briefly if simulation is used.
- User should not access protected screens before login.

Example error messages:

```text
Email is required.
Enter a valid email address.
Password is required.
Password must be at least 6 characters.
Invalid email or password.
```

### 5.2 Signup

Signup must validate:

- Full name is required.
- Email is required and valid.
- Phone number is required where relevant.
- Password is required.
- Confirm password must match password.
- Terms checkbox should be required if included.
- Duplicate mock email should not be accepted if mock users exist.

Do not allow role selection on public signup unless the scenario clearly allows it.

Realistic rule:

- Public signup creates a normal user/customer account.
- Admin/operator/inspector/finance roles should be pre-created in mock data or assigned inside the app by an admin screen if required by the scenario.

### 5.3 Logout

Logout must:

- Ask confirmation when appropriate.
- Clear local session.
- Navigate to login.
- Prevent back navigation into protected pages.

Confirmation text example:

```text
Are you sure you want to log out?
```

---

## 6. Form Validation Constitution

Every form must validate before submission.

### 6.1 Required Fields

All important fields must be checked.

Example:

```text
Full name cannot be empty.
Phone number is required.
Date is required.
Description is required.
```

### 6.2 Email Validation

Email must:

- Not be empty.
- Contain `@`.
- Contain a valid domain format.

Bad accepted email:

```text
lucky@com
luckygmail.com
```

Good accepted email:

```text
lucky@example.com
```

### 6.3 Phone Number Validation

Phone number must:

- Not be empty when required.
- Contain digits only, except optional `+` at the beginning.
- Follow expected length for the scenario.

For Rwanda-style numbers, accept examples such as:

```text
0781234567
+250781234567
```

Reject:

```text
07812abc67
123
```

### 6.4 Password Validation

Minimum password rules for exam apps:

- At least 6 characters.
- Confirm password must match.
- Do not show password by default.
- Provide show/hide password icon.

Better rule if app is security-focused:

- At least 8 characters.
- Include a number.
- Include a letter.

### 6.5 Number Validation

For quantity, amount, age, price, meter readings, stock, duration, or score:

- Must not be empty.
- Must be numeric.
- Must not be negative unless scenario allows it.
- Must not be zero when zero makes no sense.
- Must not exceed realistic limits.

Examples:

```text
Quantity must be greater than 0.
Amount cannot be negative.
Meter reading cannot be lower than previous reading.
Parking duration must be at least 1 hour.
```

### 6.6 Date Validation

Dates must be logical.

Rules:

- Birth date cannot be in the future.
- Appointment date cannot be in the past unless recording history.
- Expiry date must be after issue/created date.
- End date must be after start date.
- Inspection date must not be before installation date.
- Due date must not be before bill date.

Example errors:

```text
Expiry date must be after the installation date.
End date must be after start date.
You cannot schedule an inspection in the past.
```

### 6.7 Dropdown Validation

Dropdown fields must:

- Have a default hint such as `Select category`.
- Not submit while still on default placeholder.
- Use realistic options.
- Avoid irrelevant choices.

Bad:

```text
Category: Option 1, Option 2, Option 3
```

Good:

```text
Category: Fire Safety, Electrical, Plumbing, Cleaning
```

### 6.8 Text Area Validation

Description/comment fields must:

- Have minimum length if needed.
- Have maximum length to avoid unrealistic long text.
- Not accept only spaces.

Example:

```text
Description must be at least 10 characters.
Description cannot exceed 500 characters.
```

---

## 7. Error Handling Rules

Every action must handle failure states, even when using mock data.

### 7.1 Types of Errors to Handle

The app must handle:

- Empty form errors.
- Invalid input errors.
- Duplicate record errors.
- Not found errors.
- Unauthorized access simulation.
- Network unavailable simulation if app pretends to sync.
- Local storage failure where possible.
- Permission denied errors.
- Camera/location/file access errors if used.

### 7.2 Error Message Rules

Error messages must be:

- Clear.
- Human-friendly.
- Specific.
- Placed near the problem when possible.
- Not technical unless the app is for developers.

Bad:

```text
Error 400
Exception: null object reference
Failed
```

Good:

```text
Please enter a valid phone number.
No customer was found with this ID.
You must select a date before submitting.
```

### 7.3 Snackbar/Dialog Rules

Use:

- Inline validation for form fields.
- Snackbar/toast for quick success or simple errors.
- Dialog for critical decisions.
- Full error screen for failed loading of important data.

Examples:

```text
Request submitted successfully.
Profile updated successfully.
Unable to load records. Try again.
```

---

## 8. Loading, Empty, Success, and Error States

Every list-based or data-based screen must support four states.

### 8.1 Loading State

Use when data is being fetched from mock/local source or when simulating network.

Examples:

```text
Loading requests...
Loading dashboard...
```

### 8.2 Empty State

Use when there is no data.

Examples:

```text
No requests yet.
No inspections scheduled.
No bills available.
```

Add a useful action where possible:

```text
Create your first request
Schedule inspection
Add new record
```

### 8.3 Success State

After a successful operation:

- Show success message.
- Update UI immediately.
- Navigate logically.
- Do not leave stale data on screen.

### 8.4 Error State

When data cannot load:

- Explain what went wrong.
- Provide retry option where possible.
- Avoid blank screens.

---

## 9. Confirmation Rules for Critical Actions

Critical actions must require confirmation.

Examples of critical actions:

- Delete account.
- Delete record.
- Cancel booking.
- Submit final report.
- Mark bill as paid.
- Mark inspection as completed.
- Approve or reject request.
- Logout in sensitive apps.

Confirmation dialog must include:

- Clear title.
- Clear consequence.
- Cancel button.
- Confirm button.

Example:

```text
Title: Delete Request?
Message: This request will be permanently removed from your list. This action cannot be undone.
Buttons: Cancel | Delete
```

For destructive actions, use labels like:

```text
Delete
Cancel Request
Reject
Remove
```

Avoid vague labels like:

```text
Yes
No
OK
```

---

## 10. Real-Life Business Logic Rules

The app must prevent impossible workflows.

### 10.1 Status Flow Rules

Use clear statuses and do not allow invalid jumps.

Example request flow:

```text
Pending -> Approved -> Completed
Pending -> Rejected
Approved -> Cancelled
```

Invalid:

```text
Rejected -> Completed
Completed -> Pending
Cancelled -> Approved
```

### 10.2 Role-Based UI Rules

If the app has roles, each role must see only relevant screens.

Example:

```text
Customer: view own records, create request, update profile
Admin: manage users, approve requests, view reports
Operator: handle assigned tasks, update status
Inspector: view assigned inspections, submit inspection report
Finance: view bills, confirm payments
```

Rules:

- Do not show admin buttons to normal users.
- Do not allow customer to approve their own request.
- Do not allow finance actions in customer screens.
- If using mock login, route users based on mock role.

### 10.3 Ownership Rules

Users should only see their own data unless their role allows otherwise.

Example:

```text
Customer A must not see Customer B's requests.
```

Even without backend, mock data should simulate ownership using `userId`.

### 10.4 Duplicate Prevention

The app must prevent duplicates where duplicates do not make sense.

Examples:

- Same email should not register twice.
- Same national ID should not be used twice.
- Same serial number should not be added twice.
- Same appointment should not be booked twice for the same time slot.
- Same bill should not be paid twice.

### 10.5 Record Update Rules

When editing data:

- Pre-fill existing values.
- Validate again before saving.
- Show success message.
- Show the updated value immediately.
- Do not erase fields accidentally.

### 10.6 Delete Rules

When deleting:

- Ask confirmation.
- Explain consequence.
- Remove from UI immediately after success.
- Do not allow deleting records that should be preserved in real life unless scenario allows archive.

Better real-life approach:

```text
Archive, deactivate, cancel, or mark inactive instead of permanent delete.
```

---

## 11. Offline and Local Storage Rules

Since there is no backend, the app should use one of these approaches:

1. In-memory mock data for simple exams.
2. Local storage/shared preferences for login/session/simple data.
3. Local database such as SQLite/Hive/Room for more advanced apps.

Rules:

- Do not lose important mock records immediately after screen navigation.
- Persist login state if required.
- Save created records locally if the app expects them to remain after restart.
- Handle empty local storage gracefully.
- Provide default seed data for demo users and records.

Example seed users:

```text
admin@example.com / password123
customer@example.com / password123
operator@example.com / password123
```

Never show real passwords in production-like UI. For exam demo data, document them in comments or a README only if needed.

---

## 12. Device Feature Rules

If the app uses device features, handle permissions properly.

### 12.1 Camera

If using camera:

- Ask permission.
- Handle permission denied.
- Show preview or selected image.
- Allow retake/change image.
- Validate that image is selected before submitting.

### 12.2 Location

If using location:

- Ask permission.
- Explain why location is needed.
- Handle denied permission.
- Handle disabled GPS.
- Provide manual location entry fallback if possible.

### 12.3 Files or Images

If uploading/selecting files:

- Validate file selected.
- Show file name or preview.
- Allow remove/change file.
- Restrict file type if relevant.

### 12.4 Notifications

If simulating notifications:

- Use realistic notification messages.
- Do not spam notifications.
- Store notification history if the app has notification screen.
- Mark notifications as read/unread.

---

## 13. Accessibility Rules

The app should be usable by different users.

Rules:

- Text must be readable.
- Avoid low contrast.
- Do not rely only on color to show status.
- Use labels with icons.
- Buttons must have clear text.
- Inputs must have labels or hints.
- Error messages must be visible.
- Avoid very small fonts.

Bad:

```text
Red dot only means rejected.
```

Good:

```text
Rejected badge with red color and text label.
```

---

## 14. Dashboard Rules

Dashboards must show useful summaries, not random cards.

Good dashboard cards:

- Total requests.
- Pending requests.
- Approved items.
- Upcoming appointments.
- Unread notifications.
- Recent activity.
- Payment status.
- Assigned tasks.

Dashboard must not show actions the role cannot perform.

Example:

```text
Customer dashboard:
- My active requests
- My approved services
- Upcoming appointments
- Notifications
- Create new request button
```

```text
Admin dashboard:
- Total users
- Pending approvals
- Active records
- Recent system activity
```

---

## 15. List Screen Rules

Every list screen must include:

- Title.
- Search if list can grow large.
- Filter by status if relevant.
- Empty state.
- Loading state.
- Error state.
- Clear item cards.
- Tap item to view details.

List item should show:

- Main name/title.
- Status badge.
- Important date.
- Short description or category.
- Relevant action button if needed.

Avoid showing too much information on one card.

---

## 16. Detail Screen Rules

Every important item should have a detail screen.

Detail screen should show:

- Full information.
- Status.
- Created date.
- Updated date if relevant.
- Owner/user if role allows.
- Available actions based on status and role.

Actions must be disabled or hidden when not allowed.

Example:

```text
Pending request: Edit, Cancel
Approved request: View details, Schedule appointment
Completed request: View report
Rejected request: View rejection reason
```

---

## 17. Search and Filter Rules

Search and filter must behave clearly.

Rules:

- Search should update list results.
- Show empty state when no result is found.
- Provide clear filter labels.
- Allow clearing search/filter.
- Avoid filters that do nothing.

Example empty search result:

```text
No records found for "Kigali".
```

---

## 18. Status Badge Rules

Use status badges for clarity.

Common statuses:

```text
Pending
Approved
Rejected
Completed
Cancelled
Active
Inactive
Overdue
Paid
Unpaid
Expired
Scheduled
In Progress
```

Rules:

- Status names must be consistent everywhere.
- Do not use different names for the same meaning.
- Example: do not use `Pending`, `Waiting`, and `In Review` randomly for the same status.

---

## 19. Notification Rules

If the app includes notifications:

Notification item should have:

- Title.
- Message.
- Date/time.
- Read/unread status.
- Related action if useful.

Examples:

```text
Your request has been approved.
Your appointment is scheduled for 12 June 2026.
Your payment is still pending.
```

Rules:

- Notifications must match real actions in the app.
- Do not show fake unrelated notifications.
- Mark as read when opened.
- Provide empty state if no notifications.

---

## 20. Profile and Settings Rules

Profile screen should include relevant user information:

- Full name.
- Email.
- Phone number.
- Role if relevant.
- Address if relevant.
- Edit profile button.
- Logout button.

Edit profile must:

- Pre-fill current info.
- Validate input.
- Prevent duplicate email/phone if mock data supports it.
- Show success message.

Settings may include:

- Theme mode.
- Notification preferences.
- Language if relevant.
- Help/about section.

Do not build useless settings that do nothing unless clearly marked as demo.

---

## 21. Security Simulation Rules

Even without backend, simulate safe behavior.

Rules:

- Do not store password visibly in UI.
- Do not print sensitive data in screens.
- Do not allow access to protected pages without login.
- Clear session on logout.
- Hide admin screens from non-admin users.
- Do not allow role selection during normal signup unless scenario requires it.
- Do not expose all mock user data to normal users.

---

## 22. Data Model Rules

Every model should have realistic fields.

Common base fields:

```text
id
createdAt
updatedAt
status
userId / ownerId
```

Example user model:

```text
id
fullName
email
phoneNumber
role
status
createdAt
```

Example request model:

```text
id
requestNumber
title
description
category
status
createdByUserId
createdAt
updatedAt
```

Do not use only name and description for everything if the scenario needs more fields.

---

## 23. Mock Data Rules

Mock data must be realistic.

Rules:

- Use real-looking names.
- Use realistic phone numbers.
- Use realistic dates.
- Use realistic statuses.
- Include at least one empty-state possibility.
- Include different statuses to demonstrate UI logic.
- Include different roles if app is role-based.

Bad mock data:

```text
Test 1
Test 2
abc
Lorem ipsum everywhere
```

Good mock data:

```text
Jean Mugisha
0781234567
Pending inspection
Scheduled for 12 June 2026
```

---

## 24. Button Rules

Every button must have a clear purpose.

Rules:

- Disable submit button while form is invalid or loading if possible.
- Show loading indicator during submission.
- Avoid duplicate submissions.
- Use clear labels.
- Dangerous buttons must look different and require confirmation.

Good labels:

```text
Submit Request
Save Changes
Schedule Inspection
Cancel Booking
Approve Request
Reject Request
```

Bad labels:

```text
Click
OK
Go
Submit Everything
```

---

## 25. Prevent Double Submission

The app must not create duplicate records when the user taps submit many times.

Rules:

- Disable button while submitting.
- Show loading state.
- After success, clear form or navigate away.
- Check duplicates before adding records.

Example:

```text
If user taps Submit Request three times, only one request should be created.
```

---

## 26. Time and Date Display Rules

Dates must be displayed clearly.

Good:

```text
12 June 2026
12 Jun 2026, 09:30 AM
```

Avoid unclear formats:

```text
06/12/26
```

Rules:

- Use consistent date format.
- Show time where appointment/scheduling matters.
- Do not show raw timestamp strings directly.

---

## 27. Reports and Summaries

If the app has reports:

- Use simple charts/cards if possible.
- Show totals clearly.
- Allow filtering by status/date if needed.
- Make sure numbers match the actual mock data.

Bad:

```text
Dashboard says 10 pending, list has 2 pending.
```

Good:

```text
Dashboard counts are calculated from the same data source used by the list.
```

---

## 28. Exam-Ready Feature Checklist

Before finalizing the app, verify:

- App launches without crashing.
- Login works.
- Signup works if included.
- Logout works.
- Navigation is logical.
- Forms validate correctly.
- Empty fields show errors.
- Invalid email/phone/date/number shows errors.
- Buttons do not duplicate records.
- Lists show data.
- Empty lists show empty state.
- Detail screens show correct data.
- Update actions reflect immediately.
- Delete/cancel actions require confirmation.
- Role-based screens are respected.
- User cannot access unauthorized screens.
- App handles keyboard correctly.
- App works on small screens.
- No text overflow.
- No fake buttons that do nothing.
- No irrelevant screens.
- No placeholder lorem ipsum in final version.
- No debug text visible to users.
- No unnecessary backend/API code.

---

## 29. Common Mistakes to Avoid

Avoid these mistakes:

- Building beautiful screens with no logic.
- Allowing empty form submission.
- Allowing negative amounts or quantities.
- Allowing impossible dates.
- Allowing duplicate users or records.
- Showing admin actions to normal users.
- Forgetting empty states.
- Forgetting loading states.
- Using buttons that do nothing.
- Not confirming delete/cancel actions.
- Losing created records after navigating back.
- Making the app crash when data is missing.
- Putting too much information on one screen.
- Using unclear status names.
- Using inconsistent colors and fonts.
- Not handling keyboard overflow.
- Not testing with different mock users.

---

## 30. AI Agent Instructions

When building the mobile app, the AI coding agent must:

1. Read the scenario carefully.
2. Identify all actors/roles.
3. Identify all main workflows.
4. Create realistic mock data.
5. Create models before screens.
6. Create validation helpers before forms.
7. Create reusable widgets/components.
8. Implement navigation correctly.
9. Implement form validation.
10. Implement loading, empty, success, and error states.
11. Implement confirmation dialogs for critical actions.
12. Implement role-based UI if roles exist.
13. Prevent impossible real-life actions.
14. Test the app manually using different user flows.
15. Remove unused code and placeholder text before final submission.

The app is not complete until it behaves logically, not just visually.

---

## 31. Final Quality Standard

A good exam mobile app should feel like a simplified real product.

It should allow the examiner to say:

```text
This student understood the real-life process, not only the coding syntax.
```

The mobile app must be clean, logical, validated, safe, and easy to use.
