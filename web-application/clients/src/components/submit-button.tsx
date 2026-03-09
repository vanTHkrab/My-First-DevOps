'use client'

import { useFormStatus } from 'react-dom';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white p-2 disabled:bg-gray-400"
    >
      {pending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
    </button>
  );
}