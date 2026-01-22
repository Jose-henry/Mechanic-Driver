# Mechanic Driver - Admin Dashboard Manual

This guide explains how to manage requests, drivers, and quotes using the **Admin Dashboard**.
  
**Access:** Restricted to whitelisted email addresses only.

## 🚨 Critical Rules
1.  **Status Flow**: Follow the natural progression of a request:
    *   `pending` (User Waiting)
    *   `accepted` (Mechanic Assigned)
    *   `en_route` (Driver Driving to Garage)
    *   `arrived` (Car At Garage)
    *   `diagnosing` (Inspecting Vehicle)
    *   `quote_ready` (Quote Sent to User)
    *   `maintenance_in_progress` (Fixing Car)
    *   `vehicle_enroute_back` (Vehicle Returning to User)
    *   `completed` (Done)

2.  **Payment Update Rule**: When you mark a payment as **Paid** (`paid`), you **must also manually update the status** to `maintenance_in_progress` to indicate work has started.

---

## 🖥️ Dashboard Tabs overview

### 1. **Requests Tab**
Your main command center.
- **View All Requests:** See vehicle details, customer info, and current status.
- **Update Status:** Use the status dropdown to move requests forward (e.g., `pending` -> `accepted`).
- **Assign Drivers:** Select a driver from the dropdown to assign them to a request.
- **Update Payment:** Mark requests as `paid` once funds are confirmed. **Remember to also update the status to `maintenance_in_progress`!**

### 2. **Drivers Tab**
Manage your fleet.
- **Create Driver:** Click "Add Driver" to register a new mechanic/driver.
- **View Details:** See driver ratings, jobs completed, and contact info.
- **Delete Driver:** Remove inactive drivers.

### 3. **Quotes Tab**
Manage repair costs.
- **Create Quote:**
    1.  Ensure the request status is `diagnosing`.
    2.  Click "Create Quote".
    3.  Select the request.
    4.  Add line items (e.g., "Brake Pads": 15000, "Labor": 5000).
    5.  Save. This automatically sets the request status to `quote_ready` and emails the user.
- **Edit/Delete:** Modify quotes if mistakes were made.

### 4. **Service Prices Tab**
Manage base pricing.
- **Add Price:** Define standard costs for services (e.g., "Towing Base Fee").
- **Edit:** Update prices as market rates change.

---

##  workflow Examples

### 🆕 Update 1: Assigning a Driver
1.  Go to **Requests Tab**.
2.  Find the `pending` request.
3.  In the **Driver** column, select a driver from the dropdown.
4.  Automatic Change of **Status** to `accepted`.
5.  *System notifies the user.*

### 🚚 Update 2: Tracking Progress
As the driver moves:
1.  **En Route:** Change status to `en_route`.
2.  **Arrived:** Change status to `arrived`. *System notifies the user.*
3.  **Inspection:** Change status to `diagnosing`.

### 💰 Update 3: Sending a Quote
1.  Go to **Quotes Tab**.
2.  Click **Create Quote**.
3.  Select the request (must be unquoted).
4.  Enter items (Parts, Labor, etc.).
5.  Click **Create**.
6.  *System sets request to `quote_ready` and emails the user.*

### ✅ Update 4: Confirming Payment
1.  Go to **Requests Tab**.
2.  Find the request (Status will be `quote_ready` and Payment `verifying` if user clicked "Sent Money").
3.  Change **Payment** to `paid`.
4.  **IMPORTANT:** Immediately change **Status** to `maintenance_in_progress`.
5.  *System notifies user that work has begun.*

### 🏁 Update 5: Completion
1.  **Job Done:** Change status to `vehicle_enroute_back` when returning the car.
2.  **Delivered:** Change status to `completed` when user has the car.

