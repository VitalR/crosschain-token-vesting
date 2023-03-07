// npx hardhat run scripts/02-claim-tokens.js --network ftm
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

// Fantom Testnet (4002): 0xfCea2c562844A7D385a7CB7d5a79cfEE0B673D99
const AnyCallV7 = '0xfCea2c562844A7D385a7CB7d5a79cfEE0B673D99'
const GoerliNetId = 5
const FujiNetId = 43113

const provider = new ethers.providers.JsonRpcProvider('https://fantom-testnet.public.blastapi.io/')
const owner = new ethers.Wallet(PRIVATE_KEY, provider)

let vestingAmount = ethers.utils.parseEther("100")
let vestingStart, vestingDuration, vestingAddresses

// run script: 01-deploy-token.js - deployed token address from fuji nerwork
const tokenAddress = '0xc1A301F61eBCB7d367F95bAC19bA997c94b5D013' //--network fuji 0xAbE4B1D4BA8b473Ec3388E0F039FDab50B8da8F6

async function main() {
    let block = await ethers.provider.getBlock()
    vestingStart = block.timestamp // + 20
    vestingDuration = 1

    vestingAddresses = [owner.address]

    console.log("------------------------------")
    console.log("CrossChainTokenVesting is deploying...")
    const CrossChainTokenVesting = await ethers.getContractFactory("CrossChainTokenVesting")
    const vesting = await CrossChainTokenVesting.deploy(
        tokenAddress,
        vestingStart,
        vestingDuration,
        vestingAmount,
        vestingAddresses,
        // { gasLimit: 1000000}
    )
    await vesting.deployed()
    console.log("Deployed to: ", vesting.address)

    console.log("Setting AnyCallProxy..")
    await vesting.setAnyCallProxy(AnyCallV7)

    console.log("Trying to claim vested tokens..")
    let tx = await vesting.claimTokens(FujiNetId, { value: ethers.utils.parseEther("0.01"), gasLimit: 1000000 })
    await tx.wait()
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});