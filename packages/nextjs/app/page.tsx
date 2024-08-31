"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [openStake, setOpenStake] = useState<{ id: number; open: boolean }>({ id: -1, open: false });
  const [stakeState, setStakeState] = useState<{ id: number; option: string }>({ id: 0, option: "" });
  const [betId, setBetId] = useState("0");
  const [stakeAmt, setStakeAmt] = useState(0.0);

  const { push } = useRouter();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("StakeChain");

  const query = gql`
    {
      betEventCreateds {
        id
        betEventId
        title
        description
        options
      }
    }
  `;
  const url = "https://api.studio.thegraph.com/query/87621/stakechain/version/latest";

  const { data, error, isLoading } = useQuery({
    queryKey: ["betEventsCreateds"],
    async queryFn() {
      const res = (await request(url, query)) as {
        betEventCreateds: Array<{
          id: string;
          betEventId: string;
          title: string;
          description: string;
          options: Array<string>;
        }>;
      };
      return res.betEventCreateds;
    },
  });

  const handleStake = async () => {
    try {
      await writeContractAsync({
        functionName: "placeBet",
        args: [BigInt(betId), BigInt(stakeState.id + 1)],
        value: parseEther(stakeAmt.toString()),
      });
    } catch (error) {
      console.error("Failed to place bet: ");
      console.error(error);
    }
  };

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
            {isLoading ? (
              <div className="w-full flex justify-center items-center h-screen">
                <span className="loading loading-bars loading-lg"></span>
              </div>
            ) : error ? (
              <div role="alert" className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Error! Failed to load betEventsCreateds.</span>
              </div>
            ) : data && data.length > 0 ? (
              data.map((event, betIdx) => (
                <div key={betIdx} className="card bg-base-100 w-96 shadow-xl flex flex-wrap">
                  {openStake.id === betIdx && openStake.open ? (
                    <div className="card-body">
                      <div className="w-full flex justify-between">
                        <button className="btn" onClick={() => push(`/ai?search=${event.title}`)}>
                          Ai Research
                        </button>
                        <div className="flex items-center gap-x-2">
                          <button className="btn" onClick={() => push(`/bets/${event.betEventId}`)}>
                            Bets
                          </button>
                          <button
                            className="btn btn-circle justify-center"
                            onClick={() => setOpenStake({ id: -1, open: false })}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-y-4">
                        <input
                          type="number"
                          placeholder="0.001"
                          value={stakeAmt}
                          step="any"
                          onChange={e => setStakeAmt(parseFloat(e.target.value))}
                          max={100.0}
                          min={0.0}
                          className="input input-bordered w-full max-w-xs"
                        />
                        <input
                          type="range"
                          min={0.0}
                          max={100.0}
                          step={0.001}
                          value={stakeAmt}
                          className="range"
                          onChange={e => setStakeAmt(parseFloat(e.target.value))}
                        />
                        <button className="btn btn-primary" disabled={isPending} onClick={handleStake}>
                          {stakeState.option}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-body">
                      <h2 className="card-title">{event.title}</h2>
                      <p>{event.description}</p>
                      <button className="btn w-1/3" onClick={() => push(`/bets/${event.betEventId}`)}>
                        Bets
                      </button>
                      <div className="card-actions justify-end w-full gap-x-3">
                        <div className="carousel rounded-box gap-x-4">
                          {event.options.map((option, index) => (
                            <div key={index} className="carousel-item">
                              <button
                                className="btn"
                                onClick={() => {
                                  setBetId(event.betEventId);
                                  setOpenStake({ id: betIdx, open: true });
                                  setStakeState({ id: index, option });
                                }}
                              >
                                {option}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : null}
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
