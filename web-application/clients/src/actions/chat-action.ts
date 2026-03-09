"use server";

const API_URL = process.env.API_URL || "http://localhost:8000";


export async function sendMessageAction(formData: FormData) {
  const message = formData.get('message');
  const sender = "User1";

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, sender }),
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(response);

    if (!response.ok) throw new Error();

    return { message: 'ส่งเรียบร้อย!', status: 'success' };
  } catch (e) {
    return { error: 'ส่งไม่สำเร็จ!', status: 'error' };
  }
}