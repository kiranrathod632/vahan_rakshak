# GadiRaksha API Documentation

Welcome to the **GadiRaksha Smart Vehicle Safety & Emergency Response System** REST API documentation.

## Base URL
- Local Development: `http://localhost:5000`
- Production: Configured via `APP_BASE_URL`

---

## 1. Authentication Endpoints

### Register User (Vehicle Owner)
Registers a new vehicle owner and immediately claims an unclaimed physical QR sticker.
- **Route:** `POST /api/auth/register`
- **Request Body:**
```json
{
  "name": "Ramesh Sharma",
  "mobileNumber": "9876543210",
  "password": "password123",
  "vehicleNumber": "MH-12-AB-1234",
  "vehicleType": "CAR",
  "emergencyContact": "9876543211",
  "emergencyName": "Pooja Sharma",
  "physicalTagCode": "MH-1001"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "User registered and sticker MH-1001 successfully assigned!",
  "token": "jwt_token_string",
  "user": {
    "id": "671...",
    "name": "Ramesh Sharma",
    "mobileNumber": "9876543210",
    "role": "USER",
    "vehicle": {
      "vehicleNumber": "MH-12-AB-1234",
      "tagCode": "MH-1001"
    }
  }
}
```

### Login User / Admin
Authenticates a user or super-admin.
- **Route:** `POST /api/auth/login`
- **Request Body:**
```json
{
  "mobileNumber": "9823000000",
  "password": "password123"
}
```

### Current User Profile
- **Route:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. QR Tag / Physical Sticker Endpoints

### Check Sticker Code
Checks if a physical QR sticker code is valid, claimed, or available for onboarding.
- **Route:** `GET /api/tags/check/:tagCode`
- **Response (200):**
```json
{
  "success": true,
  "exists": true,
  "tagCode": "MH-1001",
  "isAssigned": false,
  "status": "UNASSIGNED",
  "message": "Physical tag MH-1001 is available for activation."
}
```

### Batch Generate Stickers (Admin)
- **Route:** `POST /api/tags/generate-batch`
- **Headers:** `x-admin-key: <ADMIN_API_KEY>` or `Authorization: Bearer <ADMIN_TOKEN>`
- **Request Body:**
```json
{
  "count": 50,
  "prefix": "MH"
}
```

---

## 3. Public Camera QR Scan & Emergency Actions

### Scan Sticker QR
Publicly accessible when a bystander scans the physical QR sticker attached to a vehicle with any mobile camera.
- **Route:** `GET /api/scan/:tagCode`
- **Response (200):**
```json
{
  "success": true,
  "tagCode": "MH-1001",
  "vehicle": {
    "vehicleNumber": "MH-12-AB-1234",
    "vehicleType": "CAR"
  },
  "ownerContact": {
    "phone": "+91 98765 43210",
    "maskedPhone": "XXXXXX3210",
    "directCallUrl": "tel:+919876543210",
    "whatsappUrl": "https://wa.me/919876543210?text=..."
  },
  "alertOptions": [
    {
      "id": "NO_PARKING",
      "title": "Wrong / No Parking",
      "description": "Vehicle is blocking gate, driveway, or in a towing zone"
    },
    {
      "id": "ACCIDENT",
      "title": "Accident / SOS",
      "description": "Vehicle in crash, emergency, or needs immediate help"
    },
    {
      "id": "TOW_WARNING",
      "title": "Towing Warning",
      "description": "Traffic police or crane is preparing to tow vehicle"
    },
    {
      "id": "LIGHTS_ON",
      "title": "Lights ON / Flat Tyre",
      "description": "Headlights left on or tyre is visibly punctured"
    }
  ]
}
```

### Send Bystander Alert
Dispatches notifications, automated voice calls, SMS, WhatsApp, and real-time Socket.io alerts to the vehicle owner.
- **Route:** `POST /api/alerts`
- **Request Body:**
```json
{
  "tagCode": "MH-1001",
  "alertType": "NO_PARKING",
  "reporterPhone": "9811223344",
  "reporterMessage": "Vehicle is blocking the basement exit."
}
```

---

## 4. Sales Team Portal Endpoints

### Sales Login
- **Route:** `POST /api/sales/login`
- **Request Body:** `{"mobileNumber": "9821889900", "password": "password123"}`

### Sales Statistics & Work Overview
- **Route:** `GET /api/sales/my-stats`
- **Headers:** `Authorization: Bearer <SALES_TOKEN>`

### Sales Registered Customers
- **Route:** `GET /api/sales/my-customers`
- **Headers:** `Authorization: Bearer <SALES_TOKEN>`

### Sales Register Customer
- **Route:** `POST /api/sales/register-customer`
- **Headers:** `Authorization: Bearer <SALES_TOKEN>`

---

## 5. Admin Dashboard Endpoints

### System Overview Stats
- **Route:** `GET /api/admin/stats`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

### Sales Staff Roster & Salary Management
- **Route:** `GET /api/admin/sales-staff`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

### Update Sales Incentive & Commission
- **Route:** `PUT /api/admin/sales-staff/:id/incentive`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

### Record Staff Salary Payment
- **Route:** `POST /api/admin/sales-staff/:id/salary-payment`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
