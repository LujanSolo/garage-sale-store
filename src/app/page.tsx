"use client";

import { useEffect, useState } from "react";
import {supabase} from "@/lib/supabaseClient";


type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleCheckout = async (productId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ productId }),
        headers: { "Content-Type": "application/json" },
      });
  
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        // If the server returns JSON (error or other data), use json()
        try {
          const errorResponse = await res.json();
          console.error("Failed to create checkout session:", errorResponse);
        } catch (jsonError) {
          // If response is not JSON, fallback to text()
          const errorText = await res.text();
          console.error("Failed to create checkout session:", errorText);
        }
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Garage Sale</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover mb-2"
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-700">{product.description}</p>
              <p className="text-lg font-bold text-blue-600">${product.price}</p>
              <button
                onClick={() => handleCheckout(product.id)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}