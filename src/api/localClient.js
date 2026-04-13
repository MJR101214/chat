/**
 * Local storage-based client to replace Base44 SDK
 * Uses localStorage for all data persistence
 */

class LocalEntity {
  constructor(name) {
    this.name = name;
  }

  getAll() {
    const data = localStorage.getItem(`gms_${this.name}`);
    return data ? JSON.parse(data) : [];
  }

  save(items) {
    localStorage.setItem(`gms_${this.name}`, JSON.stringify(items));
  }

  async list(sort, limit) {
    let items = this.getAll();
    items = items.slice(0, limit || 200);
    return items;
  }

  async filter(where, sort, limit) {
    let items = this.getAll();
    for (const [key, value] of Object.entries(where)) {
      items = items.filter(item => item[key] === value);
    }
    return items.slice(0, limit || 200);
  }

  async create(data) {
    const items = this.getAll();
    const id = `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item = { ...data, id, created_date: new Date().toISOString() };
    items.push(item);
    this.save(items);
    return item;
  }

  async update(id, data) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index > -1) {
      items[index] = { ...items[index], ...data };
      this.save(items);
      return items[index];
    }
    return null;
  }

  async delete(id) {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    this.save(filtered);
  }

  async bulkCreate(records) {
    const items = this.getAll();
    const newItems = records.map(data => ({
      ...data,
      id: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_date: new Date().toISOString()
    }));
    items.push(...newItems);
    this.save(items);
    return newItems;
  }

  subscribe(callback) {
    // Simple polling for changes
    const interval = setInterval(() => {
      const items = this.getAll();
      callback({ type: 'poll', data: items });
    }, 5000);
    return () => clearInterval(interval);
  }
}

// Mock auth
const mockAuth = {
  async me() {
    const user = localStorage.getItem('gms_current_user');
    if (user) {
      return JSON.parse(user);
    }
    // Return anonymous user
    return {
      email: `user_${Math.random().toString(36).substr(2, 9)}@gms.local`,
      username: 'User',
      display_name: 'Guest User'
    };
  },

  async login(email, password) {
    const user = {
      email,
      username: email.split('@')[0],
      display_name: email.split('@')[0],
      id: `user_${Date.now()}`
    };
    localStorage.setItem('gms_current_user', JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem('gms_current_user');
  }
};

// Mock integrations
const mockIntegrations = {
  Core: {
    async UploadFile({ file }) {
      // Create a data URL for the file
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const file_url = e.target.result;
          resolve({ file_url, url: file_url });
        };
        reader.readAsDataURL(file);
      });
    }
  }
};

// Export the local client
export const localClient = {
  auth: mockAuth,
  integrations: mockIntegrations,
  entities: {
    User: new LocalEntity('User'),
    Server: new LocalEntity('Server'),
    ServerChannel: new LocalEntity('ServerChannel'),
    ServerMessage: new LocalEntity('ServerMessage'),
    VideoPost: new LocalEntity('VideoPost'),
    Friendship: new LocalEntity('Friendship'),
    Message: new LocalEntity('Message'),
    Conversation: new LocalEntity('Conversation')
  }
};

// Initialize with demo data if empty
export function initializeDemoData() {
  const users = localStorage.getItem('gms_User');
  if (!users) {
    const demoUsers = [
      { id: 'user_1', email: 'alice@gms.local', username: 'alice', display_name: 'Alice' },
      { id: 'user_2', email: 'bob@gms.local', username: 'bob', display_name: 'Bob' },
      { id: 'user_3', email: 'charlie@gms.local', username: 'charlie', display_name: 'Charlie' }
    ];
    localStorage.setItem('gms_User', JSON.stringify(demoUsers));
  }
}
