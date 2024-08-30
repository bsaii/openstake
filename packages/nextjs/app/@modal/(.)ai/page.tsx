"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [answer, setAnswer] = useState<string>();
  const [results, setResults] = useState<Array<{ title: string; url: string }>>();
  const searchParams = useSearchParams();
  const { back } = useRouter();

  const search = searchParams.get("search");
  console.log(search, answer, results);

  useEffect(() => {
    async function travilySearch() {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Ethereum dips below $2000 by Sept 30?",
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
    }

    travilySearch();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md text-black">
        <h3 className="font-bold text-lg">AI Research</h3>
        <p className="py-4">{answer}</p>
        {results && results.length > 0 && (
          <ul className="menu w-full">
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
