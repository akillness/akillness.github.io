---
title: 🤖 If you're looking to build agentic GenAI applications
description: LLM, Application
categories:
- LLM & Language Models
- Industry & Applications
tags:
- application-development
- design-pattern
- llm
- language-model
date: 2024-08-05 15:00:00 +0800
mermaid: true
---
## Agentic Application Design Patterns: Building Intelligent AI Systems

*Curiosity:* How do we design agentic GenAI applications? What patterns enable agents to think, plan, and collaborate effectively?

**Agentic AI** is evolving rapidly, opening possibilities for a new paradigm of applications. When developing agentic applications, choosing the right design patterns is crucial for success.

![ The 4 key agentic design patterns ](/assets/img/llm/the-4-key-agentic-design-patterns.jpeg){: .light .shadow .rounded-10 w='1212' h='668' }

### Design Patterns Overview

```mermaid
graph TB
    A[Agentic Design Patterns] --> B[Reflection]
    A --> C[Tool Use]
    A --> D[Planning]
    A --> E[Multi-Agent Collaboration]
    
    B --> B1[Self-Review]
    B --> B2[Improvement]
    
    C --> C1[Web Search]
    C --> C2[Code Execution]
    C --> C3[Functions]
    
    D --> D1[Multi-Step Plans]
    D --> D2[Goal Achievement]
    
    E --> E1[Task Division]
    E --> E2[Collaboration]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style C fill:#d4edda
    style D fill:#f8d7da
    style E fill:#e7d4f8
```

### The 4 Key Design Patterns

| Pattern | Description | Use Case | Complexity |
|:--------|:------------|:---------|:-----------|
| **Reflection** | LLM reviews its own work | Quality improvement | ⭐ Low |
| **Tool Use** | LLM equipped with tools | Information gathering | ⭐⭐ Medium |
| **Planning** | Multi-step plan execution | Complex tasks | ⭐⭐⭐ High |
| **Multi-Agent** | Multiple agents collaborate | Large-scale problems | ⭐⭐⭐⭐ Very High |

### 1. Reflection Pattern

*Retrieve:* The LLM reviews its own work to identify ways to improve.

**How It Works**:
- Agent generates initial output
- Reviews and critiques its own work
- Identifies improvements
- Refines output

**Architecture**:

```mermaid
graph LR
    A[Input] --> B[Generate Output]
    B --> C[Review Output]
    C --> D{Needs<br/>Improvement?}
    D -->|Yes| B
    D -->|No| E[Final Output]
    
    style B fill:#e1f5ff
    style C fill:#fff3cd
    style E fill:#d4edda
```

**Example**:

```python
# Reflection pattern
def reflection_agent(query):
    # Initial generation
    output = llm.generate(query)
    
    # Review
    critique = llm.generate(
        f"Review this output and suggest improvements:\n{output}"
    )
    
    # Refine if needed
    if "improve" in critique.lower():
        output = llm.generate(
            f"Original: {output}\nImprovements: {critique}\nGenerate improved version"
        )
    
    return output
```

**Benefits**:
- ✅ Self-improvement
- ✅ Quality enhancement
- ✅ Error correction
- ✅ Iterative refinement

> **Article**: [Reflection Pattern](https://www.deeplearning.ai/the-batch/agentic-design-patterns-part-2-reflection/?ref=dl-staging-website.ghost.io)
{: .prompt-tip}

### 2. Tool Use Pattern

*Innovate:* The LLM is equipped with tools to gather information, take action, or process data.

**Tools Available**:
- 🔍 Web search
- 💻 Code execution
- 📊 Data processing
- 🔧 API calls
- 📁 File operations

**Architecture**:

```mermaid
graph TB
    A[User Query] --> B[Agent]
    B --> C{Need Tool?}
    C -->|Yes| D[Select Tool]
    D --> E[Execute Tool]
    E --> F[Process Result]
    F --> B
    C -->|No| G[Generate Response]
    
    style B fill:#e1f5ff
    style D fill:#fff3cd
    style G fill:#d4edda
```

**Example**:

```python
# Tool use pattern
tools = {
    "web_search": web_search_tool,
    "code_exec": code_execution_tool,
    "calculator": calculator_tool
}

def tool_use_agent(query):
    # Agent decides which tools to use
    tool_selection = llm.select_tools(query, available_tools=tools)
    
    results = []
    for tool_name in tool_selection:
        tool = tools[tool_name]
        result = tool.execute(query)
        results.append(result)
    
    # Generate response using tool results
    return llm.generate(query, context=results)
```

**Benefits**:
- ✅ Extended capabilities
- ✅ Real-time information
- ✅ Action execution
- ✅ Data processing

> **Article**: [Tool Use Pattern](https://www.deeplearning.ai/the-batch/agentic-design-patterns-part-3-tool-use/?ref=dl-staging-website.ghost.io)
{: .prompt-tip}

### 3. Planning Pattern

*Retrieve:* The LLM devises and follows a multi-step plan to achieve a goal.

**Process**:
1. Analyze goal
2. Create step-by-step plan
3. Execute plan steps
4. Monitor progress
5. Adjust if needed

**Architecture**:

```mermaid
graph TB
    A[Goal] --> B[Create Plan]
    B --> C[Step 1]
    C --> D[Step 2]
    D --> E[Step N]
    E --> F{Goal<br/>Achieved?}
    F -->|No| B
    F -->|Yes| G[Complete]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style G fill:#d4edda
```

**Example**:

```python
# Planning pattern
def planning_agent(goal):
    # Create plan
    plan = llm.generate(
        f"Create a step-by-step plan to achieve: {goal}"
    )
    
    steps = parse_plan(plan)
    
    # Execute plan
    results = []
    for step in steps:
        result = llm.execute_step(step, context=results)
        results.append(result)
        
        # Check if goal achieved
        if check_goal_achieved(goal, results):
            break
    
    return compile_results(results)
```

**Use Cases**:
- Essay writing (outline → research → draft)
- Complex problem solving
- Multi-step workflows
- Project management

> **Article**: [Planning Pattern](https://www.deeplearning.ai/the-batch/agentic-design-patterns-part-4-planning/?ref=dl-staging-website.ghost.io)
{: .prompt-tip}

### 4. Multi-Agent Collaboration Pattern

*Innovate:* Multiple AI agents work together, dividing tasks and discussing ideas.

**Benefits**:
- ✅ Task specialization
- ✅ Better solutions
- ✅ Parallel processing
- ✅ Collective intelligence

**Architecture**:

```mermaid
graph TB
    A[Task] --> B[Coordinator]
    B --> C[Agent 1]
    B --> D[Agent 2]
    B --> E[Agent N]
    
    C --> F[Results 1]
    D --> G[Results 2]
    E --> H[Results N]
    
    F --> I[Discussion]
    G --> I
    H --> I
    I --> J[Final Solution]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style I fill:#d4edda
    style J fill:#f8d7da
```

**Example**:

```python
# Multi-agent collaboration
agents = {
    "researcher": ResearchAgent(),
    "writer": WriterAgent(),
    "editor": EditorAgent()
}

def multi_agent_system(task):
    # Coordinator divides task
    subtasks = coordinator.divide_task(task, agents)
    
    # Agents work in parallel
    results = {}
    for agent_name, subtask in subtasks.items():
        agent = agents[agent_name]
        results[agent_name] = agent.process(subtask)
    
    # Discussion and synthesis
    final_result = coordinator.synthesize(results)
    return final_result
```

**Use Cases**:
- Complex research projects
- Content creation teams
- Software development
- Problem-solving teams

> **Article**: [Multi-Agent Collaboration](https://www.deeplearning.ai/the-batch/agentic-design-patterns-part-5-multi-agent-collaboration/?ref=dl-staging-website.ghost.io)
{: .prompt-tip}

### Pattern Selection Guide

```mermaid
graph TD
    A[Agentic Application Need] --> B{Task Complexity?}
    B -->|Simple| C[Reflection]
    B -->|Medium| D[Tool Use]
    B -->|Complex| E[Planning]
    B -->|Very Complex| F[Multi-Agent]
    
    C --> C1[Self-Review]
    D --> D1[External Tools]
    E --> E1[Multi-Step]
    F --> F1[Collaboration]
    
    style A fill:#e1f5ff
    style C fill:#fff3cd
    style D fill:#d4edda
    style E fill:#f8d7da
    style F fill:#e7d4f8
```

### Combining Patterns

*Innovate:* Patterns can be combined for more powerful systems.

**Example Combinations**:
- **Reflection + Tool Use**: Agent uses tools, then reflects on results
- **Planning + Multi-Agent**: Multiple agents execute a coordinated plan
- **All Patterns**: Comprehensive agentic system

### Key Takeaways

*Retrieve:* Four key design patterns—Reflection, Tool Use, Planning, and Multi-Agent Collaboration—provide frameworks for building agentic GenAI applications.

*Innovate:* By understanding and applying these patterns, you can design intelligent agentic systems that think, plan, use tools, and collaborate to solve complex problems.

*Curiosity → Retrieve → Innovation:* Start with curiosity about agentic design, retrieve insights from these patterns, and innovate by combining them to build powerful agentic applications.

> **Complete Blog Series**: <https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/?ref=dl-staging-website.ghost.io>
{: .prompt-info}

**Next Steps**:
- Study each pattern in detail
- Choose patterns for your use case
- Implement and test
- Combine patterns as needed
