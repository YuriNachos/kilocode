# Slash Commands

Kilo Code provides powerful slash commands that you can use directly in the chat to perform specific actions. These commands help you work more efficiently by automating common tasks.

## Available Slash Commands

### `/newtask`

Start a new task with preloaded context from the current conversation.

**When to use:**

- When you want to branch off into a new task while keeping the context of your current work
- When delegating a specific aspect of your work to a separate task
- When you want to continue work in a different mode

**How it works:**
The `/newtask` command creates a new task with context from the current conversation. You'll see a preview of the context that will be carried over, and you can choose to create the new task or continue in the current conversation.

**Usage:**

```
/newtask
```

You can also add specific instructions:

```
/newtask Continue working on the API integration
```

**What gets included:**

- What has been accomplished in the current task
- Specific next steps for the new task
- Critical information needed to continue the work
- How the new task relates to the overall workflow

### `/smol` (or `/condense`)

Create a detailed summary of the current conversation to compact your context window while retaining key information.

**When to use:**

- When your context window is getting full and you want to continue working
- When you want to summarize the conversation so far
- When you need to preserve important context before starting a new session

**How it works:**
The `/smol` command generates a comprehensive summary of your conversation, including:

- Previous conversation overview
- Current work details
- Key technical concepts discussed
- Relevant files and code changes
- Problems solved and troubleshooting efforts
- Pending tasks and next steps

**Usage:**

```
/smol
```

You can add specific instructions for what to focus on:

```
/smol Focus on the API authentication changes
```

**Difference from `/newtask`:**

- `/smol` **compacts** the current conversation into a summary to reduce context usage
- `/newtask` **creates a new task** with preloaded context while keeping the current task active

### `/newrule`

Create a new Kilo rule file in your project's `.kilocode/rules` directory.

**When to use:**

- When you want to document project-specific conventions for Kilo to follow
- When you want to save coding patterns or architectural decisions for future sessions
- When you want to customize how Kilo interacts with your specific project

**How it works:**
The `/newrule` command helps you create a markdown file with project-specific guidelines. Kilo will analyze your conversation and create appropriate rules based on what was discussed.

**Usage:**

```
/newrule
```

You can specify what the rule should focus on:

```
/newrule Create rules for our API testing approach
```

**What can be included:**

- Coding conventions and style preferences
- Architectural patterns to follow
- Communication style preferences
- Testing strategies
- Naming conventions
- Technology stack preferences

### `/reportbug`

Submit a bug report directly to the Kilo Code GitHub repository.

**When to use:**

- When you encounter a bug or issue with Kilo Code
- When you want to report unexpected behavior
- When you have a feature request to submit

**How it works:**
The `/reportbug` command guides you through providing all necessary information for a bug report, then creates an issue on [GitHub](https://github.com/Kilo-Org/kilocode/issues).

**Usage:**

```
/reportbug
```

Kilo will ask you for:

- A concise title for the bug
- A detailed description including:
    - What happened
    - What you expected to happen
    - Steps to reproduce (if applicable)

## Custom Workflows

In addition to the built-in slash commands, you can create your own custom workflows as markdown files in `.kilocode/workflows/`. These can be invoked using:

```
/workflow-name.md
```

For more information on creating workflows, see [Workflows](/agent-behavior/workflows).

## Tips for Using Slash Commands

1. **Be specific with additional instructions** - You can add context after any slash command to guide Kilo's response

2. **Use `/newtask` for branching work** - Perfect for when you want to explore a different approach while keeping your current work intact

3. **Use `/smol` regularly** - Compacting your context helps maintain performance and reduces token usage

4. **Create rules with `/newrule`** - Document your project conventions so Kilo can provide more consistent help across sessions

5. **Combine with modes** - Slash commands work in all modes, so you can use them whether you're in Code, Architect, Ask, or Debug mode
