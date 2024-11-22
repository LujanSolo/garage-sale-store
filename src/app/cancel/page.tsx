"use client";
import { useRouter } from "next/navigation";

export default function Cancel() {
  const router = useRouter();

  // Optionally, you can add a function to navigate or perform other actions
  const handleBackToHome = () => {
    router.push("/");  // Navigate to the homepage or any other page
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
      <p>Your payment was not processed. Please try again.</p>
      <button
        onClick={handleBackToHome}
        className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded"
      >
        Go to Homepage
      </button>
    </main>
  );
}
