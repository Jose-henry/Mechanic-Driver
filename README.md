# Mechanic Driver - Database Operations Manual

This guide explains how to manually manage the app's data for real-time updates.

## 🚨 Critical Rules (Read First)
1.  **Strict Status List**: Only use these exact statuses for requests:
    *   `pending` (User Waiting)
    *   `accepted` (Mechanic Assigned)
    *   `en_route` (Driver Driving)
    *   `arrived` (Driver at Location)
    *   `diagnosing` (Inspecting Vehicle)
    *   `quote_ready` (Quote Sent to User)
    *   `maintenance_in_progress` (Fixing Car)
    *   `completed` (Done)

2.  **Hard Delete**: The app treats cancelled requests as "deleted". To cancel a request manually, **delete the row** from the database.

---

## 🆕 Scenario 0: Manually Creating a Request

**When to do this:** For testing purposes or if you need to bypass the app UI.

**SQL Command:**
```sql
INSERT INTO requests (
  user_id, 
  brand, 
  model, 
  year, 
  pickup_date, 
  pickup_time, 
  pickup_location, 
  issue_description, 
  status,
  is_towing,
  is_car_wash
) VALUES (
  'USER_UUID_HERE', 
  'Toyota', 
  'Camry', 
  2018, 
  '2024-03-20', 
  '09:00', 
  'Lagos, Nigeria', 
  'Engine makes a rattling noise', 
  'pending',
  false,
  false
);
```

---

## 🏗️ Scenario 1: Assigning a Driver

**When to do this:** A user has created a request (`pending`), and you have found a driver.

**What needs to change:**
1.  In `requests` table: Change `status` to `accepted`.
2.  In `requests` table: Add the Driver's ID to `mechanic_driver_id`.

**SQL Command:**
```sql
UPDATE requests 
SET 
  status = 'accepted', 
  mechanic_driver_id = 'DRIVER_UUID_HERE' -- Copy ID from drivers table
WHERE id = 'REQUEST_UUID_HERE';
```

---

## 🚚 Scenario 2: Tracking Updates (The Drive)

**When to do this:** As the driver moves towards the user.

**Sequence:**
1.  **Driver Moving to User:** Status stays `accepted`. The app shows "Arriving by [Time]".
2.  **Driver Picked Up Car:** Change status to `en_route` (Meaning: Driving TO Workshop).
3.  **Driver Reached Workshop:** Change status to `arrived` (Meaning: Arrived AT Workshop).
4.  **Mechanic Starts Inspection:** Change status to `diagnosing`.

**SQL Command:**
```sql
UPDATE requests SET status = 'en_route' WHERE id = 'REQUEST_UUID_HERE';
-- OR
UPDATE requests SET status = 'arrived' WHERE id = 'REQUEST_UUID_HERE';
-- OR
UPDATE requests SET status = 'diagnosing' WHERE id = 'REQUEST_UUID_HERE';
```

---

## 💰 Scenario 3: Creating a Quote

**When to do this:** The driver has inspected the car (`diagnosing`), and you know the cost.

**What needs to change:**
1.  **Create a Quote:** Insert a new row in the `quotes` table linked to the request.
2.  **Update Request:** Change request `status` to `quote_ready` to show the "Pay Now" card.

**Step 1: Create Quote (SQL)**
```sql
INSERT INTO quotes (request_id, amount, status, breakdown)
VALUES (
  'REQUEST_UUID_HERE', 
  75000,                -- Total Amount
  'pending',            -- Always start as 'pending'
  '{"Labor": 25000, "Parts": 50000}'::jsonb -- Detailed Breakdown
);
```

**Step 2: Trigger UI (SQL)**
```sql
UPDATE requests SET status = 'quote_ready' WHERE id = 'REQUEST_UUID_HERE';
```

---

## ✅ Scenario 4: User Pays (Confirming Payment)

**When to do this:** The user clicked "I've Sent the Money" (App sets `payment_status` to `verifying`), and you have received the funds.

**What needs to change:**
1.  In `requests` table: Set `payment_status` to `paid`.
2.  In `requests` table: Set `status` to `maintenance_in_progress` (Start work).

**SQL Command:**
```sql
UPDATE requests 
SET 
  payment_status = 'paid', 
  status = 'maintenance_in_progress'
WHERE id = 'REQUEST_UUID_HERE';
```

---

## 🏁 Scenario 5: Job Done

**When to do this:** The mechanic has finished all repairs.

**What needs to change:**
1.  In `requests` table: Set `status` to `completed`.
2.  (Optional) Ensure `payment_status` is `paid`.

**SQL Command:**
```sql
UPDATE requests 
SET status = 'completed'
WHERE id = 'REQUEST_UUID_HERE';
```

---

## 🗑️ Scenario 6: Cancelling a Request

**When to do this:** User or Admin wants to cancel (before maintenance starts).

**What needs to change:**
1.  **Strict Rule:** Do not use a "cancelled" status.
2.  **Action:** Delete the row entirely.

**SQL Command:**
```sql
DELETE FROM requests WHERE id = 'REQUEST_UUID_HERE';
```
