import { useState, useEffect } from "react";

export function useAsync<T>(fn: () => Promise<T>) {
  const [done, setDone] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  useEffect(() => {
    fn().then((d) => {
      setData(d);
      setDone(true);
    });
  }, [fn]);
  return { done, data } as
    | { done: false; data: undefined }
    | { done: true; data: T };
}
