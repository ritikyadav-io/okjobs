import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useRealtimeRefresh(tables: string[], queryKeys: string[][]) {
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`zenith-live-${tables.join("-")}-${user.id}`);
    for (const table of tables) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        for (const key of queryKeys) qc.invalidateQueries({ queryKey: key });
      });
    }
    channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc, queryKeys, tables, user]);
}
