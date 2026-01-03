use anchor_lang::prelude::*;
mod contexts;
mod state;
use contexts::*;

declare_id!("8hGms4xTeARJT5s4BhUuXzgzySBHBR8944f73XF7hojL");
use anchor_spl::token::{mint_to, MintTo};
use anchor_lang::system_program;

#[program]
pub mod solana_vote_dapp {
    use super::*;

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>, _sol_price: u64, _tokens_per_purchase: u64) -> Result<()> {
        let treasury_config_account = &mut ctx.accounts.treasury_config_account;
        treasury_config_account.authority = ctx.accounts.authority.key();
        treasury_config_account.bump = ctx.bumps.sol_vault;
        treasury_config_account.sol_price = _sol_price;
        treasury_config_account.x_mint = ctx.accounts.x_mint.key();
        treasury_config_account.tokens_per_purchase = _tokens_per_purchase;





        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>) -> Result<()>{
        //1. buyer will transfer sol from buyer  to sol vault
        let treasury_config_account = &mut ctx.accounts.treasury_config_account;
        let sol = treasury_config_account.sol_price;
        let token_amount = treasury_config_account.tokens_per_purchase;
        let transfer_ix = anchor_lang::system_program::Transfer{
            from:ctx.accounts.buyer.to_account_info(),
            to:ctx.accounts.sol_vault.to_account_info(),
        };
        system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_ix),
            sol,
        )?;
          
        //2. mint tokens to buyer_token_account
        let mint_authority_seeds = &[b"mint_authority".as_ref(), &[ctx.bumps.mint_authority]];
        let signer_seeds = &[&mint_authority_seeds[..]];

        let cpi_accounts = MintTo{
            mint:ctx.accounts.x_mint.to_account_info(),
            to:ctx.accounts.buyer_token_account.to_account_info(),
            authority:ctx.accounts.mint_authority.to_account_info(),
        };

        let cpi_ctx  = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        //3. X mint token
        mint_to(cpi_ctx, token_amount)?;        

        Ok(())

    }
}
