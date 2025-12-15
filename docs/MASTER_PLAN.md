# **TradeMentorAI v2: Master Design & Implementation Document**

## **1\. Project Overview**

**Goal:** Build a "Hybrid" Trading Journal and AI Mentor that aggregates data from automated sources (TradeStation) and manual entries (Crypto/Stocks), validates execution against specific strategies (extracted from Books/PDFs), and provides behavioral coaching.

**Core Philosophy:**

* **Active Ingestion:** The user uploads PDFs/Books; the AI extracts strategies.  
* **Context-Aware Mentorship:** The AI critiques trades based on the *specific strategy source* tagged to that trade.  
* **Hybrid Data:** Unified view of Real (API), Paper (API), and Manual (User) trades.

## **2\. Technology Stack**

* **Framework:** Next.js 15 (App Router).  
* **Language:** TypeScript (Strict).  
* **Database:** PostgreSQL (via Supabase).  
* **Auth:** Supabase Auth (Single User Mode).  
* **Storage:** Supabase Storage (for PDFs).  
* **ORM:** Drizzle ORM.  
* **UI:** Tailwind CSS \+ Shadcn UI.  
* **AI Engine:** Vercel AI SDK \+ Google Gemini.  
* **Key Libraries:**  
  * tradestation-api-ts: For TradeStation v3 API connection.  
  * langchain: For PDF/Text parsing.  
  * drizzle-zod: For schema validation.

## **3\. Configuration & Environment**

* **TradeStation Env:** Defaults to SIM (Simulator). Toggled via .env variable TRADESTATION\_ENV='LIVE'.  
* **Security:** New sign-ups will be disabled after the admin account is created.

## **4\. Developer Guidelines (Strict Constraints)**

1. **AI Interaction:** NEVER parse raw AI text strings. ALWAYS use generateObject from Vercel AI SDK with Zod schemas.  
2. **TradeStation:** NEVER write raw HTTP calls for TradeStation. Use the tradestation-api-ts wrapper.  
3. **Database:** src/db/schema.ts is the Source of Truth.  
4. **Server Actions:** All mutations (CRUD, AI calls, Sync) must be Server Actions.  
5. **No Duplication:** If a utility (e.g., PnL calculation) is used twice, move it to src/lib/utils.ts.

## **5\. Data Architecture (The "Holy Trinity" Schema)**

### **A. Users & Config**

* **users**: Linked to Supabase Auth ID.  
* **api\_keys**: Encrypted storage for TradeStation Refresh Tokens.

### **B. Knowledge Base (The "Librarian")**

* **advice\_sources**: Represents a Book, Guru, or Course.  
  * id, title, author, isbn, cover\_url.  
  * pdf\_path (Supabase Storage URL).  
  * processing\_status ('pending', 'chapterized', 'analyzed').  
* **source\_chapters**: Raw text content to prevent re-reading PDFs.  
  * id, source\_id (FK), chapter\_number, title, content\_text (Large Text).  
* **strategies**: Structured rules extracted by AI.  
  * id, source\_id (FK), name (e.g., "Gap and Go").  
  * rules (JSON: { "entry": "...", "stop": "..." }).  
  * easylanguage\_code (Text \- code block for TradeStation).

### **C. Execution (The Journal)**

* **transactions**: The unified trade record.  
  * id (UUID).  
  * user\_id (FK).  
  * source: ENUM ('TradeStation', 'Manual').  
  * is\_paper\_trade: BOOLEAN.  
  * ticker: STRING (e.g., "NVDA").  
  * strategy\_id: UUID (FK to strategies).  
  * ts\_order\_id: STRING (Nullable, stores TradeStation OrderID).  
  * entry\_date, exit\_date, entry\_price, exit\_price, quantity.  
  * pnl: DECIMAL (Auto-calculated on close).  
  * status: ENUM ('Open', 'Closed').  
  * notes: TEXT.  
* **watched\_items**: Ideas/Pending.  
  * id, ticker, strategy\_id (FK), status ('Watching', 'Triggered').

## **6\. Implementation Stages (The Roadmap)**

### **📅 Phase 1: Foundation & Data Layer**

**Goal:** Setup Drizzle, Postgres, and the Schema. Seed with mock data.

* **Tasks:**  
  1. Initialize Drizzle with the schema defined in Section 5\.  
  2. Create src/lib/types.ts exporting inferred types.  
  3. Create src/app/actions/seed.ts to populate mock data.

### **📅 Phase 2: TradeStation Connectivity**

**Goal:** Authenticate and Sync (SIM Environment).

* **Tasks:**  
  1. Install tradestation-api-ts.  
  2. Build OAuth route to capture tokens.  
  3. Create Server Action syncTradeStationOrders():  
     * Fetch filled orders from SIM.  
     * Upsert into transactions table.

### **📅 Phase 3: The "Strategy Lab" (AI Ingestion)**

**Goal:** Upload PDF, Extract Rules.

* **Tasks:**  
  1. Build UI for "Add Source" (ISBN Lookup).  
  2. Build "Upload PDF" (Save to Supabase Storage).  
  3. Create Processing Pipeline:  
     * Read PDF \-\> Split Chapters \-\> Save to DB.  
     * Gemini extracts Strategies \-\> Save to DB.

### **📅 Phase 4: Manual Journal & Dashboard**

**Goal:** View and Edit Trades.

* **Tasks:**  
  1. Build Dashboard (Table view).  
  2. Build AddTradeForm (For Manual entries).  
  3. Implement Strategy Tagging.

### **📅 Phase 5: The "Context-Aware" Mentor**

**Goal:** Advanced AI Analysis.

* **Tasks:**  
  1. Create analyzeTrade(tradeId) action.  
  2. Fetch Trade \+ Linked Strategy Rules.  
  3. Prompt Gemini for critique based on specific extracted rules.

## **7\. Prompting Instructions (How to build)**

When building a specific phase, reference the phase number.

* **Example:** "Gemini, execute **Phase 1** of MASTER\_PLAN.md. strict adherence to the schema in Section 5 is required."