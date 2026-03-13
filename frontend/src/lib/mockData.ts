export type ToxicityLevel = 'safe' | 'warning' | 'toxic';

export interface Message {
  id: string;
  text: string;
  username: string;
  userId: string;
  chatId: string;
  chatName: string;
  timestamp: string;
  toxicityScore: number;
  toxicityLevel: ToxicityLevel;
  categories: {
    toxicity: number;
    severe_toxicity: number;
    obscene: number;
    threat: number;
    insult: number;
    identity_attack: number;
  };
  action: 'deleted' | 'warned' | 'passed';
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  violations: number;
  lastViolation: string;
  status: 'active' | 'warned' | 'banned';
  avatar: string;
}

export interface Chat {
  id: string;
  name: string;
  memberCount: number;
  messagesTotal: number;
  messagesBlocked: number;
  toxicityRate: number;
}

export const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Ты полный идиот, не умеешь ничего делать!',
    username: 'user_anger99',
    userId: 'u1',
    chatId: 'c1',
    chatName: 'Общий чат проекта',
    timestamp: '2024-01-15T14:32:10Z',
    toxicityScore: 0.94,
    toxicityLevel: 'toxic',
    categories: { toxicity: 0.94, severe_toxicity: 0.45, obscene: 0.72, threat: 0.12, insult: 0.89, identity_attack: 0.08 },
    action: 'deleted',
  },
  {
    id: '2',
    text: 'Какой же этот проект отстой, зря потратил время',
    username: 'critic_max',
    userId: 'u2',
    chatId: 'c2',
    chatName: 'Обсуждение продукта',
    timestamp: '2024-01-15T13:55:22Z',
    toxicityScore: 0.67,
    toxicityLevel: 'warning',
    categories: { toxicity: 0.67, severe_toxicity: 0.11, obscene: 0.31, threat: 0.05, insult: 0.55, identity_attack: 0.03 },
    action: 'warned',
  },
  {
    id: '3',
    text: 'Привет всем! Как дела?',
    username: 'friendly_user',
    userId: 'u3',
    chatId: 'c1',
    chatName: 'Общий чат проекта',
    timestamp: '2024-01-15T13:40:05Z',
    toxicityScore: 0.02,
    toxicityLevel: 'safe',
    categories: { toxicity: 0.02, severe_toxicity: 0.01, obscene: 0.01, threat: 0.01, insult: 0.01, identity_attack: 0.01 },
    action: 'passed',
  },
  {
    id: '4',
    text: 'Я тебя найду и покажу, кто тут умный!',
    username: 'threat_user77',
    userId: 'u4',
    chatId: 'c3',
    chatName: 'Технический чат',
    timestamp: '2024-01-15T12:15:44Z',
    toxicityScore: 0.91,
    toxicityLevel: 'toxic',
    categories: { toxicity: 0.91, severe_toxicity: 0.78, obscene: 0.22, threat: 0.96, insult: 0.65, identity_attack: 0.15 },
    action: 'deleted',
  },
  {
    id: '5',
    text: 'Отличная идея для функции, поддерживаю!',
    username: 'dev_sergey',
    userId: 'u5',
    chatId: 'c3',
    chatName: 'Технический чат',
    timestamp: '2024-01-15T11:58:33Z',
    toxicityScore: 0.01,
    toxicityLevel: 'safe',
    categories: { toxicity: 0.01, severe_toxicity: 0.01, obscene: 0.01, threat: 0.01, insult: 0.01, identity_attack: 0.01 },
    action: 'passed',
  },
  {
    id: '6',
    text: 'Вы все тут тупые, никто не понимает о чём говорит',
    username: 'angry_boris',
    userId: 'u1',
    chatId: 'c2',
    chatName: 'Обсуждение продукта',
    timestamp: '2024-01-15T11:22:18Z',
    toxicityScore: 0.88,
    toxicityLevel: 'toxic',
    categories: { toxicity: 0.88, severe_toxicity: 0.42, obscene: 0.55, threat: 0.08, insult: 0.92, identity_attack: 0.35 },
    action: 'deleted',
  },
  {
    id: '7',
    text: 'Можно немного тише? Сложно читать с таким потоком сообщений',
    username: 'calm_reader',
    userId: 'u6',
    chatId: 'c1',
    chatName: 'Общий чат проекта',
    timestamp: '2024-01-15T10:45:00Z',
    toxicityScore: 0.08,
    toxicityLevel: 'safe',
    categories: { toxicity: 0.08, severe_toxicity: 0.01, obscene: 0.01, threat: 0.01, insult: 0.05, identity_attack: 0.01 },
    action: 'passed',
  },
  {
    id: '8',
    text: 'Это бесполезная трата времени и денег, уроды',
    username: 'critic_max',
    userId: 'u2',
    chatId: 'c1',
    chatName: 'Общий чат проекта',
    timestamp: '2024-01-15T10:12:55Z',
    toxicityScore: 0.79,
    toxicityLevel: 'warning',
    categories: { toxicity: 0.79, severe_toxicity: 0.38, obscene: 0.61, threat: 0.05, insult: 0.72, identity_attack: 0.12 },
    action: 'warned',
  },
];

export const mockUsers: User[] = [
  { id: 'u1', username: 'user_anger99', firstName: 'Борис', lastName: 'Злобин', violations: 12, lastViolation: '2024-01-15T14:32:10Z', status: 'banned', avatar: 'БЗ' },
  { id: 'u2', username: 'critic_max', firstName: 'Максим', lastName: 'Критов', violations: 5, lastViolation: '2024-01-15T13:55:22Z', status: 'warned', avatar: 'МК' },
  { id: 'u3', username: 'friendly_user', firstName: 'Анна', lastName: 'Добрая', violations: 0, lastViolation: '-', status: 'active', avatar: 'АД' },
  { id: 'u4', username: 'threat_user77', firstName: 'Игорь', lastName: 'Грозный', violations: 8, lastViolation: '2024-01-15T12:15:44Z', status: 'banned', avatar: 'ИГ' },
  { id: 'u5', username: 'dev_sergey', firstName: 'Сергей', lastName: 'Разработкин', violations: 0, lastViolation: '-', status: 'active', avatar: 'СР' },
  { id: 'u6', username: 'calm_reader', firstName: 'Елена', lastName: 'Тихая', violations: 1, lastViolation: '2024-01-14T09:00:00Z', status: 'active', avatar: 'ЕТ' },
];

export const mockChats: Chat[] = [
  { id: 'c1', name: 'Общий чат проекта', memberCount: 248, messagesTotal: 4521, messagesBlocked: 187, toxicityRate: 4.1 },
  { id: 'c2', name: 'Обсуждение продукта', memberCount: 112, messagesTotal: 2103, messagesBlocked: 95, toxicityRate: 4.5 },
  { id: 'c3', name: 'Технический чат', memberCount: 67, messagesTotal: 1820, messagesBlocked: 42, toxicityRate: 2.3 },
];

export const mockChartData = [
  { date: 'Пн', total: 312, blocked: 18, warned: 24 },
  { date: 'Вт', total: 428, blocked: 31, warned: 19 },
  { date: 'Ср', total: 389, blocked: 22, warned: 33 },
  { date: 'Чт', total: 501, blocked: 47, warned: 28 },
  { date: 'Пт', total: 634, blocked: 56, warned: 41 },
  { date: 'Сб', total: 287, blocked: 15, warned: 12 },
  { date: 'Вс', total: 193, blocked: 9, warned: 8 },
];

export const mockHourlyData = [
  { hour: '00', count: 8 }, { hour: '02', count: 3 }, { hour: '04', count: 2 },
  { hour: '06', count: 5 }, { hour: '08', count: 22 }, { hour: '10', count: 41 },
  { hour: '12', count: 67 }, { hour: '14', count: 89 }, { hour: '16', count: 74 },
  { hour: '18', count: 95 }, { hour: '20', count: 81 }, { hour: '22', count: 34 },
];
