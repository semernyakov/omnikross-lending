---
description: Perplexity AI best practices and command templates
---

# Perplexity AI Best Practices Workflow

This workflow provides optimized commands and templates for using Perplexity AI effectively across different use cases.

## General Best Practices

- **Be specific and structured** with desired output formats (lists, tables, etc.)
- **Use Focus modes**: Academic, Math, Writing, Web, Video, Social
- **Prevent hallucinations**: Add "If no reliable sources, state clearly"
- **Iterate**: Refine with sequential queries and test variations
- **Use custom instructions**: Create persistent Spaces with role-based rules

## Research Commands

### Academic Research

```text
Focus: Academic. From peer-reviewed sources since 2023, summarize key findings on [topic]. For each:
- Headline
- 1-2 sentence summary
- Citation
If no recent data, state explicitly.
```

### News Research

```text
Latest [topic] news stories from past 5 days with high thought-leadership potential. Include: headline, summary, why it matters. Parse URLs from results.
```

## Coding Commands

### Code Development

```text
Focus: Web. In [language] using [framework], write a secure [feature] endpoint. Include:
- Code
- Error handling
- Tests
Cite docs if used. Explain step-by-step.
```

### Code Refactoring

```text
Refactor the previous code for [new requirement] and add [integration].
```

## Writing Commands

### Content Creation

```text
Focus: Writing. Rewrite this [paste text] as a [word count]-word [content type] for [audience]: engaging tone, bold key insights, SEO-optimized. Structure: intro, [number] sections, conclusion.
```

### Role-based Writing

```text
Pretend you're a [role] [action]. Ask [number] [topic] questions, including [type] of questions.
```

## Analysis Commands

### Comparative Analysis

```text
Analyze latest [topic]: Compare [entity 1] vs. [entity 2] impacts using metrics like [metrics]. Use table format. Sources: [source type] only. If data gaps, note them.
```

### Step-by-step Analysis

```text
[Topic] analysis with step-by-step reasoning. Include metrics, comparisons via tables, and cite all sources.
```

## Quick Reference

| Use Case | Key Tips                   | Focus Mode |
| -------- | -------------------------- | ---------- |
| Research | Date filters, citations    | Academic   |
| Coding   | Language/framework + tests | Web        |
| Writing  | Tone/audience/structure    | Writing    |
| Analysis | Step-by-step, tables       | Web        |

## Advanced Tips

- **Use domain filters**: `site:wikipedia.org` or specific domains
- **Follow-up questions**: Build on prior responses for deeper analysis
- **File attachments**: Upload documents for analysis
- **API parameters**: Use `search_domain_filter` for programmatic precision
- **Consistency testing**: Verify results with multiple query variations

## Common Pitfalls to Avoid

- Vague questions without specific output formats
- Not using appropriate Focus modes for the task
- Forgetting to request citations for factual claims
- Not iterating or refining prompts based on results
- Ignoring related searches and follow-up opportunities
