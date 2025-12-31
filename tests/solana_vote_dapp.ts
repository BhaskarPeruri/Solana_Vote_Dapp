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

const findPda = (programId:anchor.web3.PublicKey, seeds:(Buffer | Uint8Array)[]):anchor.web3.PublicKey => {
  const[pda, pump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
  return pda;


}

describe("solana_vote_dapp", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.solanaVoteDapp as Program<SolanaVoteDapp>;

  const adminWallet  = (provider.wallet as NodeWallet).payer;
  let treasuryConfigPda:anchor.web3.PublicKey;
  let xMintPda:anchor.web3.PublicKey;
  let solVaultPda:anchor.web3.PublicKey;
  let mintAuthorityPda:anchor.web3.PublicKey;



  beforeEach(() => {
    treasuryConfigPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.TREASURY_CONFIG)]);
    xMintPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.X_MINT)]);
    solVaultPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.SOL_VAULT)]);
    mintAuthorityPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.MINT_AUTHORITY)]);
    
  })


  it("initialize treasury", async () => {
    const solPrice = new anchor.BN(1_000_000_000);
    const tokenPerPurchase = new  anchor.BN(1_000_000_000);

    console.log("Treasury Config PDA", treasuryConfigPda.toBase58());


    // Add your test here.
    const tx = await program.methods.initializeTreasury(solPrice, tokenPerPurchase).accounts({
      authority: adminWallet.publicKey,

    }).rpc();
    console.log("Your transaction signature", tx);

    const treasuryAccountData = await program.account.treasuryConfig.fetch(treasuryConfigPda);
    console.log("Treasury Account Data ", treasuryAccountData);

    expect(treasuryAccountData.authority.toBase58()).to.equal(adminWallet.publicKey.toBase58());
    expect(treasuryAccountData.xMint.toBase58()).to.equal(xMintPda.toBase58());
    expect(treasuryAccountData.solPrice.toNumber()).to.equal(solPrice.toNumber());
    expect(treasuryAccountData.tokensPerPurchase.toNumber()).to.equal(tokenPerPurchase.toNumber());
     

  });
});
