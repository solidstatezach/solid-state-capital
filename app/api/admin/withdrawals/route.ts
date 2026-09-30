import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("investor_transactions")
    .select("*")
    .eq("transaction_type", "withdrawal")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const { investorId, amount } = await req.json();

    if (!investorId || !amount) {
      return NextResponse.json(
        { error: "Investor ID and amount are required" },
        { status: 400 }
      );
    }

    const { data: investor, error: investorError } =
      await supabase
        .from("investors")
        .select("id,balance")
        .eq("id", investorId)
        .maybeSingle();

    if (investorError) {
      return NextResponse.json(
        { error: investorError.message },
        { status: 500 }
      );
    }

    if (!investor) {
      return NextResponse.json(
        {
          error: `Investor not found: ${investorId}`,
        },
        { status: 404 }
      );
    }

    const currentBalance = Number(
      investor.balance || 0
    );

    if (currentBalance < Number(amount)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const { error: txError } = await supabase
      .from("investor_transactions")
      .insert({
        investor_id: investorId,
        transaction_type: "withdrawal",
        amount: Number(amount),
      });

    if (txError) {
      return NextResponse.json(
        { error: txError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("investors")
      .update({
        balance:
          currentBalance - Number(amount),
      })
      .eq("id", investorId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal recorded",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
