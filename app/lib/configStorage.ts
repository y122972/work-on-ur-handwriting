// LocalStorage utility for storing and managing page configuration

const CONFIG_KEY = 'handwriting_app_config';

export interface PageConfig {
  content?: string;
  size?: number;
  gridType?: string;
  gridColor?: string;
  fontFamily?: string;
  textColor?: string;
  textOpacity?: number;
  customFontId?: string | null;
}

// Save configuration to localStorage
export function saveConfig(config: PageConfig): void {
  try {
    const configStr = JSON.stringify(config);
    localStorage.setItem(CONFIG_KEY, configStr);
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
}

// Load configuration from localStorage
export function loadConfig(): PageConfig | null {
  try {
    const configStr = localStorage.getItem(CONFIG_KEY);
    if (!configStr) return null;
    return JSON.parse(configStr);
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
    return null;
  }
}

// Clear configuration from localStorage
export function clearConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error('Failed to clear config from localStorage:', error);
  }
}
