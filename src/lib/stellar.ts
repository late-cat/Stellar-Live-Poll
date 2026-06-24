import {
  StellarWalletsKit,
  Networks as WalletNetworks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { rpc, TransactionBuilder, Networks, Address, Contract, xdr, scValToNative } from '@stellar/stellar-sdk';

export interface VoteEvent {
  voter: string;
  choice: string;
  ledger: number;
  txHash: string;
}

export const CONTRACT_ADDRESS = "CDLCLCOYFQC2DXGHWGCST4FWQOANS3QBXPSC3P2Q3D4JXWCEC7HTF7KP";

export class StellarHelper {
  server: rpc.Server;

  constructor() {
    this.server = new rpc.Server('https://soroban-testnet.stellar.org');
    
    if (typeof window !== 'undefined') {
      try {
        StellarWalletsKit.init({
          network: WalletNetworks.TESTNET,
          selectedWalletId: 'freighter',
          modules: [new FreighterModule()],
        });
      } catch (e) {
      }
    }
  }

  async connectWallet(): Promise<string> {
    const result = await StellarWalletsKit.authModal();
    return result.address;
  }

  async getResults(): Promise<{ yes: number; no: number }> {
    const contract = new Contract(CONTRACT_ADDRESS);
    
    const tx = new TransactionBuilder(await this.getDummyAccount(), {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call('get_results'))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const simulation = await this.server.simulateTransaction(prepared);

    if (rpc.Api.isSimulationSuccess(simulation)) {
        const resultXdr = simulation.result!.retval;
        if (resultXdr.switch() === xdr.ScValType.scvVec()) {
           const vec = resultXdr.vec()!;
           const yes = vec[0].u32();
           const no = vec[1].u32();
           return { yes, no };
        }
    }
    return { yes: 0, no: 0 };
  }

  async getRecentVotes(): Promise<VoteEvent[]> {
    try {
      const latestLedger = await this.server.getLatestLedger();
      const startLedger = Math.max(1, latestLedger.sequence - 10000);

      const response = await this.server.getEvents({
        startLedger,
        filters: [
          {
            type: "contract",
            contractIds: [CONTRACT_ADDRESS],
          }
        ],
        limit: 15,
      });

      const votes: VoteEvent[] = [];
      for (const event of response.events) {
        if (event.type !== "contract") continue;
        
        try {
          if (event.topic.length < 2) continue;
          
          const t1 = event.topic[0].sym().toString();
          if (t1 !== "vote") continue;
          
          const choice = event.topic[1].sym().toString();
          const voter = scValToNative(event.value) as string;
          
          votes.push({
            voter,
            choice,
            ledger: parseInt(event.ledger as any) || event.ledger,
            txHash: event.txHash
          });
        } catch (e) {
        }
      }
      return votes.reverse();
    } catch (e) {
      console.error("Failed to fetch recent votes:", e);
      return [];
    }
  }

  async vote(publicKey: string, choice: boolean): Promise<string> {
    const contract = new Contract(CONTRACT_ADDRESS);

    let account;
    try {
      account = await this.server.getAccount(publicKey);
    } catch (e: any) {
      throw new Error("Account not found on Testnet. Please fund your wallet first!");
    }

    const tx = new TransactionBuilder(account, {
      fee: '1000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'vote',
          new Address(publicKey).toScVal(),
          xdr.ScVal.scvBool(choice)
        )
      )
      .setTimeout(30)
      .build();

    let preparedTx;
    try {
      preparedTx = await this.server.prepareTransaction(tx);
    } catch (e: any) {
      if (e.message?.includes("InvalidAction") || e.message?.includes("UnreachableCodeReached") || e.message?.includes("WasmVm")) {
        throw new Error("You have already voted!");
      }
      throw new Error(`Transaction simulation failed: ${e.message}`);
    }

    let signedTxXdr;
    try {
      const result = await StellarWalletsKit.signTransaction(preparedTx.toXDR());
      signedTxXdr = result.signedTxXdr;
    } catch (e: any) {
      throw new Error("Transaction rejected by wallet.");
    }

    let sendResponse;
    try {
      sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET)
      );
    } catch (e: any) {
      console.error("Submit error:", e);
      throw new Error(`Failed to submit transaction: ${e.message}`);
    }

    if (sendResponse.status === 'ERROR') {
      const errorStr = JSON.stringify(sendResponse);
      if (errorStr.includes('tx_insufficient_balance')) {
        throw new Error("Insufficient balance to complete the transaction.");
      }
      throw new Error(`Transaction failed: ${errorStr}`);
    }

    return await this.pollTransaction(sendResponse.hash);
  }

  private async getDummyAccount() {
    return {
        accountId: () => 'GAUTVVO7UG5S67XVVTF2KYD2SBIVVE623KEIMDY3OG3QNAGUVDZ2JO6J',
        sequenceNumber: () => '1',
        incrementSequenceNumber: () => {},
    } as any;
  }

  private async pollTransaction(hash: string): Promise<string> {
    const server = this.server;
    let status = await server.getTransaction(hash);
    
    for (let i = 0; i < 15; i++) {
        if (status.status !== 'NOT_FOUND') {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        status = await server.getTransaction(hash);
    }

    if (status.status === 'SUCCESS') {
        return hash;
    } else {
        throw new Error(`Transaction failed on chain: ${JSON.stringify(status)}`);
    }
  }
}
