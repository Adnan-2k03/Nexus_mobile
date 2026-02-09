export const GAMES = [
  "Valorant",
  "CS2",
  "League of Legends",
  "Apex Legends",
  "Fortnite",
  "Overwatch 2",
  "Rocket League",
  "Call of Duty",
  "Rainbow Six Siege",
  "Dota 2",
] as const;

export const REGIONS = [
  "NA East",
  "NA West",
  "EU West",
  "EU East",
  "Asia Pacific",
  "South America",
  "Oceania",
] as const;

export const SKILL_LEVELS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Grandmaster",
  "Radiant",
] as const;

export const MATCH_TYPES = [
  "Competitive",
  "Casual",
  "Ranked",
  "Scrimmage",
  "Tournament",
] as const;

export type Game = (typeof GAMES)[number];
export type Region = (typeof REGIONS)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type MatchType = (typeof MATCH_TYPES)[number];

export interface UserProfile {
  id: string;
  gamertag: string;
  bio: string;
  location: string;
  preferredGames: Game[];
  skillLevels: Record<string, SkillLevel>;
  coins: number;
  xp: number;
  level: number;
  avatar: string;
  lastDailyClaim: string | null;
  createdAt: string;
}

export interface MatchRequest {
  id: string;
  userId: string;
  gamertag: string;
  avatar: string;
  gameName: Game;
  gameMode: MatchType;
  region: Region;
  skillLevel: SkillLevel;
  description: string;
  status: "open" | "filled" | "closed";
  playersNeeded: number;
  playersJoined: number;
  createdAt: string;
  level: number;
}

export interface Connection {
  id: string;
  userId: string;
  gamertag: string;
  avatar: string;
  status: "pending" | "accepted" | "rejected";
  games: Game[];
  level: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantGamertag: string;
  participantAvatar: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Tournament {
  id: string;
  name: string;
  gameName: Game;
  prizePool: string;
  entryFee: number;
  status: "upcoming" | "live" | "completed";
  startDate: string;
  maxTeams: number;
  registeredTeams: number;
  format: string;
  description: string;
}

const AVATAR_COLORS = [
  "#00F0FF",
  "#FF00E5",
  "#7B61FF",
  "#00FF88",
  "#FFB800",
  "#FF3366",
];

const GAMERTAGS = [
  "ShadowStrike",
  "NeonBlade",
  "CyberPh4ntom",
  "VoidWalker",
  "PixelReaper",
  "GlitchHunter",
  "ByteStorm",
  "NullPointer",
  "DarkMatter",
  "QuantumRush",
  "IronPulse",
  "StealthViper",
  "RazorEdge",
  "BlitzKrieg",
  "MercuryRise",
  "PhotonBlast",
  "TurboNova",
  "ZeroGrav",
  "OmegaFlux",
  "ChronoShift",
];

function getAvatar(gamertag: string): string {
  const index =
    gamertag.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function generateMockMatches(): MatchRequest[] {
  const matches: MatchRequest[] = [];
  for (let i = 0; i < 15; i++) {
    const gamertag = GAMERTAGS[i % GAMERTAGS.length];
    const game = randomFrom(GAMES);
    matches.push({
      id: generateId() + i,
      userId: `user_${i}`,
      gamertag,
      avatar: getAvatar(gamertag),
      gameName: game,
      gameMode: randomFrom(MATCH_TYPES),
      region: randomFrom(REGIONS),
      skillLevel: randomFrom(SKILL_LEVELS),
      description: getMatchDescription(game),
      status: "open",
      playersNeeded: Math.floor(Math.random() * 4) + 1,
      playersJoined: Math.floor(Math.random() * 3),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 3600000),
      ).toISOString(),
      level: Math.floor(Math.random() * 50) + 1,
    });
  }
  return matches;
}

function getMatchDescription(game: Game): string {
  const descriptions: Record<string, string[]> = {
    Valorant: [
      "Need Duelist or Sentinel for ranked grind",
      "LFG Immortal+ push, mic required",
      "Chill comp games, no tilt",
    ],
    CS2: [
      "Premier mode, need AWPer",
      "Faceit Level 8+ grind",
      "Looking for IGL, serious team",
    ],
    "League of Legends": [
      "Need jungler for Clash",
      "Duo bot lane, ADC main",
      "Ranked flex, Gold+",
    ],
    "Apex Legends": [
      "Ranked grind, Diamond lobby",
      "Need third for trios, aggressive playstyle",
      "Pubs for fun, all welcome",
    ],
    Fortnite: [
      "Arena duos, need a cracked builder",
      "Tournament prep, serious players only",
      "Creative 1v1s and chill vibes",
    ],
    "Overwatch 2": [
      "Need tank main for comp",
      "Looking for support, Masters+",
      "Quick play, just having fun",
    ],
    "Rocket League": [
      "2s ranked, Diamond+",
      "Tournament team, C1+",
      "Casual 3s, all ranks",
    ],
    "Call of Duty": [
      "Warzone squad, aggressive rotations",
      "Ranked play, need AR slayer",
      "CDL watch party + play",
    ],
    "Rainbow Six Siege": [
      "Stack for ranked, Plat+",
      "Need hard breacher main",
      "Casual fun, learning new ops",
    ],
    "Dota 2": [
      "Need pos 4/5 for ranked",
      "Battle cup team, Ancient+",
      "Turbo games, chill session",
    ],
  };
  const opts = descriptions[game] || ["Looking for players"];
  return randomFrom(opts);
}

export function generateMockTournaments(): Tournament[] {
  return [
    {
      id: "t1",
      name: "Neon Clash Series",
      gameName: "Valorant",
      prizePool: "5,000 Coins",
      entryFee: 50,
      status: "upcoming",
      startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      maxTeams: 32,
      registeredTeams: 24,
      format: "5v5 Single Elimination",
      description:
        "The premier Valorant tournament for competitive players. Prove your worth in the Neon Clash Series.",
    },
    {
      id: "t2",
      name: "Cyber Strike Open",
      gameName: "CS2",
      prizePool: "10,000 Coins",
      entryFee: 100,
      status: "upcoming",
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      maxTeams: 16,
      registeredTeams: 12,
      format: "5v5 Double Elimination",
      description:
        "Elite CS2 competition. Double elimination bracket with top-tier prizes.",
    },
    {
      id: "t3",
      name: "Pixel Royale",
      gameName: "Fortnite",
      prizePool: "3,000 Coins",
      entryFee: 25,
      status: "live",
      startDate: new Date(Date.now() - 3600000).toISOString(),
      maxTeams: 64,
      registeredTeams: 64,
      format: "Solos - 3 Rounds",
      description:
        "Battle royale at its finest. 64 players compete across 3 rounds.",
    },
    {
      id: "t4",
      name: "Apex Predator Cup",
      gameName: "Apex Legends",
      prizePool: "7,500 Coins",
      entryFee: 75,
      status: "upcoming",
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      maxTeams: 20,
      registeredTeams: 15,
      format: "Trios - Points System",
      description:
        "Points-based Apex tournament. Placement + kills scoring system.",
    },
    {
      id: "t5",
      name: "Rift Champions",
      gameName: "League of Legends",
      prizePool: "15,000 Coins",
      entryFee: 150,
      status: "upcoming",
      startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      maxTeams: 8,
      registeredTeams: 6,
      format: "5v5 Round Robin + Playoffs",
      description:
        "The most prestigious League tournament on NexusMatch. Round robin into best-of-3 playoffs.",
    },
    {
      id: "t6",
      name: "Rocket Masters",
      gameName: "Rocket League",
      prizePool: "2,000 Coins",
      entryFee: 30,
      status: "completed",
      startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      maxTeams: 16,
      registeredTeams: 16,
      format: "3v3 Double Elimination",
      description: "Aerial goals and clutch saves. The best Rocket League teams battled it out.",
    },
  ];
}

export function generateMockConnections(): Connection[] {
  return GAMERTAGS.slice(0, 8).map((gamertag, i) => ({
    id: `conn_${i}`,
    userId: `user_${i}`,
    gamertag,
    avatar: getAvatar(gamertag),
    status: i < 5 ? ("accepted" as const) : ("pending" as const),
    games: [randomFrom(GAMES), randomFrom(GAMES)],
    level: Math.floor(Math.random() * 50) + 1,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 86400000 * 7),
    ).toISOString(),
  }));
}

export function generateMockConversations(): Conversation[] {
  const connectedGamertags = GAMERTAGS.slice(0, 5);
  return connectedGamertags.map((gamertag, i) => ({
    id: `conv_${i}`,
    participantId: `user_${i}`,
    participantGamertag: gamertag,
    participantAvatar: getAvatar(gamertag),
    messages: [
      {
        id: `msg_${i}_1`,
        senderId: `user_${i}`,
        text: getRandomChatMessage(),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
      },
    ],
    lastMessage: getRandomChatMessage(),
    lastMessageTime: new Date(
      Date.now() - Math.floor(Math.random() * 3600000),
    ).toISOString(),
    unreadCount: Math.floor(Math.random() * 4),
  }));
}

function getRandomChatMessage(): string {
  const messages = [
    "Hey, wanna queue up?",
    "GG last game!",
    "I'm online now, let's run it",
    "What rank are you this season?",
    "Need one more for our team",
    "That play was insane",
    "Same time tomorrow?",
    "Just got promoted, let's celebrate with some games",
  ];
  return randomFrom(messages);
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * 100;
}

export function xpProgress(xp: number): number {
  const currentLevelXp = xp % 100;
  return currentLevelXp / 100;
}
