import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaVoteDapp } from "../target/types/solana_vote_dapp";

import {expect} from "chai";
import{getOrCreateAssociatedTokenAccount, getAccount} from "@solana/spl-token";
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
const airDropSol = async (connection:anchor.web3.Connection, publicKey:anchor.web3.PublicKey, sol:number) => {
const signature =  await connection.requestAirdrop(publicKey, sol);
await connection.confirmTransaction(signature);

}


describe("Testing the voting app", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;

  anchor.setProvider(provider);

  const program = anchor.workspace.solanaVoteDapp as Program<SolanaVoteDapp>;

  const adminWallet  = (provider.wallet as NodeWallet).payer;
  let proposalCreatorWallet = new anchor.web3.Keypair();
  let proposalCreatorTokenAccount:anchor.web3.PublicKey;

  let treasuryConfigPda:anchor.web3.PublicKey;
  let xMintPda:anchor.web3.PublicKey;
  let solVaultPda:anchor.web3.PublicKey;
  let mintAuthorityPda:anchor.web3.PublicKey;
  let treasuryTokenAccount:anchor.web3.PublicKey;


  beforeEach(async () => {
    treasuryConfigPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.TREASURY_CONFIG)]);
    xMintPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.X_MINT)]);
    solVaultPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.SOL_VAULT)]);
    mintAuthorityPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode(SEEDS.MINT_AUTHORITY)]);
    console.log("Transferring sol tokens ");
  await airDropSol(connection, proposalCreatorWallet.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
  
  console.log("Transferred successfully");
  })

  const createTokenAccounts = async () =>{
  console.log("Initializing token accounts...");
  treasuryTokenAccount = (await getOrCreateAssociatedTokenAccount(
    connection,
    adminWallet,
    xMintPda,
    adminWallet.publicKey
  )).address;

  proposalCreatorTokenAccount = (await getOrCreateAssociatedTokenAccount(
    connection,
    proposalCreatorWallet,
    xMintPda,
    proposalCreatorWallet.publicKey
  )).address;


}

describe("1. Initialization", () => {
  it("1.1 initialize treasury", async () => {
    const solPrice = new anchor.BN(1_000_000_000);
    const tokenPerPurchase = new  anchor.BN(1_000_000_000);



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
    await createTokenAccounts();

  });
})

describe("2. Buy Tokens", () => {
  it("2.1  buy tokens", async () => {

    const tokenBalanceBefore = (await getAccount(connection, proposalCreatorTokenAccount)).amount;
    console.log("Token balance before:", tokenBalanceBefore);
    await program.methods.buyTokens().accounts({
      buyer: proposalCreatorWallet.publicKey,
      treasuryTokenAccount: treasuryTokenAccount,
  buyerTokenAccount: proposalCreatorTokenAccount,
  xMint: xMintPda,
    }).signers([proposalCreatorWallet]).rpc();

    const tokenBalanceAfter = (await getAccount(connection, proposalCreatorTokenAccount)).amount;
    console.log("Token Balance After", tokenBalanceAfter);

    expect(tokenBalanceAfter-tokenBalanceBefore).to.equal(BigInt(1_000_000_000));


  });

});


});


