import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type Gig = Database["public"]["Tables"]["gigs"]["Row"];
type GigInsert = Database["public"]["Tables"]["gigs"]["Insert"];
type GigUpdate = Database["public"]["Tables"]["gigs"]["Update"];

export interface GigWithDetails extends Gig {
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    rating?: number;
    review_count?: number;
  };
  category?: {
    id: string;
    name: string;
    name_ar: string | null;
  };
}

export function useGigs(params?: {
  categoryId?: string;
  sellerId?: string;
  featured?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["gigs", params],
    queryFn: async () => {
      console.log("Fetching gigs from Supabase...", params);
      let query = supabase
        .from("gigs")
        .select(
          `
          *,
          seller:profiles!seller_id(id, full_name, avatar_url),
          category:categories(id, name, name_ar)
        `
        )
        .eq("is_active", true);

      if (params?.categoryId) {
        query = query.eq("category_id", params.categoryId);
      }

      if (params?.sellerId) {
        query = query.eq("seller_id", params.sellerId);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching gigs:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} gigs`);
      return data as GigWithDetails[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useGig(id: string) {
  return useQuery({
    queryKey: ["gigs", id],
    queryFn: async () => {
      console.log(`Fetching gig ${id} from Supabase...`);
      const { data, error } = await supabase
        .from("gigs")
        .select(
          `
          *,
          seller:profiles!seller_id(id, full_name, avatar_url),
          category:categories(id, name, name_ar),
          reviews:reviews(rating, comment, created_at, reviewer:profiles!reviewer_id(full_name, avatar_url))
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching gig:", error);
        throw error;
      }

      console.log("Fetched gig:", data);
      return data as GigWithDetails;
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useSearchGigs(searchQuery: string) {
  return useQuery({
    queryKey: ["gigs", "search", searchQuery],
    queryFn: async () => {
      console.log("Searching gigs:", searchQuery);
      const { data, error } = await supabase
        .from("gigs")
        .select(
          `
          *,
          seller:profiles!seller_id(id, full_name, avatar_url),
          category:categories(id, name, name_ar)
        `
        )
        .eq("is_active", true)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("rating", { ascending: false });

      if (error) {
        console.error("Error searching gigs:", error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} gigs`);
      return data as GigWithDetails[];
    },
    enabled: searchQuery.length > 0,
  });
}

export function useCreateGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gig: GigInsert) => {
      console.log("Creating gig:", JSON.stringify(gig, null, 2));
      const { data, error } = await supabase
        .from("gigs")
        .insert(gig)
        .select()
        .single();

      if (error) {
        console.error("Error creating gig:", JSON.stringify(error, null, 2));
        const errorMessage = error.message || error.hint || JSON.stringify(error);
        throw new Error(errorMessage);
      }

      console.log("Gig created:", JSON.stringify(data, null, 2));
      return data as Gig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gigs"] });
    },
    onError: (error) => {
      console.error("Create mutation error:", error);
    },
  });
}

export function useUpdateGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GigUpdate }) => {
      console.log(`Updating gig ${id}:`, JSON.stringify(updates, null, 2));
      const { data, error } = await supabase
        .from("gigs")
        .update(updates)
        .eq("id", id)
        .select(
          `
          *,
          seller:profiles!seller_id(id, full_name, avatar_url),
          category:categories(id, name, name_ar)
        `
        )
        .single();

      if (error) {
        console.error("Error updating gig:", JSON.stringify(error, null, 2));
        const errorMessage = error.message || error.hint || JSON.stringify(error);
        throw new Error(errorMessage);
      }

      console.log("Gig updated:", JSON.stringify(data, null, 2));
      return data as GigWithDetails;
    },
    onSuccess: (data) => {
      console.log("Update successful, updating cache for gig:", data.id);
      queryClient.setQueryData(["gigs", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["gigs"], exact: false, refetchType: "all" });
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
    },
  });
}

export function useDeleteGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting gig ${id}`);
      const { error } = await supabase.from("gigs").delete().eq("id", id);

      if (error) {
        console.error("Error deleting gig:", error);
        throw error;
      }

      console.log("Gig deleted");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gigs"] });
    },
  });
}
