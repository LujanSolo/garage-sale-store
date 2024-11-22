"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available_count: number; // Add available_count for stock management
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

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

    // Load cart from localStorage when component mounts
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];

      // Use optional chaining to ensure that item.product exists
      const existingProduct = updatedCart.find((item) => item?.product?.id === product.id);

      if (existingProduct) {
        // If product exists, increase quantity (but don't exceed available_count)
        if (existingProduct.quantity <= product.available_count) {
          existingProduct.quantity++;
        }
      } else {
        // If the product doesn't exist, add it to the cart
        updatedCart.push({ product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save cart to localStorage
      return updatedCart;
    });
  };



  // Remove product from cart
  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.product.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save cart to localStorage
      return updatedCart;
    });
  };

  // Adjust product quantity
  const handleAdjustQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity >= 1 && newQuantity <= item.product.available_count) {
            item.quantity = newQuantity;
          }
        }
        return item;
      });

      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save cart to localStorage
      return updatedCart;
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      console.error("Cart is empty!");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ products: cart }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        const errorResponse = await res.json();
        console.error("Failed to create checkout session:", errorResponse);
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
                onClick={() => handleAddToCart(product)}
                className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleCheckout()}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cart Summary Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div>
            <ul>
              {cart.map((item) => (
                // Check if item and item.product are not undefined
                item && item.product ? (
                  <li key={`${item.product.id}-${item.quantity}`} className="mb-4 flex justify-between items-center">
                    <span>{item.product.name} - ${item.product.price}</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleAdjustQuantity(item.product.id, -1)}
                        disabled={item.quantity <= 1}
                        className="bg-yellow-300 px-2 py-1 rounded mr-2"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleAdjustQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.available_count}
                        className="bg-yellow-300 px-2 py-1 rounded ml-2"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="ml-4 text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ) : (
                  // If item or item.product is undefined, show a fallback
                  <li key={Math.random()} className="mb-4 flex justify-between items-center">
                    <span>Product not available</span>
                  </li>
                )
              ))}
            </ul>
            <button
              onClick={handleCheckout}
              className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
