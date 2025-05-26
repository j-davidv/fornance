# Fornance - Personal Finance Tracker

A modern, responsive web application for tracking personal finances, built with React, TypeScript, and Tailwind CSS.

## Features

- 💰 Track cash balance and expenses
- 💱 Multi-currency support with real-time conversion
- 📊 Visual expense reports and analytics
- 🌓 Dark/Light mode
- 📱 Responsive design
- 🔄 Real-time updates
- 📜 Activity history
- 💾 Persistent storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fornance.git
   cd fornance
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory and add your ExchangeRate-API key:
   ```
   VITE_EXCHANGE_RATE_API_KEY=your_api_key_here
   ```
   Get your API key from [ExchangeRate-API](https://www.exchangerate-api.com/)

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router
- Recharts (Charts)
- Hero Icons
- React Hot Toast

## Environment Variables

The following environment variables are required:

- `VITE_EXCHANGE_RATE_API_KEY`: Your ExchangeRate-API key

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 