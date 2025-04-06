
# Waste Management System - Client Requirements

## Project Overview
This application is designed for a waste management company to track and manage their collection, processing, inventory, sales, vehicles, and logistics operations. The system allows managers to monitor material collections, segregation processes, inventory levels, sales to different types of buyers, expenses, vehicle assignments, and transportation logistics.

## Workflow Description

As the operations manager of Malabar Eco, I need a comprehensive system to track our entire waste management process. Here's how our business works: We collect rejected waste from Local Self-Government Institutions (LSGIs) like Mankada GP in Malappuram. This waste arrives at our Material Recovery Facilities (MRFs) like Kuruvattur MRF via our vehicles. Upon arrival, we record details like voucher numbers (e.g., MPM/2425/0458), date, LSGI name, vehicle number, quantity (e.g., 5,500 kg), rate (₹6.4/kg), and total amount (₹35,200). We also track labor charges for loading/unloading (₹0.65/kg).

Once received, the waste follows two paths: some goes through segregation while other portions remain as rejected waste. Our staff segregates materials into categories like HM (Hard Mix plastics) and LD (Low Density plastics). During segregation, we track labor costs, including segregation charges (₹6.5/kg) and bailing charges (₹0.8/kg).

After processing, we sell segregated materials to recycling companies like DHARSHNI TRADERS. These outward entries record the buyer, vehicle number, quantities (e.g., 1,500 kg of HM at ₹13/kg and 1,500 kg of LD at ₹35/kg), and total value (₹72,000). The rejected waste that can't be recycled goes to cement companies like DALMIA CEMENT as Alternative Fuel and Raw Material (AFR). These transactions include details like quantity (20,500 kg), rate (₹2.4/kg), amount (₹49,200), and associated labor charges for bailing and loading.

Our vehicles and drivers handle all transport between facilities and to buyers. We need to track vehicle assignments, driver schedules, and manage our fleet effectively. Throughout this process, we maintain inventory levels at each MRF, record all expenses, and need comprehensive financial and operational reporting to analyze our business performance.

I need this system to maintain consistent voucher numbers across related transactions, update inventory in real-time, and provide easy-to-use interfaces for all our staff to record these operations accurately.

## Core Features

### 1. User Management
- **Authentication System**
  - Login for managers and administrators
  - Role-based access control (admin, manager)
  - Profile management for users

### 2. Location Management
- **Types of Locations**
  - Collection points where waste materials are collected
  - Material Recovery Facilities (MRFs)/Godowns where materials are stored and processed
  - Local Self-Government Institutions (LSGIs) as source of materials
- **Location Information**
  - Name, address, district
  - Contact information
  - Type classification (MRF, Collection Point, LSGI)

### 3. Collection Management
- **Waste Inward Entry**
  - Record rejected waste received from LSGIs 
  - Track quantities, rates, and total amounts
  - Record vehicle information used for transport
  - Track labor charges for loading/unloading
  - Generate voucher numbers for tracking
- **Collection Reports**
  - Daily inward entry summaries
  - Collection by location and material type

### 4. Inventory Management
- **Stock Tracking**
  - Track different material quantities in each MRF/godown
  - Monitor inventory levels for both rejected and segregated waste
  - Record material specifics (categories like HM, LD, AFR WASTE)
- **Stock Transfer**
  - Move inventory between godowns
  - Track material transfers with complete history

### 5. Processing Management
- **Segregation Tracking**
  - Record segregation of rejected waste into different categories (HM, LD, etc.)
  - Track labor charges for segregation and bailing
  - Monitor processing efficiency and output

### 6. Vehicle Management
- **Vehicle Registry**
  - Register vehicles with details (registration number, type, capacity)
  - Track vehicle status (available, maintenance, on route, loading, unloading)
  - Monitor current location of vehicles
- **Vehicle Assignment**
  - Assign vehicles to drivers
  - Track active assignments and history
  - End assignments when completed

### 7. Driver Management
- **Driver Registry**
  - Register drivers with personal and license information
  - Track driver availability
  - Maintain contact information
- **Driver Assignment**
  - Assign drivers to vehicles
  - Track driver-vehicle relationships
  - Maintain assignment history

### 8. Trip Management
- **Trip Creation and Tracking**
  - Create transportation trips between locations
  - Record material being transported, quantity, and units
  - Track departure and arrival times
  - Support for commission agents and commission tracking
- **Trip Status Updates**
  - Update trip status (in progress, completed)
  - Record actual arrival times
- **Token System**
  - Generate unique voucher numbers for trips and transactions
  - Lookup trips by voucher code

### 9. Sales Management
- **Waste Outward Entry**
  - Record sales of segregated materials to recycling parties
  - Record disposal of rejected waste to AFR parties (like cement companies)
  - Track buyer information, quantity sold, and sale amount
  - Record vehicle information for transport
  - Support different payment statuses
  - Update inventory automatically when sales are recorded
- **Buyer Categories**
  - Categorize buyers (Segregated Waste Parties, AFR Parties)
  - Maintain buyer profiles and purchasing history
- **Payment Tracking**
  - Track paid vs pending payments
  - Record partial payments and amount due

### 10. Labor Management
- **Labor Cost Tracking**
  - Record different types of labor costs:
    - Loading/unloading charges
    - Segregation charges
    - Bailing charges
  - Calculate labor costs based on weight and predefined rates
  - Track total labor expenses by category and operation

### 11. Expense Management
- **Expense Recording**
  - Record expenses by category
  - Track expense amount and recipient
  - Associate expenses with locations when applicable
  - Notes for additional details
- **Expense Categories**
  - Categorize expenses for reporting
  - Track expenses by location and category

### 12. Reports
- **Financial Reports**
  - Sales summary
  - Expense summary
  - Collection costs
  - Labor costs
  - Profit and loss calculations
- **Operational Reports**
  - Inventory levels
  - Collection volumes
  - Segregation efficiency
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
- Voucher printing functionality

## User Roles

### Administrator
- Full access to all system features
- Ability to create and manage manager accounts
- Access to all reports and data

### Manager
- Access to day-to-day operations
- Record collections, processing, sales, and expenses
- Manage vehicles, drivers, and trips
- View operational reports

## Database Schema Overview

The application uses the following main tables:
- **profiles**: User information and roles
- **locations**: Collection points, MRFs, and LSGIs
- **materials**: Types of materials collected, processed, and sold
- **inward_entries**: Records of rejected waste received
- **processing**: Records of waste segregation
- **outward_entries**: Records of materials/waste sold or disposed
- **inventory**: Current stock levels in MRFs/godowns
- **stock_transfers**: Movement of materials between godowns
- **vehicles**: Vehicle information
- **drivers**: Driver information
- **vehicle_assignments**: Relationship between vehicles and drivers
- **trips**: Transportation logistics
- **labor_charges**: Labor costs for various operations
- **expenses**: Operational expenses

## Development Guidelines
- Use Vite, React, TypeScript for frontend
- Implement Tailwind CSS and Shadcn UI for styling
- Use Supabase for backend and authentication
- Follow responsive design principles
- Implement proper error handling and validation
- Ensure data consistency and integrity
