# CarTalker Data Models

## Core Entities

### User
```javascript
{
  id: string,
  email: string,
  name: string,
  created_at: datetime,
  preferences: {
    units: "imperial" | "metric",
    notifications: boolean,
    theme: "light" | "dark"
  }
}
```

### Vehicle
```javascript
{
  id: string,
  user_id: string,
  vin: string,
  make: string,
  model: string,
  year: integer,
  trim: string,
  color: string,
  engine: string,
  transmission: string,
  drivetrain: string,
  fuel_type: string,
  purchase_date: date,
  purchase_mileage: integer,
  current_mileage: integer,
  license_plate: string,
  state: string,
  nickname: string,
  photo_url: string,
  is_active: boolean,
  created_at: datetime,
  updated_at: datetime,

  // Calculated fields
  total_maintenance_cost: decimal,
  last_service_date: date,
  next_service_due: date,
  active_issues_count: integer
}
```

### MaintenanceRecord
```javascript
{
  id: string,
  vehicle_id: string,
  date: date,
  mileage: integer,
  type: "oil_change" | "tire_rotation" | "brake_service" | "transmission" | "coolant" | "filter" | "inspection" | "other",
  description: string,
  service_provider: {
    name: string,
    address: string,
    phone: string,
    website: string
  },
  cost: decimal,
  parts: [{
    name: string,
    part_number: string,
    quantity: integer,
    cost: decimal
  }],
  labor_cost: decimal,
  notes: text,
  receipts: [string], // URLs to uploaded files
  is_scheduled: boolean,
  reminder_sent: boolean,
  created_at: datetime
}
```

### Issue
```javascript
{
  id: string,
  vehicle_id: string,
  title: string,
  description: text,
  symptoms: {
    noise: boolean,
    vibration: boolean,
    leak: boolean,
    warning_light: boolean,
    performance: boolean,
    electrical: boolean,
    other: string
  },
  severity: "low" | "medium" | "high" | "critical",
  status: "open" | "investigating" | "scheduled" | "in_repair" | "resolved" | "monitoring",
  first_noticed: date,
  mileage_noticed: integer,
  resolved_date: date,
  resolution: text,
  repair_cost: decimal,
  related_maintenance_id: string,
  photos: [string],
  created_at: datetime,
  updated_at: datetime
}
```

### ChatConversation
```javascript
{
  id: string,
  user_id: string,
  vehicle_id: string,
  title: string,
  messages: [{
    role: "user" | "assistant",
    content: string,
    timestamp: datetime,
    context_used: {
      maintenance_records: [string],
      issues: [string],
      vehicle_data: boolean
    }
  }],
  summary: string,
  tags: [string],
  is_favorite: boolean,
  created_at: datetime,
  last_message_at: datetime
}
```

### Document
```javascript
{
  id: string,
  vehicle_id: string,
  type: "insurance" | "registration" | "title" | "manual" | "receipt" | "report" | "warranty" | "other",
  name: string,
  file_url: string,
  file_type: string,
  file_size: integer,
  expiry_date: date,
  tags: [string],
  notes: string,
  uploaded_at: datetime
}
```

### Reminder
```javascript
{
  id: string,
  vehicle_id: string,
  type: "maintenance" | "registration" | "insurance" | "inspection" | "custom",
  title: string,
  description: string,
  due_date: date,
  due_mileage: integer,
  frequency: {
    type: "once" | "recurring",
    interval_months: integer,
    interval_miles: integer
  },
  notification_settings: {
    advance_days: integer,
    advance_miles: integer,
    email: boolean,
    push: boolean
  },
  status: "pending" | "sent" | "completed" | "snoozed" | "dismissed",
  last_triggered: datetime,
  created_at: datetime
}
```

### FuelRecord
```javascript
{
  id: string,
  vehicle_id: string,
  date: datetime,
  mileage: integer,
  gallons: decimal,
  price_per_gallon: decimal,
  total_cost: decimal,
  location: {
    station_name: string,
    address: string,
    lat: decimal,
    lng: decimal
  },
  fuel_grade: "regular" | "plus" | "premium" | "diesel",
  is_full_tank: boolean,
  trip_miles: integer,
  mpg: decimal, // Calculated
  notes: string,
  created_at: datetime
}
```

### Trip
```javascript
{
  id: string,
  vehicle_id: string,
  start_date: datetime,
  end_date: datetime,
  start_mileage: integer,
  end_mileage: integer,
  distance: integer,
  purpose: "personal" | "business" | "medical" | "charity",
  origin: {
    address: string,
    lat: decimal,
    lng: decimal
  },
  destination: {
    address: string,
    lat: decimal,
    lng: decimal
  },
  route: [{ lat: decimal, lng: decimal }],
  notes: string,
  created_at: datetime
}
```

### VehicleSpecs (from VIN lookup)
```javascript
{
  vin: string,
  make: string,
  model: string,
  year: integer,
  body_style: string,
  engine: {
    displacement: string,
    cylinders: integer,
    fuel_type: string,
    hp: integer,
    torque: integer
  },
  transmission: {
    type: string,
    speeds: integer
  },
  drivetrain: string,
  mpg: {
    city: integer,
    highway: integer,
    combined: integer
  },
  dimensions: {
    length: decimal,
    width: decimal,
    height: decimal,
    wheelbase: decimal,
    curb_weight: integer
  },
  features: [string],
  safety_ratings: object,
  recalls: [{
    campaign_number: string,
    description: string,
    remedy: string,
    date: date
  }],
  tsbs: [{
    number: string,
    title: string,
    description: string,
    date: date
  }],
  fetched_at: datetime
}
```

## Relationships

1. **User** has many **Vehicles**
2. **Vehicle** has many **MaintenanceRecords**
3. **Vehicle** has many **Issues**
4. **Vehicle** has many **Documents**
5. **Vehicle** has many **Reminders**
6. **Vehicle** has many **FuelRecords**
7. **Vehicle** has many **Trips**
8. **User** has many **ChatConversations**
9. **ChatConversation** belongs to **Vehicle**
10. **Issue** can reference **MaintenanceRecord** (when resolved)

## Indexes

### Primary Indexes
- User.id
- Vehicle.id
- MaintenanceRecord.id
- Issue.id
- ChatConversation.id

### Secondary Indexes
- Vehicle.user_id
- Vehicle.vin
- MaintenanceRecord.vehicle_id + date
- Issue.vehicle_id + status
- ChatConversation.user_id + vehicle_id
- FuelRecord.vehicle_id + date
- Document.vehicle_id + type

## Data Privacy Considerations

### PII (Personally Identifiable Information)
- User email
- User name
- License plate
- VIN (can be used to identify owner)
- Location data from trips
- Address information

### Sensitive Data
- Financial information (costs)
- Location history
- Driving patterns
- Maintenance history

### Security Requirements
- Encrypt PII at rest
- Use secure connections (HTTPS/TLS)
- Implement proper authentication
- Role-based access control
- Audit logging for data access
- Regular backups
- GDPR compliance considerations

## API Endpoints (RESTful)

### Vehicles
- `GET /api/vehicles` - List user's vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Remove vehicle

### Maintenance
- `GET /api/vehicles/:id/maintenance` - List maintenance records
- `POST /api/vehicles/:id/maintenance` - Add maintenance record
- `PUT /api/maintenance/:id` - Update record
- `DELETE /api/maintenance/:id` - Delete record

### Issues
- `GET /api/vehicles/:id/issues` - List issues
- `POST /api/vehicles/:id/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Chat
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Start new conversation
- `POST /api/conversations/:id/messages` - Send message
- `GET /api/conversations/:id` - Get conversation history

### VIN Lookup
- `GET /api/vin/:vin` - Decode VIN and get specs

---
*This document will evolve as we refine the data requirements*