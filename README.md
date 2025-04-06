
# Waste Management System - Client Requirements

## Project Overview
This application is designed for a waste management company to track and manage their collection, inventory, vehicles, and logistics operations. The system allows managers to monitor material collections, inventory levels, sales, expenses, vehicle assignments, and transportation logistics.

## Core Features

### 1. User Management
- **Authentication System**
  - Login for managers and administrators
  - Role-based access control (admin, manager)
  - Profile management for users

### 2. Location Management
- **Types of Locations**
  - Collection points where waste materials are collected
  - Godowns (warehouses) where materials are stored
- **Location Information**
  - Name, address, district
  - Contact information
  - Type classification

### 3. Collection Management
- **Recording Collections**
  - Track materials collected from various locations
  - Record quantity, material type, and amount paid
  - Support for commission agents and commission tracking
  - Notes and additional information
- **Collection Reports**
  - Daily collection summaries
  - Collection by location and material type

### 4. Inventory Management
- **Stock Tracking**
  - Track material quantities in each godown
  - Monitor inventory levels
  - Record material specifics
- **Stock Transfer**
  - Move inventory between godowns
  - Track material transfers with complete history

### 5. Vehicle Management
- **Vehicle Registry**
  - Register vehicles with details (registration number, type, capacity)
  - Track vehicle status (available, maintenance, on route, loading, unloading)
  - Monitor current location of vehicles
- **Vehicle Assignment**
  - Assign vehicles to drivers
  - Track active assignments and history
  - End assignments when completed

### 6. Driver Management
- **Driver Registry**
  - Register drivers with personal and license information
  - Track driver availability
  - Maintain contact information
- **Driver Assignment**
  - Assign drivers to vehicles
  - Track driver-vehicle relationships
  - Maintain assignment history

### 7. Trip Management
- **Trip Creation and Tracking**
  - Create transportation trips between locations
  - Record material being transported, quantity, and units
  - Track departure and arrival times
  - Support for commission agents and commission tracking
- **Trip Status Updates**
  - Update trip status (in progress, completed)
  - Record actual arrival times
- **Token System**
  - Generate unique tokens for trips
  - Lookup trips by token code

### 8. Sales Management
- **Sales Recording**
  - Record sales of materials from inventory
  - Track buyer information, quantity sold, and sale amount
  - Support different payment statuses
  - Update inventory automatically when sales are recorded
- **Payment Tracking**
  - Track paid vs pending payments
  - Record partial payments and amount due

### 9. Expense Management
- **Expense Recording**
  - Record expenses by category
  - Track expense amount and recipient
  - Associate expenses with locations when applicable
  - Notes for additional details
- **Expense Categories**
  - Categorize expenses for reporting
  - Track expenses by location and category

### 10. Reports
- **Financial Reports**
  - Sales summary
  - Expense summary
  - Collection costs
  - Profit and loss calculations
- **Operational Reports**
  - Inventory levels
  - Collection volumes
  - Vehicle utilization
  - Trip efficiency

## Technical Requirements

### Database Requirements
- Store all data in Supabase database
- Implement proper relationships between tables
- Enable row-level security for data protection

### UI Requirements
- Responsive design for all screen sizes
- Clean, intuitive interface
- Dashboard with key metrics
- Consistent styling throughout application
- Form validation for all inputs

### Integration Requirements
- Authentication via Supabase
- Real-time updates for inventory and vehicle status
- Data export capabilities for reports

## User Roles

### Administrator
- Full access to all system features
- Ability to create and manage manager accounts
- Access to all reports and data

### Manager
- Access to day-to-day operations
- Record collections, sales, and expenses
- Manage vehicles, drivers, and trips
- View operational reports

## Database Schema Overview

The application uses the following main tables:
- **profiles**: User information and roles
- **locations**: Collection points and godowns
- **materials**: Types of materials collected and sold
- **collections**: Records of collected materials
- **inventory**: Current stock levels in godowns
- **stock_transfers**: Movement of materials between godowns
- **vehicles**: Vehicle information
- **drivers**: Driver information
- **vehicle_assignments**: Relationship between vehicles and drivers
- **trips**: Transportation logistics
- **sales**: Sales transactions
- **expenses**: Operational expenses

## Development Guidelines
- Use Vite, React, TypeScript for frontend
- Implement Tailwind CSS and Shadcn UI for styling
- Use Supabase for backend and authentication
- Follow responsive design principles
- Implement proper error handling and validation
- Ensure data consistency and integrity
