export const mdArticleSkill = {
    name: "md_article",
    description: "Apply `md_article` skill when writing human readable articles",
    directory: ["md", "article"],
    content: `
- Use numerical points if the article mentions a specific sequence or priority
- Use bullet points only to list items
- Use full human readable sentences by default
- Avoid using em-dashes or en-dashes (except in quoted text)
- Replace em-dashes or en-dashes with words to create full sentences (except in quoted text)
- Convert \`--\` double hyphens in quoted text to em dashes
- Fix spelling and grammar mistakes (except in quoted text)
- Reduce long sentences > 40 words to smaller sentences (except in quoted text)
- Write articles in third person
- Write content diplomatic such that it does not offend any people group
- Use professional tone, but explain academical or technical words in layman terms
- Introduction should briefly explain a problem and how article will address
- Introduction MUST NOT give away solution, but rather trigger reader's curiosity
- Conclusion should not repeat the problem, but summarize the solution to the problem mentioned in introduction
- Conclusion MUST contain markdown links to anchors within the article where the solution was displayed in more detail (like a TOC in natural language)
- Articles must clearly indicate what is facts vs what is opinions
- Only allow statements like "I think", "We believe", "It's possibly" if the author uses unproven opinions
- Use British English by default in articles (unless different language requested)
- Organize sentences in paragraphs such that each paragraph communicate 1 message
- A paragraph typically start with a statement/fact, then contain sentences that explain this statement with examples.
- Merge repetitions
- Add markdown links in text to online websites or external md files in content if content was based on an external source
- Rephrase confusing explanations, contradictions or fallacies
- If author make controversial statement: add typical critique (argument) and defence (counter-argument)
- Never modify quoted text even if it contains errors
- Convert underscore headers \`-------------\` with hashed prefix headers \`##\`
- Content should be markdown linter compliant
- Article's main title should be H1 header level
- There should only be 1 H2 title
- All titles should Capitalize first letter of every word except short prepositions < 4 character like (in, on, at, to, by, of, up) and conjunctions like (and, but, for, or, not, so, yet) and articles (a, an, the)
- Ensure logical header hierarchy (no skipped levels)
- Large sections (> 25 lines) should be sub-dived into smaller sub-sections
- Ensure the content of the article does not deviate from topic of mentioned in the introduction section
- Code examples must be displayed in md code blocks specifying the correct language attribute
- Prefer grouping instructions and examples together so that reader can follow instructions without jumping around in article

For example:
- In the case of a \`README.md\` file, the "Introduction" = "Purpose of {Project Name}" and "Conclusion" = brief architectural summary of how the project solve this purpose

Default md layout (unless different layout was requested):
\`\`\`
# [Title]

[Introduction]

## [Content Sections]

### [Optional Sub-Sections]

#### [Optional Sub-Sub-Sections...]

## Conclusion
[Conclusion]
\`\`\`

`.trim()
} as const
