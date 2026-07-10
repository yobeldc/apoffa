// src/lib/fetcher.ts
// Typed fetch wrapper with error handling

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new FetchError(
      `HTTP error ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }

  return response.json() as Promise<T>;
}

export async function post<T>(
  url: string,
  data: unknown,
  options?: RequestInit
): Promise<T> {
  return fetcher<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

export async function get<T>(url: string, options?: RequestInit): Promise<T> {
  return fetcher<T>(url, {
    method: 'GET',
    ...options,
  });
}

// SWR-compatible fetcher
export const swrFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await res.json();
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
