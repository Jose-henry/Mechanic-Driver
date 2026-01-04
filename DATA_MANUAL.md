# Mechanic Driver - Database Operations Manual

This guide explains how to manually update the Supabase database to trigger Realtime updates in the application.

## 1. Tracking Status Updates (Table: `requests`)

The "Tracking" flow is controlled by the `status` column in the `requests` table.

### **Where to Update:**
Table: `public.requests`
Column: `status`

### **Valid Status Values (In Order):**
1.  `pending` (Finding Mechanic)
2.  `accepted` (Mechanic Assigned)
3.  `en_route` (Driver En Route)
4.  `arrived` (Driver Arrived)
5.  `diagnosing` (Diagnosing Vehicle)
6.  `quote_ready` (Quote Generated - Triggers Quote Card)
7.  `maintenance_in_progress` (Repairs in Progress)
8.  `completed` (Service Completed)

### **SQL Example:**
```sql
-- Move a request to "Driver En Route"
UPDATE requests 
SET status = 'en_route' 
WHERE id = 'YOUR_REQUEST_ID';
```

---

## 2. Payment & Verification (Table: `requests`)

When a user clicks "I've Sent the Money", the app sets `payment_status` to `verifying`. You must manually mark it as `paid`.

### **Where to Update:**
Table: `public.requests`
Column: `payment_status`

### **Valid Values:**
*   `pending` (Default)
*   `verifying` (User claims they paid)
*   `paid` (Confirmed - Triggers "Maintenance In Progress")

### **SQL Example:**
```sql
-- Confirm Payment
UPDATE requests 
SET payment_status = 'paid', status = 'maintenance_in_progress'
WHERE id = 'YOUR_REQUEST_ID';
```

---

## 3. Creating/Updating Quotes (Table: `quotes`)

Quotes are linked to a request. You typically create one when the request is in the `diagnosing` phase.

### **Where to Create:**
Table: `public.quotes`

### **Essential Fields:**
*   `request_id`: The ID of the request (UUID).
*   `amount`: Total price (Number).
*   `status`: Always start with `'pending'` (User will change it to `accepted` or `rejected`).
*   `breakdown`: JSON Object detailing the costs.

### **Breakdown JSON Format:**
The `breakdown` field supports any key-value pair where the Value is a number (price).

```json
{
  "Brake Pads": 45000,
  "Labor Cost": 20000,
  "Oil Filter": 5000
}
```

### **SQL Example (Create Quote):**
First, ensure the request is in `diagnosing` or `quote_ready` status.

```sql
-- 1. Create the Quote
INSERT INTO quotes (request_id, amount, status, breakdown)
VALUES (
  'YOUR_REQUEST_ID', 
  70000, 
  'pending', 
  '{"Brake Pads": 45000, "Labor": 25000}'::jsonb
);

-- 2. Update Request Status to show the quote
UPDATE requests 
SET status = 'quote_ready' 
WHERE id = 'YOUR_REQUEST_ID';
```

### **SQL Example (Update Rejected Quote):**
If a user rejects a quote, you can lower the price and reset the status to `'pending'` to let them accept it again.

```sql
UPDATE quotes 
SET 
  amount = 60000, 
  status = 'pending', -- Reset from 'rejected'
  breakdown = '{"Brake Pads": 40000, "Labor": 20000}'::jsonb
WHERE request_id = 'YOUR_REQUEST_ID';
```
