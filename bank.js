const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");

  describe ("Bank", ()=>{
    async function deployFixture(){
        const [owner, attacker] = await ethers.getSigners();

        const BankFactory = await ethers.getContractFactory("Bank");
        const Bank = await BankFactory.deploy();

        const AttackFactory = await ethers.getContractFactory("Attack");
        const Attack = await AttackFactory.deploy(Bank.target);

        return {owner, attacker, Bank, Attack};
    }

    it("Should deposit and withdrow correctly", async ()=>{
        const {owner, Bank} = await loadFixture(deployFixture);
        expect(await Bank.deposit({value: ethers.parseEther("5.0")})).not.to.be.reverted;

        const BankBalance = ethers.formatEther(await Bank.getBalance());
        expect(BankBalance).to.eq("5.0");

        expect(await Bank.withdraw()).not.to.be.reverted;
        const BankBalanceAfterWithdraw = ethers.formatEther(await Bank.getBalance());
        expect(BankBalanceAfterWithdraw).to.eq("0.0");
    })

    it("Should attack properly", async ()=>{
        const {owner, attacker, Bank, Attack} = await loadFixture(deployFixture);
        const initialDeposit = "5.0";

        await Bank.deposit({value: ethers.parseEther(initialDeposit)});
        const beforeAttack = ethers.formatEther(await Bank.getBalance());
        expect(beforeAttack).to.eq("5.0");

        await Attack.connect(attacker).attack({value: ethers.parseEther("1.0")});
        const afterAttack = ethers.formatEther(await Bank.getBalance());
        expect(afterAttack).to.eq("0.0");

        const attackBalance = ethers.formatEther(await Attack.getBalance());
        expect(attackBalance).to.eq("6.0");
    })
  })


