import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use the service role key for server-side operations
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { products } = body; // Expecting an array: [{ id, quantity }]

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Invalid or empty cart" }, { status: 400 });
    }

    // Fetch product details from Supabase
    const productIds = products.map((item) => item.id);
    const { data: productList, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (error || !productList || productList.length === 0) {
      console.error("Error fetching products:", error);
      return NextResponse.json({ error: "Products not found" }, { status: 400 });
    }

    // Map the products in the cart to the corresponding products in the database
    const lineItems = products.map((item) => {
      const product = productList.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product with ID ${item.id} not found`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price * 100, // Convert price to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error in /api/checkout:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
