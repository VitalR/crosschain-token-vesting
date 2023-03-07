// npx hardhat run scripts/01-deploy-token.js --network fuji
require("dotenv").config();

const { PRIVATE_KEY, FUJI_API_KEY } = process.env;

// Avalanche Fuji Testnet (43113): 0x461d52769884ca6235b685ef2040f47d30c94eb5
const AnyCallV7 = '0x461d52769884ca6235b685ef2040f47d30c94eb5'

async function main() {
    const Token = await ethers.getContractFactory("ERC20Token")
    const token = await Token.deploy()
    await token.deployed()
    console.log("------------------------------")
    console.log("ERC20Token is deploying...")
    await token.deployed()
    console.log("Deployed to: ", token.address)

    await token.setExecutor(AnyCallV7)
    console.log("Set Executor")
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});