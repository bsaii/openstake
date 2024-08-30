"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [answer, setAnswer] = useState<string>();
  const [results, setResults] = useState<Array<{ title: string; url: string }>>();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { back } = useRouter();

  const search = searchParams.get("search");

  useEffect(() => {
    if (!search) return;
    async function travilySearch() {
      setLoading(true);
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: search,
          api_key: process.env.NEXT_PUBLIC_TRAVILY_API_KEY,
          include_answer: true,
        }),
      });
      const data = (await res.json()) as {
        query: string;
        follow_up_questions: string | null;
        answer: string | null;
        images: string[];
        results: {
          title: string;
          url: string;
          content: string;
          score: number;
          raw_content: null;
        }[];
      };
      if (data.answer) {
        setAnswer(data.answer);
      }
      setResults(data.results);
      setLoading(false);
    }

    travilySearch();
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md text-black">
        <h3 className="font-bold text-lg">AI Research</h3>
        <p className="py-4">{answer}</p>
        {loading && (
          <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
            <svg
              className="text-gray-300 animate-spin"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="text-gray-900"
              ></path>
            </svg>
          </div>
        )}
        {results && results.length > 0 && (
          <ul className="menu w-full list-disc text-sky-500">
            {results.map((result, index) => (
              <li key={index}>
                <Link className="link" href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={back}>
              Close
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
