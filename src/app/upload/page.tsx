"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload image to Supabase Storage
    let imageUrl = "";
    if (image) {
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(`public/${image.name}`, image);

      if (error) {
        console.error("Error uploading image:", error.message);
        return;
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
    }

    // Insert product data into Supabase
    const { error } = await supabase.from("products").insert([
      { name, description, price: parseFloat(price), image_url: imageUrl },
    ]);

    if (error) {
      console.error("Error uploading product:", error.message);
      return;
    }

    alert("Product uploaded successfully!");
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Upload a Product</h1>
      <div>
        <label htmlFor="product-name" className="block font-medium">Name</label>
        <input
          id="product-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div>
        <label htmlFor="product-desc" className="block font-medium">Description</label>
        <textarea
          id="product-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded w-full p-2"
        />
      </div>
      <div>
        <label htmlFor="product-price" className="block font-medium">Price ($)</label>
        <input
          id="product-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border rounded w-full p-2"
        />
      </div>
      <div>
        <label htmlFor="product-img" className="block font-medium">Image</label>
        <input
          id="product-img"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload Product
      </button>
    </form>
  );
}
