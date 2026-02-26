// LocalStorage utility for storing and managing page configuration

const CONFIG_KEY = 'handwriting_app_config';
const CUSTOM_CONTENTS_KEY = 'handwriting_custom_contents';

export interface CustomContent {
  id: string;
  title: string;
  content: string;
}

// Save a custom content entry to localStorage
export function saveCustomContent(title: string, content: string): void {
  try {
    const existing = getAllCustomContents();
    const newEntry: CustomContent = { id: crypto.randomUUID(), title, content };
    existing.unshift(newEntry);
    localStorage.setItem(CUSTOM_CONTENTS_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to save custom content to localStorage:', error);
  }
}

// Get all custom content entries from localStorage
export function getAllCustomContents(): CustomContent[] {
  try {
    const str = localStorage.getItem(CUSTOM_CONTENTS_KEY);
    if (!str) return [];
    return JSON.parse(str);
  } catch (error) {
    console.error('Failed to load custom contents from localStorage:', error);
    return [];
  }
}

// Delete a custom content entry from localStorage
export function deleteCustomContent(id: string): void {
  try {
    const existing = getAllCustomContents().filter(c => c.id !== id);
    localStorage.setItem(CUSTOM_CONTENTS_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to delete custom content from localStorage:', error);
  }
}

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
