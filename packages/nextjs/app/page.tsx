"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [openStake, setOpenStake] = useState(false);
  const [stakeState, setStakeState] = useState<boolean>();

  const { push } = useRouter();

  const handleStake = () => {
    console.log(stakeState);
  };

  const [rangeValue, setRangeValue] = useState(0.0);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">StakeChain</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-wrap gap-4">
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              {openStake ? (
                <div className="card-body">
                  <div className="w-full flex justify-between">
                    <button
                      className="btn"
                      onClick={() => push(`/ai?search=${"Ethereum dips below $2000 by Sept 30?"}`)}
                    >
                      Ai Research
                    </button>
                    <button className="btn btn-circle justify-center" onClick={() => setOpenStake(false)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col gap-y-4">
                    <input
                      type="number"
                      placeholder="0.001"
                      value={rangeValue}
                      step="any"
                      onChange={e => setRangeValue(parseFloat(e.target.value))}
                      max={100.0}
                      min={0.0}
                      className="input input-bordered w-full max-w-xs"
                    />
                    <input
                      type="range"
                      min={0.0}
                      max={100.0}
                      step={0.001}
                      value={rangeValue}
                      className="range"
                      onChange={e => setRangeValue(parseFloat(e.target.value))}
                    />
                    <button className="btn btn-primary" onClick={handleStake}>
                      {stakeState ? "Yes" : "No"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card-body">
                  <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                  <p>100 Stakes</p>
                  <div className="card-actions justify-end w-full gap-x-3">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setOpenStake(true);
                        setStakeState(true);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => {
                        setOpenStake(true);
                        setStakeState(false);
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
              <div className="card-body">
                <h2 className="card-title">Ethereum dips below $2000 by Sept 30?</h2>
                <p>100 Stakes</p>
                <div className="card-actions justify-end w-full gap-x-3">
                  <button className="btn btn-success">Yes</button>
                  <button className="btn btn-error">No</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
