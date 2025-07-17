import { getProfile } from "@/lib/profile-service"
import { getLatestUserTransactions } from "@/lib/transaction-service"
import { getAllTools } from "@/lib/tools"
import { createServerClient } from "@/lib/supabase/server"

export async function fetchDashboardData() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      points: null,
      transactions: [],
      purchasedTools: [],
      tools: [],
    };
  }

  const profile = await getProfile(user.id);
  // Fetch all tools
  const tools = await getAllTools();
  // Fetch purchased tools for the user
  const { data: purchasedTools = [] } = await supabase
    .from("tool_purchases")
    .select("*")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });

  // Fetch points
  const { data: pointsData, error: pointsError } = await supabase
    .from("points")
    .select("total_points, total_earned, total_spent")
    .eq("user_id", user.id)
    .single();

  // If no points record exists, create one
  if (pointsError && pointsError.code === "PGRST116") {
    const { data: newPoints, error: createError } = await supabase
      .from("points")
      .insert({
        user_id: user.id,
        total_points: 0,
        total_earned: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("total_points, total_earned, total_spent")
      .single();

    if (createError) {
      console.error("Error creating points:", createError);
      return {
        profile,
        points: { total_points: 0, total_earned: 0, total_spent: 0 },
        transactions: [],
        purchasedTools,
        tools,
      };
    }

    return {
      profile,
      points: newPoints,
      transactions: [],
      purchasedTools,
      tools,
    };
  }

  // If there was an error fetching points, return default values
  if (pointsError) {
    console.error("Error fetching points:", pointsError);
    return {
      profile,
      points: { total_points: 0, total_earned: 0, total_spent: 0 },
      transactions: [],
      purchasedTools,
      tools,
    };
  }

  // Fetch all transactions instead of just latest 10
  const { data: allTransactions = [] } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    profile,
    points: pointsData || { total_points: 0, total_earned: 0, total_spent: 0 },
    transactions: allTransactions,
    purchasedTools,
    tools,
  };
} 