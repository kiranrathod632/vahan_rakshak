# GadiRaksha Core Workflows & Scenarios

## 1. Physical Sticker Lifecycle

```
[Admin Batch Generation]
       │ (Tags generated with UNASSIGNED status)
       ▼
[Physical Sticker Printed & Stuck on Vehicle]
       │
       ▼
[First Scan by Vehicle Owner / Registration]
       │ Checks tag status: UNASSIGNED
       │ Links sticker permanently to vehicle & owner account
       ▼
[Sticker Status -> ACTIVE]
       │
       ▼
[Subsequent Public Scans]
       │ Redirects straight to Emergency Response Portal
       ▼
[Alert / Call / WhatsApp Bystander Action]
```

---

## 2. Bystander Emergency & No-Parking Alert Workflow

When any bystander scans the vehicle sticker:
1. **Camera Scan:** Scans `https://gadiraksha.com/scan/MH-1001` or opens `/scan/MH-1001`.
2. **Options Displayed:**
   - **No-Parking Alert:** Car parked in front of gate/driveway.
   - **Accident SOS:** Emergency crash or assistance needed.
   - **Towing Warning:** Police or crane towing vehicle.
   - **Lights ON / Flat Tyre:** Headlights draining battery or punctured wheel.
   - **Direct Call:** One-tap `tel:` call to owner.
   - **Direct WhatsApp:** One-tap WhatsApp chat with prefilled vehicle message.
3. **Dispatched Events:**
   - Real-time `Socket.io` modal popup triggered immediately on the owner's active web session.
   - Automated voice call triggered to owner.
   - SMS / WhatsApp alert sent with reporter notes and timestamp.

---

## 3. Salesman & Admin Commission Workflow

1. **Sales Staff Field Operations:**
   - Sales agent logs in via `/sales/login`.
   - Records customer onboarding & assigns sticker code.
   - Tracks attendance (Clock In / Clock Out) with location notes.
   - Views personal sales performance, pie chart analytics, and earned incentives.
2. **Admin Overview & Payroll:**
   - Admin tracks total stickers sold across the fleet.
   - Views each sales agent's attendance, working days, and leave balance.
   - Configures commission per sticker (e.g. ₹50 / sticker) and base salary.
   - Records monthly salary payouts and generates transaction receipts.
