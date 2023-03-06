const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainTokenVesting", () => {
    let vestingAmount = ethers.utils.parseEther("100")

    let vestingStart, vestingDuration, vestingAddresses

    beforeEach(async () => {
        [ owner, user ] = await ethers.getSigners()

        const Token = await ethers.getContractFactory("ERC20Token")
        const token = await Token.deploy()
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
        it.only("Should return 0 tokens of claimableAmount in case claiming before vestingStart", async () => {
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("0"))
        })
    
        it.only("Should return all amount of vested tokens after vestingDuration", async () => {
            let block = await ethers.provider.getBlock()
            let duration = block.timestamp + 500
    
            await ethers.provider.send("evm_setNextBlockTimestamp", [duration,])
            await ethers.provider.send("evm_mine")
    
            expect(await vesting.getAmountToBeClaimed(user.address)).to.eq(ethers.utils.parseEther("100"))
        })
    
        it.only("Should return vested tokens in linear maner during vestingDuration", async () => {
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

})


