# Outreach CRM — Master Product Specification

You are an expert Next.js full-stack developer building a highly specialized, AI-powered CRM for a student organization.

## 1. Core Philosophy & Architecture

This is a lightweight CRM wrapper around a club's Google Workspace account. It is designed to manage high-touch, personalized outreach (like sponsorships and partnerships) without the bloat of enterprise sales software.

- **The "Single Sender" Model:** The app connects to a single central club Gmail account via OAuth. All users act on behalf of the organization.
- **Separation of State:** The "Contacts" page is a strictly read-only database. The "Outreach" page is the active workspace.
- **Cycles Framework:** Outreach is grouped into time-bound campaigns (e.g., "Fall 2026 Sponsorships").
- **Asynchronous Approval Pipeline:** AI drafts emails first, saving them to a queue. A user must manually review and dispatch them, decoupling writing from sending.

## 2. Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **UI Components:** shadcn/ui (Lucide icons for iconography)
- **Auth:** NextAuth.js (Google Provider)
- **Database:** Supabase (PostgreSQL)
- **APIs:** - Gmail API (Sending mail and fetching historical threads)
  - Anthropic Claude API (claude-3-haiku-20240307 or newer for generation)

## 3. Database Schema (Supabase)

The database must support global context, historical tracking, and draft queuing.

1. `Workspace_Profile` (Global settings for AI context)
   - `id` (uuid)
   - `organization_name` (text)
   - `mission_statement` (text)
   - `key_stats` (text)
   - `current_ask` (text)

2. `Contacts` (The Master Directory)
   - `id` (uuid)
   - `first_name` (text)
   - `last_name` (text)
   - `email` (text, unique)
   - `company` (text)
   - `role` (text)
   - `created_at` (timestamp)

3. `Cycles` (Time-bound organizational containers)
   - `id` (uuid)
   - `name` (text, e.g., "Semester 1 - 2026")
   - `is_active` (boolean)
   - `created_at` (timestamp)

4. `Outreach_Records` (The Junction Table holding dynamic state)
   - `id` (uuid)
   - `contact_id` (uuid, foreign key)
   - `cycle_id` (uuid, foreign key)
   - `status` (enum: 'Never contacted', 'Needs Review', 'Outreaching', 'In conversation', 'Agreed', 'Declined')
   - `draft_subject` (text, nullable)
   - `draft_body` (text, nullable)
   - `internal_author` (text, name of the team member who generated the draft)
   - `last_contacted_date` (timestamp, nullable)

## 4. Core Pages & UX Flows

### A. Onboarding & Settings

- **Auth:** User signs in with Google. NextAuth MUST request `gmail.readonly` and `gmail.send` scopes.
- **Workspace Setup:** On first login, the user must fill out the `Workspace_Profile` (Mission, Stats, Current Ask). This acts as the System Prompt for all AI generation.
- **Settings Page:** Users can update the `Workspace_Profile` at any time to pivot the AI's general objective (e.g., switching from "Sponsorships" to "Guest Speakers").

### B. The Contacts Page (The Directory)

- **Primary Function:** A searchable, filterable data table of every person the club might contact.
- **CSV Upload:** Users can upload a CSV (using papaparse) to bulk-populate the `Contacts` table.
- **The "Memory Panel":** Double-clicking a contact row opens a side drawer. This drawer queries the `Outreach_Records` table to display a historical timeline of past cycles, statuses, and notes for that specific company.
- **Action:** Select rows and click "Add to [Active Cycle]". This creates new entries in `Outreach_Records` with the status 'Never contacted'.

### C. The Outreach Page (The Active Pipeline)

- **Primary Function:** The active workspace for the current campaign.
- **Cycle Dropdown:** A master toggle at the top of the page filters the entire table by the selected `Cycle_id`. Past cycles become read-only historical views.
- **The Apollo-Style Table:** Sortable by `last_contacted_date` and filterable by `status`.

### D. The AI Mail Merge Workflow (Step-by-Step)

1. **Multi-Select:** On the Outreach page, the user selects multiple 'Never contacted' companies.
2. **Drafting Modal:** User clicks "Draft with AI". A centered modal appears. The user inputs their internal name (for the `internal_author` column) and a short instruction (e.g., "Ask for a $500 sponsorship").
3. **AI Generation (Backend Route):** - The route maps over the selected contacts.
   - **System Prompt:** Built from the `Workspace_Profile` + instruction to use `{{First_Name}}` and `{{Company}}` placeholders.
   - **User Prompt:** The user's specific instruction + historical notes from the Memory Panel.
   - Claude generates the drafts. The backend replaces placeholders with actual database values.
4. **Saving State:** Outputs are saved to `draft_subject` and `draft_body` in `Outreach_Records`. Status flips to 🟣 **Needs Review**.

### E. The Review & Dispatch Workflow

1. **The Queue:** An executive logs in, filters the Outreach table by 🟣 **Needs Review**.
2. **Spot Check:** Clicking a row opens the drawer showing the AI-generated text and the `internal_author`. The text is fully editable.
3. **Bulk Send:** The executive selects approved rows and clicks "Send Selected".
4. **Gmail API Integration:** The app routes the approved `draft_body` and `draft_subject` through the stored club Gmail OAuth token.
5. **Final State:** The app clears the draft columns in Supabase, updates `last_contacted_date`, and changes the status to 🔵 **Outreaching**.

### F. Managing Replies

- When a company replies, the user clicks the row in the Outreach page.
- The app fetches the live email thread via the Gmail API (`gmail.readonly`) and displays it in the drawer.
- The user manually updates the status to 🟡 **In conversation**, 🟢 **Agreed**, or 🔴 **Declined**.
