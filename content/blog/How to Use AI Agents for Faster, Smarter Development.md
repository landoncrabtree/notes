---
title: How to Use AI Agents for Faster, Smarter Development
draft: false
tags:
  - ai
  - coding
---
AI is evolving rapidly, excelling not only at answering complex questions but also at programming. Now more than ever, creating an app or product no longer requires deep industry experience or technical expertise. With the right tools and an understanding of how to leverage them effectively, development becomes more accessible. This short blog highlights resources for increasing productivity while minimizing the need for extensive coding.

A coding assistant is an essential starting point. Several options are available, but this post will focus on some of the most notable ones as of February 2025.

- [Cursor](https://www.cursor.com/) - A fork of VSCode with AI integrations. Better autocomplete (Cursor Tab), a ChatGPT-like interface built in, and Composer: an autonomous agent that can create/edit multiple files and execute commands.
- [Cline](https://github.com/cline/cline) - A VSCode extension that provides an autonomous coding agent that can create and edit multiple files, execute commands, use the browser, and more. Also has "Plan" and "Act" mode, so you can plan features and the implementation without actually modifying any files.
- [RooCode](https://github.com/RooVetGit/Roo-Code) - A fork of Cline with custom modes (QA engineers, product managers, UI/UX designers, etc), custom prompt support, and more to provide more control over your agents.
- [GitHub Copilot](https://github.com/features/copilot) - A VSCode extension and CLI program (`gh copilot`) with similar features to that of Cursor. 
- [OpenHands](https://github.com/All-Hands-AI/OpenHands) - A docker container that gives users a web interface to interact with an AI agent that can create/edit files, execute commands, and self-correct (run a program, any errors? feed back to the agent, repeat).

The underlying functionality of these AI-powered agents remains consistent across different options. AI models operate within a "context window," typically around 120,000 tokens. When given a task such as "Create a function that does X," the agent processes the request by incorporating relevant context. For instance, with Cursor, it is possible to reference specific files or webpages to provide additional context for the response.

![[cursor_context 1.png]]

This significantly accelerates the coding process for several reasons:
1. **Reduced Context Switching:** There’s no need to constantly switch between tabs or copy and paste from different files. Everything happens within the IDE (VSCode, Cursor, etc.), streamlining workflow and reducing distractions.
2. **Autonomy:** Tools like Cursor, Cline, and Roo offer a high degree of autonomy. They can create and edit multiple files, execute commands (such as `npm install <package>`), and even access the internet to retrieve documentation, reducing manual effort.
3. **Optimized Prompting:** Effective responses depend on well-structured prompts. These agents are configured with optimized prompts by default. With Roo, for example, different modes provide specialized prompts tailored for UI development, testing, and other tasks—eliminating the need to fine-tune prompts manually.

However, the limitations of the context window must be considered. In large codebases with thousands of lines per file, or after numerous agent tasks, the context window gradually fills up, leading to a loss of earlier context. For example, an initial instruction such as _"You are designing a Flutter app, use clean UI and avoid default Material styles"_ may eventually fall out of scope. As a result, the agent may revert to using default Material styles once that instruction is no longer within its context. To mitigate this, leveraging a **memory bank** is essential. This typically involves creating a dedicated directory at the root of the project (e.g., `/documentation`, `/memory_bank`, etc.), structured in a way that ensures critical project guidelines and preferences remain accessible throughout development. More details on implementing a memory bank can be found in [this guide](https://github.com/nickbaumann98/cline_docs/blob/main/prompting/custom%20instructions%20library/cline-memory-bank.md).

- `projectBrief.md` -> Defines core requirements and goals
- `productContext.md` -> Why this project exists and what it aims to do
- `activeContext.md` -> Current work focus, recent changes, next steps, and considerations
- `systemPatterns.md` -> System architecture, key technical decisions, design patterns, component relationships
- `techContext.md` -> Technologies used, development setup, dependencies
- `progress.md` -> What works, what's left to build, known issues

As the project expands, additional contexts can be incorporated, such as API documentation, testing strategies, and deployment procedures. Regular updates to the memory bank are crucial, especially when significant changes are made. The agent should be instructed to refresh these documents periodically to ensure they reflect the most current state of the project. Once the context window begins to fill up, referencing the entire `documentation` folder allows the AI to regain a comprehensive understanding of the project's scope and objectives. This approach helps maintain consistency and prevents the loss of critical project guidelines over time.

With a clear understanding of what these agents can do, how their context functions, and how to maintain accuracy throughout a project, the focus now shifts to maximizing productivity—creating more while coding less. Just like human developers, AI agents perform best when tasks are broken down into manageable components. A broad request like _"Create an Instagram app clone"_ is too vague and complex for both humans and AI (at least with current capabilities). The likely outcome would be a basic frontend with a single screen and no meaningful user experience. Instead, breaking the project into smaller, well-defined tasks leads to better results. How could an Instagram clone be divided into structured tasks?

- Create a register screen that takes a username, email, and password
- Create a login screen that takes an email and password
- Create a profile screen that shows the users posts in a grid and also the users username, profile picture, number of followers, and number of following
- Create a search screen with a search input 
- Create a home screen with a scrollable section of posts

Asking the agents to handle tasks one at a time leads to much better outcomes and brings the project closer to the desired end goal. This is where planning features, such as those offered by Cline or Roo, become incredibly helpful. They allow for the structured breakdown of problems, which is essential for complex projects. For example, a prompt like _"According to `@\documentation`, break my project into tasks"_ can be a great starting point. From there, tasks can be refined and expanded with further prompts, like _"Break those tasks into subtasks"_. By completing one task at a time, thoroughly testing it, and moving on to the next, the project progresses in an organized and efficient manner. This iterative approach, backed by the agent’s ability to stay on track with the project context, leads to higher quality results and smoother development.

### Additional Tips

- To preserve the context window and keep it focused on the most relevant information, you can use `.cursorignore`, `.clineignore`, or similar files, following the same syntax as `.gitignore`. This is especially important for excluding sensitive files such as credentials or API keys, ensuring they are not inadvertently sent to external servers like Anthropic.
- Cursor supports [Project Rules](https://docs.cursor.com/context/rules-for-ai) and Global Rules, which allow users to amend the system prompt. Similarly, Cline and Roo offer `.clinerules`. These rules ensure consistent guidelines for the agent’s responses. Some example rules include:
	- Use only camelCase for file and variable naming conventions.
	- Never use the `unwrap` keyword.
	- Generate unit tests for all new functions created.
	- Update `@\documentation` when significant changes are made and tasks are accomplished.
	- Additional prompting rules can be found [here](https://github.com/PatrickJS/awesome-cursorrules).
- For integrating AI agents into an existing project, tools like [Repomix](https://github.com/yamadashy/repomix) or [Yek](https://github.com/bodo-run/yek) can help summarize your existing codebase. Once summarized, the output can be fed to a large-context-window model, such as Gemini, which can generate the necessary files for your memory bank. This enables seamless integration without needing to retrain the agent or overwhelm the context window.


