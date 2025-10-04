# Application Flow Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                     START APPLICATION                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Electron Window Opens       │
         │   - Loads React App           │
         │   - Initializes Database      │
         │   - Generates Encryption Key  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │      Main Interface           │
         │  ┌─────────────────────────┐  │
         │  │  Sidebar Navigation     │  │
         │  │  - Budgeting            │  │
         │  │  - Analytics            │  │
         │  │  - Admin                │  │
         │  └─────────────────────────┘  │
         └───────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌─────────────┐
│   BUDGETING    │ │ANALYTICS │ │    ADMIN    │
└────────────────┘ └──────────┘ └─────────────┘
```

## Budgeting Flow

```
┌─────────────────────────────────────────┐
│          BUDGETING PAGE                 │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌────────┐      ┌──────────┐
│TRANS-  │      │EXCHANGES │
│ACTIONS │      │          │
└───┬────┘      └─────┬────┘
    │                 │
    │                 │
┌───▼─────────────────▼───────────────┐
│                                     │
│  ADD TRANSACTION                    │
│  ┌──────────────────────────────┐   │
│  │ 1. Select Date               │   │
│  │ 2. Choose Type (Income/Exp)  │   │
│  │ 3. Select Account            │   │
│  │ 4. Choose Category           │   │
│  │ 5. Enter Amount              │   │
│  │ 6. Add Description (opt)     │   │
│  └──────────────────────────────┘   │
│             │                        │
│             ▼                        │
│  ┌──────────────────────────────┐   │
│  │  SAVE TO DATABASE            │   │
│  │  - Encrypt sensitive data    │   │
│  │  - Update account balance    │   │
│  │  - Refresh UI                │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Admin Setup Flow

```
┌────────────────────────────────────┐
│        ADMIN PANEL                 │
└──────────┬─────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  INITIAL SETUP (First Time)        │
│                                     │
│  Step 1: Add Countries              │
│  ┌────────────────────────────┐    │
│  │ USA, UK, Germany, etc.     │    │
│  └────────────────────────────┘    │
│           │                         │
│           ▼                         │
│  Step 2: Add Currencies             │
│  ┌────────────────────────────┐    │
│  │ USD ($), EUR (€), GBP (£)  │    │
│  └────────────────────────────┘    │
│           │                         │
│           ▼                         │
│  Step 3: Add Asset Types            │
│  ┌────────────────────────────┐    │
│  │ Checking, Savings, etc.    │    │
│  └────────────────────────────┘    │
│           │                         │
│           ▼                         │
│  Step 4: Create Accounts            │
│  ┌────────────────────────────┐    │
│  │ Link Country + Currency    │    │
│  │ + Asset Type + Balance     │    │
│  └────────────────────────────┘    │
│           │                         │
│           ▼                         │
│  Step 5: Add Categories             │
│  ┌────────────────────────────┐    │
│  │ Income: Salary, Freelance  │    │
│  │ Expense: Rent, Food, etc.  │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  READY TO USE!                      │
│  Go to Budgeting or Analytics       │
└─────────────────────────────────────┘
```

## Analytics Flow

```
┌────────────────────────────────────┐
│        ANALYTICS PAGE              │
└──────────┬─────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌──────────┐
│BY      │   │BY        │
│COUNTRY │   │CURRENCY  │
└────┬───┘   └────┬─────┘
     │            │
     └──────┬─────┘
            │
            ▼
┌───────────────────────────────────┐
│  DATA AGGREGATION                 │
│  ┌─────────────────────────────┐  │
│  │ Query database              │  │
│  │ Group by country/currency   │  │
│  │ Calculate totals            │  │
│  │ Format for charts           │  │
│  └─────────────────────────────┘  │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│  VISUALIZATION                    │
│  ┌─────────────────────────────┐  │
│  │ Bar Charts                  │  │
│  │ Pie Charts                  │  │
│  │ Summary Tables              │  │
│  │ Statistics Cards            │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────┐
│                USER INTERFACE                   │
│              (React Components)                 │
└────────────────────┬────────────────────────────┘
                     │ User Actions
                     │ (Click, Input, etc.)
                     ▼
┌─────────────────────────────────────────────────┐
│              ELECTRON IPC                       │
│         (Inter-Process Communication)           │
│                                                 │
│  React ──invoke──> Preload ──invoke──> Main    │
│                                                 │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           DATABASE SERVICE                      │
│        (SQLite + Encryption)                    │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  CRUD Operations:                         │  │
│  │  - Create (INSERT)                        │  │
│  │  - Read   (SELECT)                        │  │
│  │  - Update (UPDATE)                        │  │
│  │  - Delete (DELETE)                        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Encryption:                              │  │
│  │  - Encrypt sensitive data before save    │  │
│  │  - Decrypt data after read               │  │
│  │  - AES-256-CBC algorithm                 │  │
│  └───────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          LOCAL FILE SYSTEM                      │
│                                                 │
│  📁 User Data Directory                         │
│     ├── budget.db (Encrypted SQLite)            │
│     └── .key (Encryption Key)                   │
└─────────────────────────────────────────────────┘
```

## Transaction Processing

```
User Adds Transaction
        │
        ▼
┌───────────────────────┐
│  Validate Input       │
│  - Date exists?       │
│  - Amount > 0?        │
│  - Account selected?  │
│  - Category selected? │
└──────────┬────────────┘
           │
           ▼
    ┌──────────────┐
    │ Type Check   │
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌─────────┐
│ INCOME │   │ EXPENSE │
└───┬────┘   └────┬────┘
    │             │
    │             │
    └──────┬──────┘
           │
           ▼
┌────────────────────────┐
│  Save to Database      │
│  INSERT INTO trans...  │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Update Balance        │
│  Income:  balance + amt│
│  Expense: balance - amt│
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Refresh UI            │
│  - Reload transactions │
│  - Update stats        │
│  - Show success        │
└────────────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────┐
│      First App Launch               │
└─────────────────┬───────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Check for .key │
         └────────┬───────┘
                  │
          ┌───────┴───────┐
          │               │
    No    ▼               ▼    Yes
┌──────────────┐   ┌─────────────┐
│ Generate Key │   │  Load Key   │
│ 32 bytes     │   │  from file  │
│ Random       │   │             │
└──────┬───────┘   └──────┬──────┘
       │                  │
       ▼                  │
┌──────────────┐          │
│  Save Key    │          │
│  (mode 0600) │          │
└──────┬───────┘          │
       │                  │
       └────────┬─────────┘
                │
                ▼
┌────────────────────────────────┐
│  Key Ready for Encryption      │
└────────────────────────────────┘
                │
                ▼
┌────────────────────────────────┐
│  All Database Operations:      │
│  ┌──────────────────────────┐  │
│  │ WRITE:                   │  │
│  │ Data → Encrypt → Save    │  │
│  │                          │  │
│  │ READ:                    │  │
│  │ Load → Decrypt → Data    │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

## Build and Deployment

```
┌────────────────────────────┐
│   Developer Machine        │
└──────────┬─────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  npm run build               │
│  ┌────────────────────────┐  │
│  │ 1. Build React (Vite)  │  │
│  │    → dist/renderer/    │  │
│  │                        │  │
│  │ 2. Compile Electron    │  │
│  │    TypeScript → JS     │  │
│  │    → dist/main.js      │  │
│  │    → dist/preload.js   │  │
│  └────────────────────────┘  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  npm run package             │
│  ┌────────────────────────┐  │
│  │ electron-builder       │  │
│  │                        │  │
│  │ Windows:               │  │
│  │ → .exe installer       │  │
│  │                        │  │
│  │ macOS:                 │  │
│  │ → .dmg disk image      │  │
│  └────────────────────────┘  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│    release/ folder           │
│    - Budget Manager.exe      │
│    - Budget Manager.dmg      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Distribute to Users        │
└──────────────────────────────┘
```

This visual guide should help you understand how all the pieces fit together!
