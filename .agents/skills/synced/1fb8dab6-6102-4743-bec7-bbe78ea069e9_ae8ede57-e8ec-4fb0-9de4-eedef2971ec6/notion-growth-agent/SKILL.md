---
name: notion-growth-agent
description: >
  Automated growth agent for Notion marketplace templates. Use this skill whenever the user wants to
  promote, optimize, or manage their Notion templates on the marketplace. This includes: scraping a
  creator's profile to find all published templates, analyzing and improving marketplace listings
  (titles, descriptions, images, pricing), generating screenshots of templates, and publishing
  promotional posts to Reddit. Trigger this skill for any mention of "Notion marketplace",
  "template promotion", "Notion listing optimization", "Reddit posting for templates",
  "template screenshots", "marketplace SEO", "grow my Notion templates", or any request to
  automate the promotion of Notion templates across platforms. Also trigger when the user mentions
  their Notion creator profile, wants to improve template sales, or asks about Notion marketplace
  best practices.
---

# Notion Growth Agent

An automated agent that discovers all templates on a Notion marketplace creator profile,
optimizes each listing for maximum conversions, generates high-quality screenshots, and
publishes promotional posts to Reddit — all while following anti-spam best practices.

## Prerequisites

This skill requires browser automation capabilities. The agent uses:
- **Codex in Chrome** tools for browser automation (navigating Notion, taking screenshots, posting to Reddit)
- **Web search** for competitive analysis and subreddit discovery
- Access to the user's **Notion marketplace profile** (public URL)
- Access to the user's **Reddit account** (must be logged in in the browser)

## Default Configuration

These are the defaults for the user @barbaracohenn. Override with user input if different.

| Parameter | Default Value |
|-----------|--------------|
| `profile_url` | `https://www.notion.com/@barbaracohenn` |
| `reddit_account` | `barbara.innotion@gmail.com` |
| `subreddits` | `r/notioncreations, r/productivity, r/Notion, r/NotionTemplates` + auto-discovered |
| `language` | `English` |
| `posts_per_day` | `3` (minimum) |
| `can_edit_titles` | `yes` |
| `can_edit_descriptions` | `yes` |
| `can_edit_price` | `yes` (optimize for competitiveness via benchmark) |
| `min_screenshots` | `6` |
| `max_screenshots` | `10` |
| `post_interval_hours` | `4-8` between posts |

## Pipeline Overview

```
1. DISCOVER  → Scan creator profile, collect all template listings
2. ANALYZE   → Review each listing's title, description, price, images
3. OPTIMIZE  → Improve title (SEO), description (conversion copy), image order
4. SCREENSHOT → Navigate into template, capture 6-10 strategic screenshots
5. UPDATE    → Upload new screenshots and apply text changes to the listing
6. PUBLISH   → Create Reddit post with title + description + link + images
7. TRACK     → Mark template as processed, log actions, avoid duplicates
```

---

## Module 1: Profile Discovery

Open the creator's marketplace profile URL and extract all template listings.

### Steps:
1. Navigate to the profile URL using Codex in Chrome → `navigate` tool
2. Use `read_page` to extract the accessibility tree and find all template cards
3. Scroll down to load all templates (handle lazy loading with `computer` tool scroll actions)
4. For each template card, extract:
   - Template name (from text content)
   - Marketplace listing URL (from link href)
   - Price (free or paid)
   - Category tags if visible
5. Build a processing queue sorted by priority

### Priority scoring:
Templates with fewer images get processed first, then those with weak titles,
then those never posted to Reddit. This ensures maximum impact from each optimization cycle.

---

## Module 2: Listing Analysis & Optimization

For each template in the queue, open its marketplace listing and analyze it.

### What to analyze:
- **Title**: Length, keyword presence, emotional hooks, CTR potential
- **Description**: Structure, benefit vs feature focus, readability
- **Price**: Note but do NOT change (unless user explicitly permits)
- **Images**: Count, order, coverage of template sections
- **Category/Tags**: Relevance and completeness

### How to optimize:

Read the full SEO and copy reference: `references/seo-and-copy.md`

**Title rules:**
- Include primary use-case keyword ("Student Planner", "Business Dashboard")
- Add completeness modifier ("All-in-One", "Complete") if appropriate
- Keep under 60 characters
- Front-load the most important keyword
- Compare against competitor titles via web search
- Preserve core meaning — never rebrand a template

**Description structure:**
```
Hook → Problem → What's included → Who it's for → Differentiator → CTA
```

**What the agent must NEVER do:**
- Remove existing images (only add and reorder)
- Rename a template to something unrelated to its actual content
- Make changes without logging before/after values
- Set price below $1 for paid templates (floor)

**Price optimization rules:**
- The agent CAN and SHOULD adjust pricing based on competitive analysis
- Search for similar templates, note their price range
- If current price is significantly above market → suggest lowering
- If template has more features than competitors → consider raising
- Always log old price and new price with reasoning
- Never set a paid template to free without user confirmation

---

## Module 3: Screenshot Generation (TOP PRIORITY FUNCTION)

**This is the single most important function of the entire agent.**
Adding more high-quality screenshots to listings is the #1 driver of
conversions on the Notion marketplace. Every run should prioritize
screenshot generation above all other optimizations.

### Screenshots to capture (in order):

1. **Hero shot** — Main dashboard/overview with sample data visible
2. **Full overview** — Zoomed-out view showing all sections
3. **Key feature pages** — 2-3 internal pages showcasing best features
4. **Workflow in action** — Realistic use scenario (filled tasks, notes, etc.)
5. **Mobile view** — If applicable
6. **Detail close-up** — Visually impressive section
7. **Clean state** — How it looks when first duplicated

### How to capture (using Codex in Chrome):

1. Open the template's actual Notion page (not the marketplace listing)
2. Use `computer` tool to take screenshots at each view
3. Navigate between pages using `navigate` or clicking links found via `read_page`
4. For each screenshot:
   - Ensure the Notion sidebar is collapsed if possible
   - Make sure sample/demo data is visible
   - Capture at full viewport width
5. Save screenshots locally

### Targets:
- Minimum: 6 images per listing
- Ideal: 8-10 images
- Maximum: 12 (avoid clutter)

### Ordering in the listing:
1. Strongest hero image (becomes thumbnail)
2. Overview
3. Key features
4. Workflow/usage
5. Mobile/extras

---

## Module 4: Reddit Publishing

Read the full Reddit strategy reference: `references/reddit-strategy.md`

### Post format:

```
Title: [Natural, conversational title — NOT salesy]

Body:
- 1-2 sentences: what you built and why
- 3-4 bullet points: key benefits (not features)
- Direct link to marketplace listing
- Soft CTA ("Feedback welcome" or "Let me know what you think")

Attached: 3-5 best screenshots as image gallery
```

### Posting rules:

| Rule | Value |
|------|-------|
| Posts per day | Minimum 3 |
| Spacing | 4-8 hours apart |
| Same subreddit | Max 1 post per day per subreddit |
| Same template same subreddit | Not within 30 days |
| Vary copy | Every post must have unique title and body |

### Subreddit strategy:

**Always post to:** r/notioncreations, r/productivity

**Rotate through:** r/Notion, r/NotionTemplates

**Category-based (auto-discover):**
- Finance templates → r/personalfinance, r/budgeting
- Student templates → r/college, r/studytips
- Business templates → r/smallbusiness, r/entrepreneur
- Productivity → r/getdisciplined, r/productivity

**Before posting to any new subreddit:**
1. Check subreddit rules (use `read_page` on the subreddit sidebar)
2. If self-promotion is banned → skip that subreddit
3. If flair is required → apply correct flair

### Tone:

Write as a creator sharing work, NOT as a marketer selling.

- First person: "I built this because..." or "Made this for..."
- Genuine about what it does and doesn't do
- Invite feedback sincerely
- No excessive emojis or ALL CAPS
- Avoid spam trigger words: "ULTIMATE", "BEST EVER", "LIMITED TIME"

### Title formulas (rotate):
1. "I built a [type] for [audience] — [benefit]"
2. "After [effort], here's my [type] for Notion"
3. "[Type] that helps you [outcome]"
4. "Free/Affordable [type] I made for [audience]"
5. "Sharing my [type] — feedback welcome"

---

## Module 5: State Management

Maintain a JSON tracking file to avoid duplicates and track progress.

### State file structure (`notion_growth_state.json`):

```json
{
  "last_run": "2026-04-02T14:30:00Z",
  "templates_discovered": 45,
  "templates_processed": 12,
  "templates": {
    "https://notion.com/templates/...": {
      "name": "Student Planner",
      "last_optimized": "2026-04-02",
      "screenshots_count": 8,
      "title_changed": true,
      "old_title": "Student Planner",
      "new_title": "All-in-One Student Planner & Dashboard",
      "reddit_posts": [
        {
          "subreddit": "r/notioncreations",
          "date": "2026-04-01",
          "title": "I built a student planner..."
        }
      ]
    }
  }
}
```

### Deduplication rules:
- Before posting: check if template+subreddit combo exists within 30 days
- Before optimizing: check if listing was optimized within 7 days
- Before adding screenshots: check current count, only add if below target
- Log every change with timestamp and before/after values

---

## Execution Flow

```
START
│
├── Load tracking state (or create new if first run)
├── Navigate to creator profile
├── Discover all templates → build queue
├── Sort queue by priority
│
├── FOR EACH template (up to daily limit):
│   │
│   ├── Open marketplace listing
│   ├── Analyze current state
│   │
│   ├── IF needs optimization (title weak, description short, etc.):
│   │   ├── Web search for competitor templates in same category
│   │   ├── Generate improved title using SEO rules
│   │   ├── Generate improved description using copy framework
│   │   └── Apply changes to listing (if editing is possible via browser)
│   │
│   ├── IF needs more screenshots (current count < 6):
│   │   ├── Open the actual template page
│   │   ├── Navigate through all sub-pages
│   │   ├── Capture screenshots using computer tool
│   │   ├── Order by visual impact
│   │   └── Upload to listing
│   │
│   ├── IF eligible for Reddit post (not posted to target sub in 30 days):
│   │   ├── Select target subreddit (rotate)
│   │   ├── Check subreddit rules
│   │   ├── Generate conversational title
│   │   ├── Write authentic body text
│   │   ├── Select 3-5 best screenshots
│   │   ├── Navigate to Reddit, create post
│   │   └── Publish
│   │
│   └── Update tracking state
│
├── Save state to file
└── Report: actions taken, templates processed, posts published
END
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Listing page won't load | Skip, log, retry next cycle |
| Reddit rate limit | Wait specified time, then continue |
| Screenshot capture fails | Try alternative method or skip with log |
| Login required | Prompt user to log in manually |
| Subreddit blocks post | Log and try next subreddit |
| Template not accessible | Skip and mark in state |

---

## Important Limitations

1. **Marketplace editing**: The Notion marketplace may not allow programmatic editing of listings.
   If the listing edit interface requires manual interaction, the agent will:
   - Prepare all optimized content (title, description, image order)
   - Present it to the user for manual application
   - Or use Codex in Chrome to navigate the edit UI if available

2. **Reddit authentication**: The user must be logged into Reddit in the browser
   that Codex in Chrome controls. The agent cannot store or handle credentials.

3. **Rate limits**: Reddit has posting limits. If the agent hits them, it will
   pause and resume when allowed.

4. **This is not a 24/7 daemon**: Each run processes a batch. For continuous
   operation, the user should trigger the skill periodically or set up a scheduler.

---

## Quick Start

When the user says "run the growth agent" or similar:

1. Confirm the profile URL and subreddit targets
2. Check if the user is logged into Notion and Reddit in the browser
3. Load or create the tracking state
4. Begin the pipeline from Module 1
5. Process templates in priority order
6. Report results when done
