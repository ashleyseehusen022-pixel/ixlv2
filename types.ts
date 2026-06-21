
export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  category: 'Classic' | 'Action' | 'Puzzle' | 'Arcade' | 'AI-Gen' | 'Mirror';
  tags: string[];
  isInternal?: boolean;
  internalCode?: string;
}

export interface AIGenResult {
  code: string;
  explanation: string;
}

export interface ProxyMirror {
  name: string;
  url: string;
  description: string;
}

export interface ProxyConfig {
  stealthMode: boolean;
  relayBypass: boolean;
  defaultMirrors: ProxyMirror[];
  customMirrors: ProxyMirror[];
  selectedMask: string;
}

export enum Page {
  Home = 'home',
  Library = 'library',
  AILab = 'ailab',
  VPN = 'vpn',
  VPNSettings = 'vpnsettings',
  Search = 'search',
  Play = 'play',
  Deploy = 'deploy',
  LoveTest = 'lovetest',
  DevTerminal = 'devterminal',
  AdminConsole = 'adminconsole',
  Premium = 'premium'
}
