# SAFe Program Increment (PI) - Setup Guide

## Quick Start (2 Minutes) ⚡

The fastest way to demo PI features:

1. **Open your Jira project**
2. **Create or edit 2-3 issues** and add these labels:

### Example 1: PI Objective
- **Summary:** `PI 25.1 Objective: Migrate to Microservices Architecture`
- **Labels:** `PI-25.1`, `PI-Objective`
- **Description:** (Optional) Add business value, success metrics

### Example 2: PI Risk
- **Summary:** `Risk: Microservices complexity overwhelming team`
- **Labels:** `PI-25.1`, `Risk`, `ROAM-Owned`
- **Description:** (Optional) Add mitigation plan, owner

### Example 3: PI Feature
- **Summary:** `Feature: API Gateway Implementation`
- **Labels:** `PI-25.1`, `Feature`
- **Description:** (Optional) Add story points, acceptance criteria

3. **Test the queries:**
   - "Show PI 25.1"
   - "Show PI 25.1 risks"
   - "Generate PI 25.1 report"

**Done!** Your PI support is working. ✨

---

## Complete Label Reference

### PI Version Labels
- `PI-25.1` - Current PI
- `PI-24.4` - Previous PI
- `PI-26.1` - Future PI

### Item Type Labels
- `PI-Objective` - Strategic objectives (use with Story type)
- `Feature` - Large capabilities (use with Story type)
- `Risk` - Identified risks (use with Task/Bug type)

### ROAM Risk Status Labels
Only use these with `Risk` label:
- `ROAM-Resolved` ✅ - Risk has been addressed
- `ROAM-Owned` 👤 - Risk has assigned owner working on it
- `ROAM-Accepted` ⚠️ - Risk accepted by stakeholders
- `ROAM-Mitigated` 🛡️ - Risk has mitigation plan in place

---

## Supported Queries

### View PI Items
```
"Show PI 25.1"
"Show PI 25.1 objectives"
"Show PI 25.1 features"
"Show PI 25.1 risks"
"Show current PI"
```

### Filter by ROAM Status
```
"Show owned risks"
"Show mitigated risks"
"Show resolved risks"
"Show accepted risks"
```

### Generate Reports
```
"Generate PI 25.1 report"
"Create a report for PI 24.4"
```

---

## Report Features

Generated PI reports include:

1. **Executive Summary**
   - Total objectives, features, risks
   - Story points planned
   - Risk distribution

2. **PI Objectives**
   - Business value scores (extracted from description)
   - Linked to PI version

3. **Features & Capabilities**
   - Story points (extracted from description)
   - Current status
   - Sortable tables

4. **Risks by ROAM Status**
   - Color-coded by status
   - Priority levels
   - Distribution charts

5. **Automated Recommendations**
   - Based on risk status
   - Capacity planning
   - Risk management insights

---

## Advanced: Automated Data Creation

If you want to populate Jira with sample data automatically:

### Option 1: Simplified Script (7 items)
```bash
node scripts/create-pi-data-simple.js
```
Creates:
- 2 PI objectives
- 2 PI features
- 3 PI risks (one of each main ROAM status)

### Option 2: Full Script (20+ items)
```bash
node scripts/create-pi-data.js
```
Creates:
- PI 24.4 (completed) with objectives, features, and risks
- PI 25.1 (current) with objectives, features, and risks

**Note:** These scripts may experience MCP connection timeouts. Manual label addition is faster and more reliable for demos.

---

## Tips for Demos

1. **Start Simple:** Create just 2-3 issues with PI labels
2. **Show ROAM:** Demonstrate risk filtering with ROAM statuses
3. **Generate Report:** Show the comprehensive PI report generation
4. **Emphasize Value:**
   - Enterprise SAFe support
   - ROAM risk framework
   - Multi-PI tracking
   - Automatic analytics

## Troubleshooting

**Q: Queries return no results?**
- A: Check that labels are exactly: `PI-25.1` (not `PI25.1` or `PI 25.1`)

**Q: ROAM filtering not working?**
- A: Ensure risk has both `Risk` label AND a `ROAM-*` label

**Q: Report shows "Unknown" PI?**
- A: At least one issue needs a `PI-X.Y` label

**Q: Scripts timing out?**
- A: Use manual label approach instead - it's faster and more reliable!

---

## Example Issue Setup

Here's a complete example for copy-paste:

### Issue 1: PI Objective
```
Summary: PI 25.1 Objective: Migrate to Microservices Architecture
Type: Story
Labels: PI-25.1, PI-Objective, Microservices
Description:
**Business Value:** 10/10
**Category:** Enabler

Break monolithic application into scalable microservices.

**Success Metrics:**
- 5 core services extracted
- API response time < 200ms
- Independent deployments
```

### Issue 2: PI Risk
```
Summary: Risk: Microservices complexity overwhelming team
Type: Task
Labels: PI-25.1, Risk, ROAM-Owned
Priority: Highest
Description:
**Risk Level:** High
**ROAM Status:** Owned
**Impact:** Team may struggle with distributed systems

**Mitigation Plan:**
- Microservices training (2 weeks)
- Start with 1 simple service
- Hire senior architect

**Owner:** Engineering Manager
```

---

## Why This Matters

PI support demonstrates:
- ✅ **Enterprise thinking** - SAFe framework knowledge
- ✅ **Risk management** - ROAM framework implementation
- ✅ **Scalability** - Multi-PI program tracking
- ✅ **Analytics** - Comprehensive reporting
- ✅ **Differentiation** - Beyond basic Agile tools

This positions your tool for **enterprise customers** using SAFe at scale!
