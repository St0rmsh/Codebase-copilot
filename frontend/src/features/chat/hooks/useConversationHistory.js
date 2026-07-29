import { useState, useEffect, useCallback } from "react";
import { fetchConversationHistory } from "../services/historyService";

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const data = await fetchConversationHistory(searchQuery);
      setConversations(data.conversations);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(query), 300);
    return () => clearTimeout(debounce);
  }, [query, load]);

  return { conversations, loading, query, setQuery };
};