import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaVoteDapp } from "../target/types/solana_vote_dapp";

import {expect} from "chai";
import{getOrCreateAssociatedTokenAccount} from "@solana/spl-token";
import {NodeWallet} from "@project-serum/anchor/dist/cjs/nodewallet";

const SEEDS = {
  TREASURY_CONFIG: "treasury_config",
  X_MINT: "x_mint",
  SOL_VAULT: "sol_vault",
  MINT_AUTHORITY: "mint_authority",


} as const;

describe("solana_vote_dapp", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.solanaVoteDapp as Program<SolanaVoteDapp>;

  it("initialize treasury", async () => {
    // Add your test here.
    const tx = await program.methods.initializeTreasury().accounts({
      treasuryConfigAccount: 

    }).rpc();
    console.log("Your transaction signature", tx);
  });
});
