import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend/database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedData = async () => {
  console.log('🌱 Starting to seed the database...');

  try {
    // Hash passwords for dummy users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert dummy users
    const users = [
      {
        username: 'alice_dev',
        email: 'alice@example.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        username: 'bob_coder',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'charlie_js',
        email: 'charlie@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'diana_react',
        email: 'diana@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'eve_python',
        email: 'eve@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'frank_vue',
        email: 'frank@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'grace_angular',
        email: 'grace@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'henry_node',
        email: 'henry@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'iris_css',
        email: 'iris@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'jack_php',
        email: 'jack@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'kelly_sql',
        email: 'kelly@example.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'liam_docker',
        email: 'liam@example.com',
        password: hashedPassword,
        role: 'user'
      }
    ];

    // Insert users
    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, email, password, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [user.username, user.email, user.password, user.role],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Insert dummy tags
    const tags = [
      { name: 'javascript', description: 'Questions about JavaScript programming language' },
      { name: 'react', description: 'Questions about React.js library' },
      { name: 'typescript', description: 'Questions about TypeScript' },
      { name: 'node.js', description: 'Questions about Node.js runtime' },
      { name: 'css', description: 'Questions about CSS styling' },
      { name: 'html', description: 'Questions about HTML markup' },
      { name: 'python', description: 'Questions about Python programming' },
      { name: 'database', description: 'Questions about databases' },
      { name: 'api', description: 'Questions about APIs and web services' },
      { name: 'debugging', description: 'Questions about debugging code' }
    ];

    for (const tag of tags) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO tags (name, description, created_at) VALUES (?, ?, datetime('now'))`,
          [tag.name, tag.description],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Insert questions
    const questions = [
      {
        title: 'How to handle async/await in React useEffect?',
        content: '<p>I\'m trying to use async/await inside a useEffect hook in React, but I\'m getting warnings about memory leaks. What\'s the proper way to handle asynchronous operations in useEffect?</p><pre><code>useEffect(() => {\n  async function fetchData() {\n    const response = await fetch(\'/api/data\');\n    const data = await response.json();\n    setState(data);\n  }\n  fetchData();\n}, []);</code></pre><p>Is this the correct approach?</p>',
        user_id: 2,
        votes: 15,
        tags: ['react', 'javascript']
      },
      {
        title: 'TypeScript interface vs type alias - when to use which?',
        content: '<p>I\'m confused about when to use <code>interface</code> vs <code>type</code> in TypeScript. Can someone explain the differences and provide guidelines on when to use each?</p><p>For example:</p><pre><code>interface User {\n  id: number;\n  name: string;\n}\n\n// vs\n\ntype User = {\n  id: number;\n  name: string;\n};</code></pre>',
        user_id: 3,
        votes: 23,
        tags: ['typescript', 'javascript']
      },
      {
        title: 'Best practices for SQL database design',
        content: '<p>I\'m designing a database for a social media application. What are the best practices I should follow for:</p><ul><li>Table relationships</li><li>Indexing strategies</li><li>Normalization vs denormalization</li><li>Handling user-generated content</li></ul><p>Any recommendations for tools or resources would be appreciated!</p>',
        user_id: 4,
        votes: 8,
        tags: ['database']
      },
      {
        title: 'CSS Grid vs Flexbox - which one should I use?',
        content: '<p>I\'m building a responsive layout and I\'m not sure whether to use CSS Grid or Flexbox. What are the main differences and when should I choose one over the other?</p><p>My layout needs to be responsive and work well on mobile devices.</p>',
        user_id: 5,
        vote_count: 12,
        tags: ['css', 'html']
      },
      {
        title: 'How to debug memory leaks in Node.js applications?',
        content: '<p>My Node.js application seems to be consuming more and more memory over time. How can I identify and fix memory leaks?</p><p>I\'ve tried using <code>--inspect</code> flag but I\'m not sure how to interpret the results.</p>',
        user_id: 1,
        votes: 19,
        tags: ['node.js', 'debugging']
      },
      {
        title: 'REST API authentication with JWT tokens',
        content: '<p>I\'m building a REST API and want to implement JWT-based authentication. What\'s the best way to:</p><ol><li>Store JWT tokens securely on the client</li><li>Handle token refresh</li><li>Implement logout functionality</li></ol><p>Should I use httpOnly cookies or localStorage?</p>',
        user_id: 2,
        votes: 31,
        tags: ['api', 'node.js', 'javascript']
      }
    ];

    // Insert questions and get their IDs
    const questionIds = [];
    for (const question of questions) {
      const questionId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO questions (title, description, user_id, votes, created_at, updated_at) 
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [question.title, question.content, question.user_id, question.votes],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID as number);
          }
        );
      });
      questionIds.push(questionId);

      // Add tags to questions
      for (const tagName of question.tags) {
        // Get tag ID
        const tagId = await new Promise<number>((resolve, reject) => {
          db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row: any) => {
            if (err) reject(err);
            else resolve(row.id);
          });
        });

        // Insert question_tags relationship
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO question_tags (question_id, tag_id) VALUES (?, ?)',
            [questionId, tagId],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      }
    }

    // Insert dummy answers
    const answers = [
      {
        content: '<p>You\'re on the right track! However, there are a few best practices to follow:</p><ol><li><strong>Use a cleanup function:</strong></li></ol><pre><code>useEffect(() => {\n  let isMounted = true;\n  \n  async function fetchData() {\n    try {\n      const response = await fetch(\'/api/data\');\n      const data = await response.json();\n      if (isMounted) {\n        setState(data);\n      }\n    } catch (error) {\n      console.error(error);\n    }\n  }\n  \n  fetchData();\n  \n  return () => {\n    isMounted = false;\n  };\n}, []);</code></pre><p>This prevents setting state on unmounted components.</p>',
        question_id: questionIds[0],
        user_id: 1,
        vote_count: 12,
        is_accepted: true
      },
      {
        content: '<p>Another approach is to use a custom hook for better reusability:</p><pre><code>function useAsyncEffect(effect, deps) {\n  useEffect(() => {\n    const abortController = new AbortController();\n    \n    effect(abortController.signal);\n    \n    return () => abortController.abort();\n  }, deps);\n}\n\n// Usage:\nuseAsyncEffect(async (signal) => {\n  const response = await fetch(\'/api/data\', { signal });\n  const data = await response.json();\n  setState(data);\n}, []);</code></pre>',
        question_id: questionIds[0],
        user_id: 4,
        vote_count: 8,
        is_accepted: false
      },
      {
        content: '<p>Great question! Here are the main differences:</p><h3>Interface</h3><ul><li>Can be extended and merged</li><li>Better for object shapes</li><li>Open for extension</li></ul><h3>Type Alias</h3><ul><li>More flexible (unions, primitives, etc.)</li><li>Cannot be reopened</li><li>Better for complex types</li></ul><p><strong>Use interface for:</strong> Object contracts, when you might extend later</p><p><strong>Use type for:</strong> Union types, computed types, when you want to prevent extension</p>',
        question_id: questionIds[1],
        user_id: 1,
        vote_count: 18,
        is_accepted: true
      },
      {
        content: '<p>For CSS Grid vs Flexbox, here\'s a simple rule:</p><ul><li><strong>Use Flexbox</strong> for 1-dimensional layouts (row OR column)</li><li><strong>Use CSS Grid</strong> for 2-dimensional layouts (row AND column)</li></ul><p>For responsive design, Grid is often better as it gives you more control over both axes. Here\'s a basic responsive grid:</p><pre><code>.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1rem;\n}</code></pre>',
        question_id: questionIds[3],
        user_id: 2,
        vote_count: 9,
        is_accepted: true
      },
      {
        content: '<p>For JWT authentication, here\'s what I recommend:</p><ol><li><strong>Storage:</strong> Use httpOnly cookies for the refresh token, and memory/sessionStorage for access tokens</li><li><strong>Refresh:</strong> Implement automatic refresh before token expiry</li><li><strong>Logout:</strong> Clear tokens and blacklist them on the server</li></ol><p>Example refresh logic:</p><pre><code>// Auto-refresh before expiry\nsetTimeout(() => {\n  refreshToken();\n}, tokenExpiry - 60000); // Refresh 1 min before expiry</code></pre>',
        question_id: questionIds[5],
        user_id: 5,
        vote_count: 15,
        is_accepted: true
      }
    ];

    for (const answer of answers) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO answers (content, question_id, user_id, votes, is_accepted, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [answer.content, answer.question_id, answer.user_id, answer.vote_count, answer.is_accepted],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('📊 Added:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${tags.length} tags`);
    console.log(`   - ${questions.length} questions`);
    console.log(`   - ${answers.length} answers`);
    console.log('\n🔐 Test user credentials:');
    console.log('   Username: alice_dev, Password: password123 (Admin)');
    console.log('   Username: bob_coder, Password: password123 (User)');
    console.log('   Username: charlie_js, Password: password123 (User)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    db.close();
  }
};

seedData();
