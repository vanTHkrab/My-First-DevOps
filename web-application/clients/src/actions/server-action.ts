"use server";

const API_URL: string = process.env.API_URL || "http://localhost:8000";

export async function fetchServerData(endpoint: string) {
  console.log(`Fetching server data from: ${API_URL}${endpoint}`);
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}