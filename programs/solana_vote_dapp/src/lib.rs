use anchor_lang::prelude::*;
mod contexts;
mod state;
use contexts::*;

declare_id!("8hGms4xTeARJT5s4BhUuXzgzySBHBR8944f73XF7hojL");

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
}
