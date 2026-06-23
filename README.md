# Stellar Live Poll

A Next.js application integrated with a Soroban Smart Contract to perform a real-time Live Poll. This project fulfills the requirements for the Level 2 White Belt module: Multi-wallet integration, smart contract deployment, and real-time data synchronization.

## UI Screenshots
*(Drag and drop the screenshots you just took here before pushing to GitHub!)*

![Wallet Options](./public/screenshot_wallet.png)
![Live Poll](./public/screenshot_poll.png)
![Transaction Explorer](./public/screenshot_tx.png)

## Features

- **Multi-wallet integration**: Connect to Freighter (or others) using `@creit.tech/stellar-wallets-kit`.
- **Smart Contract Deployed**: Built with Rust and Soroban, deployed on the Stellar Testnet.
- **Robust Error Handling**: Handles 3 specific error types:
  1. **Wallet not found** - Shows error if you try to connect without a wallet.
  2. **Rejected** - Shows error if the user rejects the transaction.
  3. **Insufficient balance** - Catches Soroban `tx_insufficient_balance` errors.
- **Real-Time Data Synchronization**: Poll results automatically update via Next.js state management polling the network, with beautiful liquid fill animations powered by `framer-motion`.
- **Aesthetic UX**: Custom vanilla CSS design focused on minimalism and smooth micro-interactions.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contract Information

- **Network**: Testnet
- **Deployed Contract Address**: `CDLCLCOYFQC2DXGHWGCST4FWQOANS3QBXPSC3P2Q3D4JXWCEC7HTF7KP`

## Submission Checklist Output
- [x] Public GitHub repository
- [x] README with setup instructions
- [x] Minimum 2+ meaningful commits
- [x] Deployed contract address: `CDLCLCOYFQC2DXGHWGCST4FWQOANS3QBXPSC3P2Q3D4JXWCEC7HTF7KP`
- [x] Transaction hash of a contract call: `252b30fc115ad1d130d164fe4e7be41ce9c03921596ece35c6ddfacc38c44287`
