import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PollProps {
  totalVotes: number;
  yesPercentage: number;
  publicKey: string | null;
  voteLoading: boolean | null;
  handleVote: (choice: boolean) => void;
}

export function Poll({ totalVotes, yesPercentage, publicKey, voteLoading, handleVote }: PollProps) {
  return (
    <section id="poll" className="poll-section">
      <div className="poll-container">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.2 }}>
            Should Soroban replace traditional financial systems?
          </h2>
          <p style={{ color: 'var(--secondary-text)' }}>
            {totalVotes} total votes recorded on-chain.
          </p>
        </div>

        <div className="results-labels">
          <div className="label-block">
            <span className="label-title">Yes</span>
            <span className="label-value val-yes">{yesPercentage.toFixed(0)}%</span>
          </div>
          <div className="label-block" style={{ alignItems: 'flex-end' }}>
            <span className="label-title">No</span>
            <span className="label-value val-no">{(100 - yesPercentage).toFixed(0)}%</span>
          </div>
        </div>

        <div className="poll-bar-container">
          <motion.div
            className="poll-bar-yes"
            initial={{ width: '50%' }}
            animate={{ width: `${yesPercentage}%` }}
            transition={{ type: "spring", bounce: 0.2, duration: 1.5 }}
          />
          <motion.div
            className="poll-bar-no"
            initial={{ width: '50%' }}
            animate={{ width: `${100 - yesPercentage}%` }}
            transition={{ type: "spring", bounce: 0.2, duration: 1.5 }}
          />
        </div>

        <div className="actions">
          <button
            onClick={() => handleVote(true)}
            disabled={!publicKey || voteLoading !== null}
            className="btn-vote yes"
          >
            <div className="btn-bg-glow" />
            {voteLoading === true ? <Loader2 className="icon-spin" size={24} /> : "Vote Yes"}
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={!publicKey || voteLoading !== null}
            className="btn-vote no"
          >
            <div className="btn-bg-glow" />
            {voteLoading === false ? <Loader2 className="icon-spin" size={24} /> : "Vote No"}
          </button>
        </div>
      </div>
    </section>
  );
}
