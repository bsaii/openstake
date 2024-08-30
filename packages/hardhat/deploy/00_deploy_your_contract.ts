import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "StakeChainContract" using the deployer account and
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployStakeChainContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("StakeChain", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const stakeChainContract = await hre.ethers.getContract<Contract>("StakeChain", deployer);
  console.log("Owner:", await stakeChainContract.owner);
};

export default deployStakeChainContract;

deployStakeChainContract.tags = ["StakeChain"];
