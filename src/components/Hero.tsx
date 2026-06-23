import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="hero-section">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="hero-badge">On-Chain Governance</span>
        <h1 className="hero-title">The Future of Finance is Here.</h1>
        <p className="hero-subtitle">
          Participate in the live network consensus. Cast your vote seamlessly 
          using your Freighter wallet directly on the Stellar Soroban Testnet.
          Verifiable, immutable, and fully transparent.
        </p>
      </motion.div>
    </section>
  );
}
