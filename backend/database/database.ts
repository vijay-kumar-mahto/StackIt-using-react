import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'backend/database.sqlite');

export class Database {
  private static db: sqlite3.Database;

  static init(): void {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  static getDB(): sqlite3.Database {
    return this.db;
  }

  private static createTables(): void {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        accepted_answer_id INTEGER,
        views INTEGER DEFAULT 0,
        votes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (accepted_answer_id) REFERENCES answers (id) ON DELETE SET NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        votes INTEGER DEFAULT 0,
        is_accepted BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS question_tags (
        question_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (question_id, tag_id),
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_id INTEGER NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
        vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, target_id, target_type),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('answer', 'comment', 'mention', 'vote')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        target_id INTEGER NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`
    ];

    tables.forEach((table) => {
      this.db.run(table, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        }
      });
    });

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions (created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers (question_id)',
      'CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_votes_user_target ON votes (user_id, target_id, target_type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id, is_read)',
      'CREATE INDEX IF NOT EXISTS idx_comments_target ON comments (target_id, target_type)'
    ];

    indexes.forEach((index) => {
      this.db.run(index, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        }
      });
    });

    // Insert default tags
    this.insertDefaultTags();
  }

  private static insertDefaultTags(): void {
    const defaultTags = [
      { name: 'javascript', description: 'Questions about JavaScript programming', color: '#f7df1e' },
      { name: 'typescript', description: 'Questions about TypeScript', color: '#3178c6' },
      { name: 'react', description: 'Questions about React.js', color: '#61dafb' },
      { name: 'node.js', description: 'Questions about Node.js', color: '#339933' },
      { name: 'html', description: 'Questions about HTML markup', color: '#e34f26' },
      { name: 'css', description: 'Questions about CSS styling', color: '#1572b6' },
      { name: 'python', description: 'Questions about Python programming', color: '#3776ab' },
      { name: 'sql', description: 'Questions about SQL databases', color: '#336791' },
      { name: 'git', description: 'Questions about Git version control', color: '#f05032' },
      { name: 'api', description: 'Questions about APIs and web services', color: '#ff6b35' },
      { name: 'database', description: 'Questions about databases', color: '#336791' },
      { name: 'authentication', description: 'Questions about user authentication', color: '#4caf50' },
      { name: 'frontend', description: 'Questions about frontend development', color: '#ff4081' },
      { name: 'backend', description: 'Questions about backend development', color: '#795548' },
      { name: 'debugging', description: 'Questions about debugging code', color: '#f44336' }
    ];

    defaultTags.forEach((tag) => {
      this.db.run(
        'INSERT OR IGNORE INTO tags (name, description, color) VALUES (?, ?, ?)',
        [tag.name, tag.description, tag.color],
        (err) => {
          if (err) {
            console.error('Error inserting default tag:', err.message);
          }
        }
      );
    });
  }

  static close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}
