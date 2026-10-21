# 🛒 SmartSplit – Smart Bill Splitting App

SmartSplit is a simple and user-friendly web application that helps friends split bills easily. It is useful for road trips, group vacations, restaurant dinners, shopping, and shared living expenses.

You can add items, choose who shares each item, record who paid at the counter, and calculate how much each person owes. SmartSplit also finds a simple way to settle payments with fewer transactions.

## ✨ Features

### 1. Flexible Bill Splitting
- **Split with Everyone:** Divide an item's cost equally among all group members.
- **Split with Selected People:** Choose specific people who shared an item.
- **Personal Items:** Assign an item's full cost to one person.

### 2. Counter Payment Tracker
- Record how much each person paid.
- Track the total amount paid against the bill.
- See whether the bill is balanced or money is still missing.

### 3. Minimum Payment Calculator
- Calculate how much each person owes or should receive.
- Find a simple settlement plan with fewer payments.
- Avoid unnecessary back-and-forth transactions.

### 4. UPI Payment
- Use the **Pay via UPI** option to start a payment through a compatible UPI app.
- Make settling bills easier on supported mobile devices.

### 5. Share on WhatsApp
- Share a formatted bill summary with your friends.
- Include each person's total and payment settlement details.
- Make it easy for everyone to understand their share.

### 6. Save Trips and Work Offline
- Save multiple trips for later use.
- Open saved trips whenever needed.
- Store trip data in your browser using Local Storage.
- Use the app without requiring a backend server for its core features.

## 🖥️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Builds the user interface |
| TypeScript | Makes the code more reliable with type checking |
| Tailwind CSS | Creates a clean and responsive design |
| Vite | Provides a fast development environment |
| Local Storage | Saves trip data in the browser |

## 🚀 Getting Started

Follow these steps to run SmartSplit on your computer.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm, which comes with Node.js
- Git

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/mitesh02pujari-svg/SmartSplit-Project.git
```

### 2. Open the Project Folder

```bash
cd SmartSplit-Project
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

The terminal will display a local URL, usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser to use SmartSplit.

## 📖 How to Use SmartSplit

1. **Create a group:** Add the people participating in the trip or expense.
2. **Add items:** Enter the items and their prices.
3. **Choose participants:** Select everyone, specific people, or one person for each item.
4. **Record payments:** Enter how much each person paid at the counter.
5. **Check the bill:** Review the total expense and the amount paid.
6. **Calculate settlements:** Find out who needs to pay and who should receive money.
7. **Settle the bill:** Use the UPI payment option where supported.
8. **Share the summary:** Send the settlement details through WhatsApp.
9. **Save your trip:** Store the trip and return to it later.

## 🧮 Example

Suppose three friends — Rahul, Priya, and Amit — go out for dinner.

| Item | Cost | Shared By |
|---|---:|---|
| Pizza | ₹600 | All three |
| Cold Coffee | ₹200 | Rahul and Priya |
| Burger | ₹150 | Amit |

The total bill is ₹950.

Each person's share is:

- **Rahul:** ₹300 + ₹100 = ₹400
- **Priya:** ₹300 + ₹100 = ₹400
- **Amit:** ₹300 + ₹150 = ₹450

If Rahul pays ₹500, Priya pays ₹300, and Amit pays ₹150 at the counter, the total paid is ₹950.

SmartSplit calculates the difference between what each person paid and their actual share, then generates the settlement instructions.

## 🔒 Data Storage and Privacy

- Trip data is stored locally in the browser using Local Storage.
- The core application does not require a backend server.
- Saved data is associated with the browser and device being used.
- Clearing browser data may delete saved trips.
- Use the same browser and device to access locally saved trips.

## 📱 Responsive Design

SmartSplit is designed to provide a convenient experience on desktop and mobile screens, making it useful while travelling or sharing expenses with friends.

## 🎯 Project Goal

The goal of SmartSplit is to make group expense management simple, accurate, and less time-consuming.

Instead of calculating every person's share manually, users can enter their expenses and payments and let the application work out the settlement plan.

## 🔮 Future Improvements

Possible improvements for future versions include:

- Cloud backup and account-based access.
- Exporting bills as PDF files.
- Expense history and monthly summaries.
- More payment and currency options.
- Improved trip sharing between devices.

## 👨‍💻 Author

**Mitesh Pujari**

GitHub: [mitesh02pujari-svg](https://github.com/mitesh02pujari-svg)

## 📄 License

This project is available for learning and personal use. Add a formal open-source license if you want others to use, modify, and distribute the project under defined terms.
