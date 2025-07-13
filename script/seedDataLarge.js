"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'backend/database.sqlite');
const db = new sqlite3_1.default.Database(dbPath);
const getRandomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const seedData = async () => {
    console.log('🌱 Starting to seed the database with comprehensive data...');
    try {
        const hashedPassword = await bcryptjs_1.default.hash('1234', 12);
        const users = [
            { username: 'admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
            { username: 'bob_coder', email: 'bob@example.com', password: hashedPassword, role: 'user' },
            { username: 'charlie_js', email: 'charlie@example.com', password: hashedPassword, role: 'user' },
            { username: 'diana_react', email: 'diana@example.com', password: hashedPassword, role: 'user' },
            { username: 'eve_python', email: 'eve@example.com', password: hashedPassword, role: 'user' },
            { username: 'frank_vue', email: 'frank@example.com', password: hashedPassword, role: 'user' },
            { username: 'grace_angular', email: 'grace@example.com', password: hashedPassword, role: 'user' },
            { username: 'henry_node', email: 'henry@example.com', password: hashedPassword, role: 'user' },
            { username: 'iris_css', email: 'iris@example.com', password: hashedPassword, role: 'user' },
            { username: 'jack_php', email: 'jack@example.com', password: hashedPassword, role: 'user' },
            { username: 'kelly_sql', email: 'kelly@example.com', password: hashedPassword, role: 'user' },
            { username: 'liam_docker', email: 'liam@example.com', password: hashedPassword, role: 'user' },
            { username: 'maya_devops', email: 'maya@example.com', password: hashedPassword, role: 'user' },
            { username: 'noah_mobile', email: 'noah@example.com', password: hashedPassword, role: 'user' },
            { username: 'olivia_ui', email: 'olivia@example.com', password: hashedPassword, role: 'user' }
        ];
        for (const user of users) {
            await new Promise((resolve, reject) => {
                db.run(`INSERT OR IGNORE INTO users (username, email, password, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`, [user.username, user.email, user.password, user.role], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.lastID);
                });
            });
        }
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
            { name: 'debugging', description: 'Questions about debugging code' },
            { name: 'vue.js', description: 'Questions about Vue.js framework' },
            { name: 'angular', description: 'Questions about Angular framework' },
            { name: 'php', description: 'Questions about PHP programming' },
            { name: 'sql', description: 'Questions about SQL and database queries' },
            { name: 'docker', description: 'Questions about Docker containerization' },
            { name: 'git', description: 'Questions about Git version control' },
            { name: 'mongodb', description: 'Questions about MongoDB database' },
            { name: 'express', description: 'Questions about Express.js framework' },
            { name: 'redux', description: 'Questions about Redux state management' },
            { name: 'webpack', description: 'Questions about Webpack bundler' },
            { name: 'testing', description: 'Questions about software testing' },
            { name: 'performance', description: 'Questions about performance optimization' },
            { name: 'security', description: 'Questions about web security' },
            { name: 'mobile', description: 'Questions about mobile development' },
            { name: 'ui-ux', description: 'Questions about UI/UX design' }
        ];
        for (const tag of tags) {
            await new Promise((resolve, reject) => {
                db.run(`INSERT OR IGNORE INTO tags (name, description, created_at) VALUES (?, ?, datetime('now'))`, [tag.name, tag.description], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.lastID);
                });
            });
        }
        const questionTemplates = [
            { title: 'How to handle async/await in React useEffect?', content: '<p>I\'m trying to use async/await inside a useEffect hook in React, but I\'m getting warnings about memory leaks. What\'s the proper way to handle asynchronous operations in useEffect?</p>', tags: ['react', 'javascript'] },
            { title: 'Understanding JavaScript closures with practical examples', content: '<p>Can someone explain closures in JavaScript with real-world examples? I\'m having trouble understanding when and why to use them.</p>', tags: ['javascript'] },
            { title: 'Difference between let, const, and var in JavaScript', content: '<p>What are the key differences between let, const, and var declarations in JavaScript? When should I use each one?</p>', tags: ['javascript'] },
            { title: 'How to properly handle errors in JavaScript promises?', content: '<p>What\'s the best way to handle errors when working with JavaScript promises? Should I use .catch() or try/catch with async/await?</p>', tags: ['javascript'] },
            { title: 'JavaScript array methods: map vs forEach vs filter', content: '<p>Can someone explain the differences between map(), forEach(), and filter() array methods in JavaScript with examples?</p>', tags: ['javascript'] },
            { title: 'Understanding the \'this\' keyword in JavaScript', content: '<p>I\'m confused about how the \'this\' keyword works in JavaScript. Can someone explain it with different contexts?</p>', tags: ['javascript'] },
            { title: 'How to deep clone an object in JavaScript?', content: '<p>What\'s the best way to create a deep copy of an object in JavaScript? I\'ve heard about JSON.parse/stringify but are there better methods?</p>', tags: ['javascript'] },
            { title: 'JavaScript event delegation explained', content: '<p>Can someone explain event delegation in JavaScript and when to use it? What are the benefits?</p>', tags: ['javascript'] },
            { title: 'How to check if a property exists in a JavaScript object?', content: '<p>What are the different ways to check if a property exists in a JavaScript object? Which method is best?</p>', tags: ['javascript'] },
            { title: 'Understanding JavaScript prototypes and inheritance', content: '<p>I\'m struggling to understand prototypes in JavaScript. How does prototypal inheritance work?</p>', tags: ['javascript'] },
            { title: 'TypeScript interface vs type alias - when to use which?', content: '<p>I\'m confused about when to use interface vs type in TypeScript. Can someone explain the differences?</p>', tags: ['typescript', 'javascript'] },
            { title: 'React hooks: useEffect vs useLayoutEffect', content: '<p>What\'s the difference between useEffect and useLayoutEffect in React? When should I use each one?</p>', tags: ['react'] },
            { title: 'How to optimize React component re-renders?', content: '<p>My React app is slow due to unnecessary re-renders. What are the best practices to optimize performance?</p>', tags: ['react', 'performance'] },
            { title: 'State management in React: Context vs Redux', content: '<p>When should I use React Context vs Redux for state management? What are the pros and cons?</p>', tags: ['react', 'redux'] },
            { title: 'React custom hooks best practices', content: '<p>What are the best practices for creating custom hooks in React? Any common pitfalls to avoid?</p>', tags: ['react'] },
            { title: 'How to handle forms in React with validation?', content: '<p>What\'s the best way to handle form validation in React? Should I use a library or build custom validation?</p>', tags: ['react'] },
            { title: 'React Router: protected routes implementation', content: '<p>How do I implement protected routes in React Router? What\'s the best pattern for authentication?</p>', tags: ['react'] },
            { title: 'Testing React components with Jest and Testing Library', content: '<p>What are the best practices for testing React components? How do I test custom hooks?</p>', tags: ['react', 'testing'] },
            { title: 'React performance: memo vs useMemo vs useCallback', content: '<p>When should I use React.memo, useMemo, and useCallback for performance optimization?</p>', tags: ['react', 'performance'] },
            { title: 'How to manage side effects in React functional components?', content: '<p>What are the best patterns for handling side effects in React functional components beyond useEffect?</p>', tags: ['react'] },
            { title: 'CSS Grid vs Flexbox - which one should I use?', content: '<p>I\'m building a responsive layout and not sure whether to use CSS Grid or Flexbox. What are the main differences?</p>', tags: ['css', 'html'] },
            { title: 'How to center a div both horizontally and vertically?', content: '<p>What are all the different ways to center a div both horizontally and vertically in CSS?</p>', tags: ['css'] },
            { title: 'CSS specificity rules explained', content: '<p>Can someone explain CSS specificity and how to calculate it? Why are my styles not applying?</p>', tags: ['css'] },
            { title: 'Responsive design: mobile-first vs desktop-first approach', content: '<p>Which approach is better for responsive design: mobile-first or desktop-first? What are the pros and cons?</p>', tags: ['css', 'mobile'] },
            { title: 'CSS animations vs JavaScript animations', content: '<p>When should I use CSS animations vs JavaScript animations? What are the performance implications?</p>', tags: ['css', 'javascript', 'performance'] },
            { title: 'Understanding CSS box model and box-sizing', content: '<p>Can someone explain the CSS box model and the difference between content-box and border-box?</p>', tags: ['css'] },
            { title: 'CSS preprocessors: Sass vs Less vs Stylus', content: '<p>Which CSS preprocessor should I choose? What are the differences between Sass, Less, and Stylus?</p>', tags: ['css'] },
            { title: 'Modern CSS layout techniques in 2024', content: '<p>What are the modern CSS layout techniques I should be using? How has CSS layout evolved?</p>', tags: ['css'] },
            { title: 'CSS custom properties (variables) best practices', content: '<p>How should I organize and use CSS custom properties effectively in large projects?</p>', tags: ['css'] },
            { title: 'Cross-browser compatibility for CSS', content: '<p>What are the best practices for ensuring CSS works across different browsers?</p>', tags: ['css'] },
            { title: 'Best practices for SQL database design', content: '<p>I\'m designing a database for a social media application. What are the best practices for table relationships and indexing?</p>', tags: ['database', 'sql'] },
            { title: 'How to debug memory leaks in Node.js applications?', content: '<p>My Node.js application consumes more memory over time. How can I identify and fix memory leaks?</p>', tags: ['node.js', 'debugging'] },
            { title: 'REST API authentication with JWT tokens', content: '<p>What\'s the best way to implement JWT-based authentication? Should I use httpOnly cookies or localStorage?</p>', tags: ['api', 'node.js', 'security'] },
            { title: 'MongoDB vs PostgreSQL: which database to choose?', content: '<p>I\'m starting a new project and need to choose between MongoDB and PostgreSQL. What are the trade-offs?</p>', tags: ['database', 'mongodb', 'sql'] },
            { title: 'Node.js error handling best practices', content: '<p>What are the best practices for error handling in Node.js applications? How do I handle async errors?</p>', tags: ['node.js'] },
            { title: 'Scaling Node.js applications: clustering vs load balancing', content: '<p>How do I scale a Node.js application? What\'s the difference between clustering and load balancing?</p>', tags: ['node.js', 'performance'] },
            { title: 'API rate limiting strategies', content: '<p>What are the different strategies for implementing rate limiting in APIs? Which approach is most effective?</p>', tags: ['api', 'security'] },
            { title: 'Database indexing strategies for better performance', content: '<p>How do I design effective database indexes? What are the different types and when to use them?</p>', tags: ['database', 'performance'] },
            { title: 'Microservices vs monolith architecture', content: '<p>When should I choose microservices over a monolithic architecture? What are the trade-offs?</p>', tags: ['api', 'node.js'] },
            { title: 'Caching strategies for web applications', content: '<p>What are the different caching strategies for web applications? When to use Redis vs in-memory caching?</p>', tags: ['performance', 'database'] },
            { title: 'Python list comprehensions vs generator expressions', content: '<p>When should I use list comprehensions vs generator expressions in Python? What are the performance differences?</p>', tags: ['python'] },
            { title: 'Understanding Python decorators with examples', content: '<p>Can someone explain Python decorators with practical examples? How do I create my own decorators?</p>', tags: ['python'] },
            { title: 'Python virtual environments: venv vs conda vs pipenv', content: '<p>Which Python virtual environment tool should I use? What are the differences between venv, conda, and pipenv?</p>', tags: ['python'] },
            { title: 'Async programming in Python: asyncio explained', content: '<p>How does asyncio work in Python? When should I use async/await vs threading?</p>', tags: ['python'] },
            { title: 'Python data structures: when to use list vs tuple vs set', content: '<p>What are the differences between Python lists, tuples, and sets? When should I use each one?</p>', tags: ['python'] },
            { title: 'Docker containerization best practices', content: '<p>What are the best practices for containerizing applications with Docker? How do I optimize Docker images?</p>', tags: ['docker'] },
            { title: 'Git workflow strategies: Gitflow vs GitHub Flow', content: '<p>Which Git workflow should my team use? What are the pros and cons of different branching strategies?</p>', tags: ['git'] },
            { title: 'CI/CD pipeline setup for Node.js applications', content: '<p>How do I set up a proper CI/CD pipeline for a Node.js application? What tools should I use?</p>', tags: ['node.js', 'docker'] },
            { title: 'Environment variables management in production', content: '<p>What\'s the best way to manage environment variables in production applications? Security considerations?</p>', tags: ['security', 'node.js'] },
            { title: 'Monitoring and logging strategies for web applications', content: '<p>What are the best practices for monitoring and logging in production web applications?</p>', tags: ['performance'] },
            { title: 'React Native vs Flutter vs native development', content: '<p>Which mobile development approach should I choose? What are the pros and cons of each?</p>', tags: ['mobile', 'react'] },
            { title: 'Progressive Web Apps vs native mobile apps', content: '<p>When should I build a PWA vs a native mobile app? What are the capabilities and limitations?</p>', tags: ['mobile'] },
            { title: 'Mobile app performance optimization techniques', content: '<p>What are the best practices for optimizing mobile app performance? Both for web and native apps.</p>', tags: ['mobile', 'performance'] },
            { title: 'Accessibility best practices for web applications', content: '<p>What are the essential accessibility practices I should implement? How do I test for accessibility?</p>', tags: ['ui-ux', 'html'] },
            { title: 'Dark mode implementation in web applications', content: '<p>What\'s the best way to implement dark mode? Should I use CSS custom properties or a state management solution?</p>', tags: ['css', 'ui-ux'] },
            { title: 'Responsive images and performance optimization', content: '<p>How do I implement responsive images effectively? What are the best practices for image optimization?</p>', tags: ['performance', 'html'] },
            { title: 'Unit testing vs integration testing vs e2e testing', content: '<p>What\'s the difference between unit, integration, and end-to-end testing? How much of each should I write?</p>', tags: ['testing'] },
            { title: 'Test-driven development (TDD) in practice', content: '<p>How do I implement TDD effectively? What are the benefits and common pitfalls?</p>', tags: ['testing'] },
            { title: 'Mocking external APIs in tests', content: '<p>What\'s the best way to mock external API calls in my tests? Should I use a library or manual mocks?</p>', tags: ['testing', 'api'] },
            { title: 'Web application security: common vulnerabilities', content: '<p>What are the most common web application security vulnerabilities and how do I prevent them?</p>', tags: ['security'] },
            { title: 'HTTPS implementation and SSL certificate management', content: '<p>How do I properly implement HTTPS? What are the best practices for SSL certificate management?</p>', tags: ['security'] },
            { title: 'Input validation and sanitization best practices', content: '<p>What are the best practices for validating and sanitizing user input to prevent attacks?</p>', tags: ['security'] },
            { title: 'Web performance optimization: Core Web Vitals', content: '<p>How do I optimize my website for Core Web Vitals? What metrics should I focus on?</p>', tags: ['performance'] },
            { title: 'Bundle size optimization for JavaScript applications', content: '<p>My JavaScript bundle is too large. What are the best strategies for reducing bundle size?</p>', tags: ['javascript', 'performance', 'webpack'] },
            { title: 'Database query optimization techniques', content: '<p>My database queries are slow. What are the best practices for optimizing query performance?</p>', tags: ['database', 'performance'] },
            { title: 'Webpack configuration for modern JavaScript applications', content: '<p>How do I set up Webpack for a modern JavaScript application? What are the essential plugins and loaders?</p>', tags: ['webpack', 'javascript'] },
            { title: 'Vite vs Webpack: which bundler should I choose?', content: '<p>What are the differences between Vite and Webpack? Which one should I use for my project?</p>', tags: ['webpack'] },
            { title: 'Vue.js Composition API vs Options API', content: '<p>Should I use the Composition API or Options API in Vue.js? What are the advantages of each?</p>', tags: ['vue.js'] },
            { title: 'State management in Vue.js: Vuex vs Pinia', content: '<p>Which state management solution should I use in Vue.js? What are the differences between Vuex and Pinia?</p>', tags: ['vue.js'] },
            { title: 'Angular vs React vs Vue: framework comparison', content: '<p>I need to choose a frontend framework for my project. What are the pros and cons of Angular, React, and Vue?</p>', tags: ['angular', 'react', 'vue.js'] },
            { title: 'Angular dependency injection explained', content: '<p>How does dependency injection work in Angular? What are the best practices for using it effectively?</p>', tags: ['angular'] },
            { title: 'Modern PHP development: best practices in 2024', content: '<p>What are the modern PHP development practices? How has PHP evolved in recent years?</p>', tags: ['php'] },
            { title: 'PHP frameworks comparison: Laravel vs Symfony', content: '<p>Which PHP framework should I choose? What are the differences between Laravel and Symfony?</p>', tags: ['php'] },
            { title: 'Code review best practices for development teams', content: '<p>What are the best practices for conducting effective code reviews? How do I give constructive feedback?</p>', tags: ['debugging'] },
            { title: 'API design principles: REST vs GraphQL', content: '<p>When should I use REST vs GraphQL for my API? What are the trade-offs between these approaches?</p>', tags: ['api'] },
            { title: 'WebSocket implementation for real-time features', content: '<p>How do I implement real-time features using WebSockets? What are the alternatives and when to use each?</p>', tags: ['javascript', 'node.js'] },
            { title: 'Progressive Web App (PWA) development guide', content: '<p>How do I build a Progressive Web App? What are the key features and technologies involved?</p>', tags: ['javascript', 'mobile'] },
            { title: 'Serverless architecture: pros and cons', content: '<p>When should I use serverless architecture? What are the benefits and limitations?</p>', tags: ['node.js'] },
            { title: 'Browser compatibility testing strategies', content: '<p>How do I test my web application across different browsers effectively? What tools should I use?</p>', tags: ['testing'] },
            { title: 'Web scraping ethics and best practices', content: '<p>What are the ethical considerations and best practices for web scraping? How do I do it responsibly?</p>', tags: ['python'] },
            { title: 'Machine learning integration in web applications', content: '<p>How do I integrate machine learning models into web applications? What are the best practices?</p>', tags: ['python', 'javascript'] },
            { title: 'Internationalization (i18n) in web applications', content: '<p>How do I implement internationalization in my web application? What are the best libraries and practices?</p>', tags: ['javascript', 'react'] },
            { title: 'Web Workers for background processing', content: '<p>When and how should I use Web Workers? What types of tasks are suitable for background processing?</p>', tags: ['javascript', 'performance'] },
            { title: 'CSS-in-JS vs traditional CSS approaches', content: '<p>Should I use CSS-in-JS solutions like styled-components or stick with traditional CSS? What are the trade-offs?</p>', tags: ['css', 'react'] },
            { title: 'Database migration strategies and best practices', content: '<p>What are the best practices for handling database migrations in production? How do I minimize downtime?</p>', tags: ['database'] },
            { title: 'API documentation: tools and best practices', content: '<p>What are the best tools and practices for creating comprehensive API documentation?</p>', tags: ['api'] },
            { title: 'Distributed systems: handling eventual consistency', content: '<p>How do I handle eventual consistency in distributed systems? What are the common patterns and pitfalls?</p>', tags: ['database', 'api'] },
            { title: 'Frontend build optimization for large applications', content: '<p>My frontend build is taking too long. What are the best strategies for optimizing build performance?</p>', tags: ['webpack', 'performance'] },
            { title: 'Legacy code modernization strategies', content: '<p>How do I approach modernizing a large legacy codebase? What are the safest strategies to minimize risk?</p>', tags: ['debugging'] },
            { title: 'Real-time collaboration features implementation', content: '<p>How do I implement real-time collaboration features like Google Docs? What technologies and patterns should I use?</p>', tags: ['javascript', 'node.js'] },
            { title: 'Headless CMS vs traditional CMS comparison', content: '<p>When should I use a headless CMS vs a traditional CMS? What are the benefits and drawbacks?</p>', tags: ['api'] },
            { title: 'Error monitoring and alerting in production', content: '<p>What are the best practices for error monitoring and alerting in production applications?</p>', tags: ['debugging', 'node.js'] },
            { title: 'Cross-platform desktop apps: Electron vs alternatives', content: '<p>Should I use Electron for desktop apps or are there better alternatives? What are the trade-offs?</p>', tags: ['javascript'] }
        ];
        const shuffledQuestions = questionTemplates.sort(() => 0.5 - Math.random()).slice(0, 120);
        const questionIds = [];
        for (let i = 0; i < shuffledQuestions.length; i++) {
            const question = shuffledQuestions[i];
            const randomUserId = getRandomInt(1, users.length);
            const randomVotes = getRandomInt(-2, 50);
            const randomViews = getRandomInt(10, 1000);
            const questionId = await new Promise((resolve, reject) => {
                db.run(`INSERT INTO questions (title, description, user_id, votes, views, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))`, [question.title, question.content, randomUserId, randomVotes, randomViews, getRandomInt(0, 30), getRandomInt(0, 30)], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.lastID);
                });
            });
            questionIds.push(questionId);
            for (const tagName of question.tags) {
                const tagId = await new Promise((resolve, reject) => {
                    db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
                        if (err)
                            reject(err);
                        else
                            resolve(row?.id);
                    });
                });
                if (tagId) {
                    await new Promise((resolve, reject) => {
                        db.run('INSERT INTO question_tags (question_id, tag_id) VALUES (?, ?)', [questionId, tagId], function (err) {
                            if (err)
                                reject(err);
                            else
                                resolve(this.lastID);
                        });
                    });
                }
            }
        }
        const answeredQuestionIds = questionIds.slice(0, 80);
        const answerTemplates = [
            'Great question! Here\'s how I would approach this problem:',
            'I\'ve encountered this issue before. The solution that worked for me was:',
            'This is a common problem. Here are a few different approaches:',
            'I recommend checking out the official documentation, but here\'s a quick solution:',
            'You\'re on the right track! However, there\'s a more efficient way:',
            'I had the same issue recently. After some research, I found that:',
            'This depends on your specific use case, but generally:',
            'There are several ways to handle this. The most popular approach is:',
            'I\'ve been working with this technology for years. My recommendation is:',
            'This is actually simpler than it seems. Here\'s a step-by-step approach:'
        ];
        const codeExamples = [
            '<pre><code>// Example implementation\nfunction example() {\n  return "This is a code example";\n}</code></pre>',
            '<pre><code>// Alternative approach\nconst solution = () => {\n  // Your code here\n};</code></pre>',
            '<pre><code>/* CSS Example */\n.container {\n  display: flex;\n  justify-content: center;\n}</code></pre>',
            '<pre><code># Python example\ndef solution():\n    return "example"</code></pre>',
            '<pre><code>// JavaScript ES6+\nconst result = await fetch(\'/api/data\');\nconst data = await result.json();</code></pre>'
        ];
        for (const questionId of answeredQuestionIds) {
            const answerCount = getRandomInt(1, 3);
            for (let i = 0; i < answerCount; i++) {
                const randomAnswerTemplate = answerTemplates[getRandomInt(0, answerTemplates.length - 1)];
                const randomCodeExample = Math.random() > 0.5 ? codeExamples[getRandomInt(0, codeExamples.length - 1)] : '';
                const randomUserId = getRandomInt(1, users.length);
                const randomVotes = getRandomInt(0, 25);
                const isAccepted = i === 0 && Math.random() > 0.7;
                const answerContent = `<p>${randomAnswerTemplate}</p>${randomCodeExample}<p>Hope this helps! Let me know if you need any clarification.</p>`;
                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO answers (content, question_id, user_id, votes, is_accepted, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))`, [answerContent, questionId, randomUserId, randomVotes, isAccepted, getRandomInt(0, 25), getRandomInt(0, 25)], function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve(this.lastID);
                    });
                });
            }
        }
        console.log('✅ Database seeded successfully with comprehensive data!');
        console.log('📊 Added:');
        console.log(`   - ${users.length} users`);
        console.log(`   - ${tags.length} tags`);
        console.log(`   - ${questionIds.length} questions`);
        console.log(`   - ${answeredQuestionIds.length} questions with answers`);
        console.log(`   - ${questionIds.length - answeredQuestionIds.length} unanswered questions`);
        console.log(`   - Approximately ${answeredQuestionIds.length * 1.8} answers (1-3 per answered question)`);
        console.log('\n🔐 Test user credentials (all use password: password123):');
        console.log('   - alice_dev (Admin)');
        console.log('   - bob_coder, charlie_js, diana_react, eve_python');
        console.log('   - frank_vue, grace_angular, henry_node, iris_css');
        console.log('   - jack_php, kelly_sql, liam_docker, maya_devops');
        console.log('   - noah_mobile, olivia_ui');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        db.close();
    }
};
seedData();
