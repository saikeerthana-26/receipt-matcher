# 🧾 Receipt Matcher

A full-stack application to upload and compare bank statement transactions against your ledger records. It identifies matched entries, unmatched entries in the ledger, and unmatched entries in the bank statement.

---

## 📌 Features

- Upload bank statement CSV files 📤
- Compare transactions with ledger stored in database 🧮
- Visualize:
  - ✅ Matched transactions
  - 📒 Only in Ledger
  - 🏦 Only in Bank Statement
- Delete individual ledger entries from the UI 🗑️
- Prevents duplicate uploads
- Filters out invalid/future-dated transactions

---

## ⚙️ Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express, Prisma
- **Database:** SQLite (can be switched to PostgreSQL/MySQL)

---

## 🚀 Setup Instructions

### 🔧 Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
node index.js
