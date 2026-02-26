"use client";
import { useState, useEffect, useCallback } from "react";
import type { Avatar } from "@/lib/rpg/types";

export function useAvatar() {
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rpg/avatar");
      if (!res.ok) {
        if (res.status === 401) {
          setAvatar(null);
          return;
        }
        throw new Error("Failed to fetch avatar");
      }
      const data = await res.json();
      setAvatar(data.avatar);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAvatar = useCallback(async (name: string, className: string) => {
    const res = await fetch("/api/rpg/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, className }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create avatar");
    }
    const data = await res.json();
    setAvatar(data.avatar);
    return data.avatar;
  }, []);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  return { avatar, loading, error, createAvatar, refetch: fetchAvatar };
}
