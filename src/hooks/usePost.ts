/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePost.ts
import { useState } from "react";

export function usePost<TResponse = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<TResponse | null>(null);

  const post = async (
    url: string,
    payload: any = {}
  ): Promise<TResponse | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      setResponse(data);
      return data;
    } catch (err: any) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error, response };
}
