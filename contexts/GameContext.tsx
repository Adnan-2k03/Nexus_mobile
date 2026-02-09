import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import {
  UserProfile,
  MatchRequest,
  Connection,
  Conversation,
  Tournament,
  Message,
  Game,
  Region,
  SkillLevel,
  MatchType,
  generateMockMatches,
  generateMockConnections,
  generateMockConversations,
  generateMockTournaments,
  calculateLevel,
} from "@/lib/game-data";

interface GameContextValue {
  user: UserProfile | null;
  isOnboarded: boolean;
  matches: MatchRequest[];
  connections: Connection[];
  conversations: Conversation[];
  tournaments: Tournament[];
  isLoading: boolean;
  createProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createMatch: (match: Partial<MatchRequest>) => Promise<void>;
  joinMatch: (matchId: string) => Promise<void>;
  sendConnectionRequest: (userId: string, gamertag: string, avatar: string, games: Game[], level: number) => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<void>;
  rejectConnection: (connectionId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  claimDailyReward: () => Promise<boolean>;
  canClaimDaily: boolean;
  addXp: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
}

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEYS = {
  USER: "@nexusmatch_user",
  MATCHES: "@nexusmatch_matches",
  CONNECTIONS: "@nexusmatch_connections",
  CONVERSATIONS: "@nexusmatch_conversations",
  TOURNAMENTS: "@nexusmatch_tournaments",
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, matchData, connData, convData, tournData] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
          AsyncStorage.getItem(STORAGE_KEYS.CONNECTIONS),
          AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS),
        ]);

      if (userData) setUser(JSON.parse(userData));

      if (matchData) {
        setMatches(JSON.parse(matchData));
      } else {
        const mockMatches = generateMockMatches();
        setMatches(mockMatches);
        await AsyncStorage.setItem(
          STORAGE_KEYS.MATCHES,
          JSON.stringify(mockMatches),
        );
      }

      if (connData) {
        setConnections(JSON.parse(connData));
      } else {
        const mockConns = generateMockConnections();
        setConnections(mockConns);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CONNECTIONS,
          JSON.stringify(mockConns),
        );
      }

      if (convData) {
        setConversations(JSON.parse(convData));
      } else {
        const mockConvs = generateMockConversations();
        setConversations(mockConvs);
        await AsyncStorage.setItem(
          STORAGE_KEYS.CONVERSATIONS,
          JSON.stringify(mockConvs),
        );
      }

      if (tournData) {
        setTournaments(JSON.parse(tournData));
      } else {
        const mockTourns = generateMockTournaments();
        setTournaments(mockTourns);
        await AsyncStorage.setItem(
          STORAGE_KEYS.TOURNAMENTS,
          JSON.stringify(mockTourns),
        );
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (u: UserProfile) => {
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
  };

  const saveMatches = async (m: MatchRequest[]) => {
    setMatches(m);
    await AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(m));
  };

  const saveConnections = async (c: Connection[]) => {
    setConnections(c);
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(c));
  };

  const saveConversations = async (c: Conversation[]) => {
    setConversations(c);
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(c));
  };

  const createProfile = useCallback(async (profile: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: Crypto.randomUUID(),
      gamertag: profile.gamertag || "Player",
      bio: profile.bio || "",
      location: profile.location || "",
      preferredGames: profile.preferredGames || [],
      skillLevels: profile.skillLevels || {},
      coins: 500,
      xp: 0,
      level: 1,
      avatar: "#00F0FF",
      lastDailyClaim: null,
      createdAt: new Date().toISOString(),
    };
    await saveUser(newUser);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const createMatch = useCallback(async (match: Partial<MatchRequest>) => {
    if (!user) return;
    const newMatch: MatchRequest = {
      id: Crypto.randomUUID(),
      userId: user.id,
      gamertag: user.gamertag,
      avatar: user.avatar,
      gameName: match.gameName || "Valorant",
      gameMode: match.gameMode || "Competitive",
      region: match.region || "NA East",
      skillLevel: match.skillLevel || "Gold",
      description: match.description || "Looking for players",
      status: "open",
      playersNeeded: match.playersNeeded || 1,
      playersJoined: 0,
      createdAt: new Date().toISOString(),
      level: user.level,
    };
    const updated = [newMatch, ...matches];
    await saveMatches(updated);
    await addXp(10);
  }, [user, matches]);

  const joinMatch = useCallback(async (matchId: string) => {
    const updated = matches.map((m) => {
      if (m.id === matchId && m.playersJoined < m.playersNeeded) {
        return {
          ...m,
          playersJoined: m.playersJoined + 1,
          status:
            m.playersJoined + 1 >= m.playersNeeded
              ? ("filled" as const)
              : m.status,
        };
      }
      return m;
    });
    await saveMatches(updated);
    await addXp(5);
  }, [matches]);

  const sendConnectionRequest = useCallback(async (
    userId: string,
    gamertag: string,
    avatar: string,
    games: Game[],
    level: number,
  ) => {
    const exists = connections.find((c) => c.userId === userId);
    if (exists) return;
    const newConn: Connection = {
      id: Crypto.randomUUID(),
      userId,
      gamertag,
      avatar,
      status: "pending",
      games,
      level,
      createdAt: new Date().toISOString(),
    };
    const updated = [newConn, ...connections];
    await saveConnections(updated);
    await addXp(3);
  }, [connections]);

  const acceptConnection = useCallback(async (connectionId: string) => {
    const updated = connections.map((c) =>
      c.id === connectionId ? { ...c, status: "accepted" as const } : c,
    );
    await saveConnections(updated);

    const conn = connections.find((c) => c.id === connectionId);
    if (conn) {
      const newConv: Conversation = {
        id: Crypto.randomUUID(),
        participantId: conn.userId,
        participantGamertag: conn.gamertag,
        participantAvatar: conn.avatar,
        messages: [],
        lastMessage: "Connection accepted!",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };
      const updatedConvs = [newConv, ...conversations];
      await saveConversations(updatedConvs);
    }
    await addXp(5);
  }, [connections, conversations]);

  const rejectConnection = useCallback(async (connectionId: string) => {
    const updated = connections.filter((c) => c.id !== connectionId);
    await saveConnections(updated);
  }, [connections]);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!user) return;
    const newMsg: Message = {
      id: Crypto.randomUUID(),
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
    };
    const updated = conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
        };
      }
      return c;
    });
    await saveConversations(updated);
    await addXp(1);
  }, [user, conversations]);

  const canClaimDaily = useMemo(() => {
    if (!user?.lastDailyClaim) return true;
    const last = new Date(user.lastDailyClaim);
    const now = new Date();
    return now.getTime() - last.getTime() > 24 * 60 * 60 * 1000;
  }, [user?.lastDailyClaim]);

  const claimDailyReward = useCallback(async (): Promise<boolean> => {
    if (!user || !canClaimDaily) return false;
    const updated = {
      ...user,
      coins: user.coins + 100,
      xp: user.xp + 25,
      level: calculateLevel(user.xp + 25),
      lastDailyClaim: new Date().toISOString(),
    };
    await saveUser(updated);
    return true;
  }, [user, canClaimDaily]);

  const addXp = useCallback(async (amount: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newXp = prev.xp + amount;
      const updated = {
        ...prev,
        xp: newXp,
        level: calculateLevel(newXp),
      };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || user.coins < amount) return false;
    const updated = { ...user, coins: user.coins - amount };
    await saveUser(updated);
    return true;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isOnboarded: !!user,
      matches,
      connections,
      conversations,
      tournaments,
      isLoading,
      createProfile,
      updateProfile,
      createMatch,
      joinMatch,
      sendConnectionRequest,
      acceptConnection,
      rejectConnection,
      sendMessage,
      claimDailyReward,
      canClaimDaily,
      addXp,
      spendCoins,
    }),
    [
      user,
      matches,
      connections,
      conversations,
      tournaments,
      isLoading,
      canClaimDaily,
      createProfile,
      updateProfile,
      createMatch,
      joinMatch,
      sendConnectionRequest,
      acceptConnection,
      rejectConnection,
      sendMessage,
      claimDailyReward,
      addXp,
      spendCoins,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
