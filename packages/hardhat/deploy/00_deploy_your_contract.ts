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
    args: ["0xB11A8eb867df90F09aDbeb4F550e1f8f66F1c5f2"],
    log: true,
    autoMine: true,
  });

  const stakeChainContract = await hre.ethers.getContract<Contract>("StakeChain", deployer);
  console.log("Owner:", await stakeChainContract.owner);
};

export default deployStakeChainContract;

deployStakeChainContract.tags = ["StakeChain"];
