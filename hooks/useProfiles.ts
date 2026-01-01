import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { useAuth } from "@/contexts/AuthContext";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export interface ProfileWithStats extends Profile {
  gigs_count?: number;
  orders_count?: number;
  avg_rating?: number;
  verification?: {
    status: "pending" | "approved" | "rejected";
  };
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      console.log(`Fetching profile for user ${userId}`);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message, error.details, error.hint);
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      if (!data) {
        console.error("No profile data returned");
        throw new Error("Profile not found");
      }

      console.log("Fetched profile:", data);

      let verificationStatus: "pending" | "approved" | "rejected" | undefined;
      
      if (data.user_type === "seller") {
        const { data: verification, error: verError } = await supabase
          .from("seller_verifications")
          .select("status")
          .eq("user_id", userId)
          .single();

        if (!verError && verification) {
          verificationStatus = verification.status;
        }
      }

      return {
        ...data,
        verification: verificationStatus ? { status: verificationStatus } : undefined,
      } as ProfileWithStats;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProfiles(filters?: {
  userType?: "buyer" | "seller";
  verified?: boolean;
}) {
  const { isGuest } = useAuth();
  
  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      console.log("Fetching profiles from Supabase...", filters);
      let query = supabase
        .from("profiles")
        .select(
          `
          *,
          verification:seller_verifications(status)
        `
        );

      if (filters?.userType) {
        query = query.eq("user_type", filters.userType);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      let profiles = data as ProfileWithStats[];

      if (filters?.verified !== undefined) {
        profiles = profiles.filter((p: any) => {
          const isVerified = p.verification?.[0]?.status === "approved";
          return isVerified === filters.verified;
        });
      }

      console.log(`Fetched ${profiles.length} profiles`);
      return profiles;
    },
    enabled: !isGuest,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopSellers(limit: number = 10) {
  return useQuery({
    queryKey: ["profiles", "top_sellers", limit],
    queryFn: async () => {
      console.log(`Fetching top ${limit} sellers`);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          gigs:gigs(rating, reviews_count)
        `
        )
        .eq("user_type", "seller")
        .limit(limit);

      if (error) {
        console.error("Error fetching top sellers:", error);
        throw error;
      }

      const sellersWithStats = data.map((seller: any) => {
        const gigs = seller.gigs || [];
        const totalReviews = gigs.reduce(
          (sum: number, gig: any) => sum + (gig.reviews_count || 0),
          0
        );
        const avgRating =
          gigs.length > 0
            ? gigs.reduce((sum: number, gig: any) => sum + (gig.rating || 0), 0) / gigs.length
            : 0;

        return {
          ...seller,
          gigs_count: gigs.length,
          orders_count: totalReviews,
          avg_rating: avgRating,
        };
      });

      sellersWithStats.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));

      console.log(`Fetched ${sellersWithStats.length} top sellers`);
      return sellersWithStats as ProfileWithStats[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: ProfileUpdate }) => {
      console.log(`Updating profile for user ${userId}:`, updates);
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated:", data);
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles", data.id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
