import React, { createContext, useContext, useState, useCallback } from 'react';
import { BACKEND_URL } from './api';
import { auth } from './firebase';

export interface Card {
  id: string;
  name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  front_image_url: string;
  back_image_url: string;
  raw_text_front: string;
  raw_text_back: string;
  created_at: string;
  updated_at: string;
}

interface ContactsContextType {
  cards: Card[];
  loading: boolean;
  fetchCards: () => Promise<void>;
  addCard: (card: Partial<Card>) => Promise<Card | null>;
  findDuplicate: (card: Partial<Card>) => Card | null;
  updateCard: (id: string, data: Partial<Card>) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
}

const ContactsContext = createContext<ContactsContextType>({
  cards: [],
  loading: false,
  fetchCards: async () => {},
  addCard: async () => null,
  findDuplicate: () => null,
  updateCard: async () => null,
  deleteCard: async () => false,
});

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/cards`, { headers });
      const json = await res.json();
      if (json.success) setCards(json.data);
    } catch (e) {
      console.error('fetchCards error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Check if an incoming card matches an existing contact by name+email or name+phone */
  const findDuplicate = useCallback(
    (card: Partial<Card>): Card | null => {
      const norm = (s?: string) => (s || '').trim().toLowerCase();
      const incomingName = norm(card.name);
      const incomingEmail = norm(card.email);
      const incomingPhone = norm(card.phone)?.replace(/[\s\-()]/g, '');

      if (!incomingName && !incomingEmail && !incomingPhone) return null;

      return (
        cards.find((existing) => {
          const eName = norm(existing.name);
          const eEmail = norm(existing.email);
          const ePhone = norm(existing.phone)?.replace(/[\s\-()]/g, '');

          // Exact name match
          if (incomingName && eName && incomingName === eName) return true;
          // Same email (non-empty)
          if (incomingEmail && eEmail && incomingEmail === eEmail) return true;
          // Same phone (non-empty, normalized)
          if (incomingPhone && ePhone && incomingPhone === ePhone) return true;

          return false;
        }) || null
      );
    },
    [cards],
  );

  const addCard = useCallback(async (card: Partial<Card>) => {
    try {
      const headers = await getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      const res = await fetch(`${BACKEND_URL}/api/cards`, {
        method: 'POST',
        headers,
        body: JSON.stringify(card),
      });
      const json = await res.json();
      if (json.success) {
        setCards((prev) => [json.data, ...prev]);
        return json.data;
      }
    } catch (e) {
      console.error('addCard error:', e);
    }
    return null;
  }, []);

  const updateCard = useCallback(async (id: string, data: Partial<Card>) => {
    try {
      const headers = await getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setCards((prev) => prev.map((c) => (c.id === id ? json.data : c)));
        return json.data;
      }
    } catch (e) {
      console.error('updateCard error:', e);
    }
    return null;
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (json.success) {
        setCards((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
    } catch (e) {
      console.error('deleteCard error:', e);
    }
    return false;
  }, []);

  return (
    <ContactsContext.Provider value={{ cards, loading, fetchCards, addCard, findDuplicate, updateCard, deleteCard }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  return useContext(ContactsContext);
}
