const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainTokenVesting", () => {
    let token, vesting
    let vestingAmount = ethers.utils.parseEther("100")
    let vestingStart, vestingDuration, vestingAddresses

    const mainnet = 1

    beforeEach(async () => {
        [ owner, user ] = await ethers.getSigners()

        const Token = await ethers.getContractFactory("ERC20Token")
        token = await Token.deploy()
        await token.deployed()

        let block = await ethers.provider.getBlock()
        vestingStart = block.timestamp + 30
        vestingDuration = 120

        vestingAddresses = [user.address]

        const CrossChainTokenVesting = await ethers.getContractFactory("CrossChainTokenVesting")
        vesting = await CrossChainTokenVesting.deploy(
            token.address,
            vestingStart,
            vestingDuration,
            vestingAmount,
            vestingAddresses 
        )
        await vesting.deployed()
    })

    describe("Claimable Amount", () => {
        it("Should return 0 tokens of claimableAmount in case claiming before vestingStart", async () => {
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("0"))
        })
    
        it("Should return all amount of vested tokens after vestingDuration", async () => {
            let block = await ethers.provider.getBlock()
            let duration = block.timestamp + 500
    
            await ethers.provider.send("evm_setNextBlockTimestamp", [duration,])
            await ethers.provider.send("evm_mine")
    
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("100"))
        })
    
        it("Should return vested tokens in linear maner during vestingDuration", async () => {
            let quart_duration = vestingStart + 30
            await ethers.provider.send("evm_setNextBlockTimestamp", [quart_duration,])
            await ethers.provider.send("evm_mine")
    
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("25"))
    
            let half_duration = vestingStart + 60
            await ethers.provider.send("evm_setNextBlockTimestamp", [half_duration,])
            await ethers.provider.send("evm_mine")
    
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("50"))
        })
    })

    describe("Claim Tokens", () => {
        it("Should be possible to claim all vested tokens after vestingDuration", async () => {
            expect(await token.balanceOf(user.address)).to.eq(0)

            block = await ethers.provider.getBlock()
            let duration = block.timestamp + 500
    
            await ethers.provider.send("evm_setNextBlockTimestamp", [duration,])
            await ethers.provider.send("evm_mine")
    
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("100"))

            let tx = await vesting.connect(user).claimTokens(mainnet)
            await tx.wait()

            expect(await token.balanceOf(user.address)).to.eq(vestingAmount)
        })
    })
})