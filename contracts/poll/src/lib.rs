#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    YesCount,
    NoCount,
    Voted(Address),
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    pub fn vote(env: Env, voter: Address, choice: bool) {
        voter.require_auth();

        let has_voted_key = DataKey::Voted(voter.clone());
        if env.storage().persistent().has(&has_voted_key) {
            panic!("Already voted");
        }

        env.storage().persistent().set(&has_voted_key, &true);

        if choice {
            let mut yes_count: u32 = env.storage().persistent().get(&DataKey::YesCount).unwrap_or(0);
            yes_count += 1;
            env.storage().persistent().set(&DataKey::YesCount, &yes_count);
            env.events().publish((symbol_short!("vote"), symbol_short!("yes")), voter);
        } else {
            let mut no_count: u32 = env.storage().persistent().get(&DataKey::NoCount).unwrap_or(0);
            no_count += 1;
            env.storage().persistent().set(&DataKey::NoCount, &no_count);
            env.events().publish((symbol_short!("vote"), symbol_short!("no")), voter);
        }
    }

    pub fn get_results(env: Env) -> (u32, u32) {
        let yes_count: u32 = env.storage().persistent().get(&DataKey::YesCount).unwrap_or(0);
        let no_count: u32 = env.storage().persistent().get(&DataKey::NoCount).unwrap_or(0);
        (yes_count, no_count)
    }
}
