import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { investorId, amount, notes } = await req.json();

    if (!investorId || !amount) {
      return NextResponse.json(
        { error: "Investor ID and amount are required" },
        { status: 400 }
      );
    }

    const { data: investor, error: investorError } = await supabase
      .from("investors")
      .select("*")
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
        { error: `Investor not found: ${investorId}` },
        { status: 404 }
      );
    }

    const { error: transactionError } = await supabase
      .from("investor_transactions")
      .insert({
        investor_id: investorId,
        transaction_type: "deposit",
        amount: Number(amount),
        notes: notes || null,
      });

    if (transactionError) {
      return NextResponse.json(
        { error: transactionError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("investors")
      .update({
        balance: Number(investor.balance || 0) + Number(amount),
        total_invested:
          Number(investor.total_invested || 0) + Number(amount),
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
      message: "Deposit recorded successfully",
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
