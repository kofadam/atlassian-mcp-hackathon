# Local Jira & Confluence Setup Guide

## 🎉 Containers are Running!

- **Jira**: http://localhost:8088
- **Confluence**: http://localhost:8090
- **PostgreSQL Database**: Running on port 5432

## Step 1: Configure Jira (5 minutes)

1. **Open Jira in your browser**: http://localhost:8088

2. **Initial Setup Wizard**:
   - Click **"I'll set it up myself"**
   - Database: Select **"My Own Database" → PostgreSQL**

3. **Database Connection**:
   ```
   Database: PostgreSQL
   Hostname: atlassian-postgres
   Port: 5432
   Database: jiradb
   Username: atlassian
   Password: atlassian
   ```

4. **Application Properties**:
   - Application Title: `Hackathon Jira`
   - Mode: Select **"Private"**
   - Base URL: `http://localhost:8088`

5. **Administrator Account**:
   ```
   Full Name: Admin
   Email: admin@localhost
   Username: admin
   Password: admin (or your preferred password)
   ```

6. **License**: Click **"Generate evaluation license"** (30-day trial)

7. **Finish Setup**: Choose template "Scrum" or "Kanban"

## Step 2: Create API Token

1. Go to: http://localhost:8088/secure/ViewProfile.jspa
2. Click your profile icon → **"Profile"**
3. Click **"Personal Access Tokens"** (left sidebar)
4. Click **"Create token"**
   - Name: `REST API Token`
   - Expiry: 30 days
5. **Copy the token** - you'll need this!

## Step 3: Update .env File

```bash
# Edit your .env file with these values:
ATLASSIAN_EMAIL=admin
ATLASSIAN_API_TOKEN=<paste-your-token-here>
ATLASSIAN_DOMAIN=localhost:8088
DEFAULT_PROJECT_KEY=KMD
```

## Step 4: Test REST API Connection

```bash
# Test with curl
curl -u "admin:<your-token>" http://localhost:8088/rest/api/3/myself

# Or test your app
npm run web
```

Then open http://localhost:3000 and try queries like:
- "Show me all issues"
- "Create a bug report"
- "Generate sprint report"

## Step 5 (Optional): Configure Confluence

1. Open: http://localhost:8090
2. Similar setup process
3. Use database: `confluencedb` with same credentials

## Quick Commands

```bash
# Check container status
docker ps

# View Jira logs
docker logs -f atlassian-jira

# Stop all containers
docker-compose down

# Start containers
docker-compose up -d

# Restart Jira
docker restart atlassian-jira
```

## Troubleshooting

### Jira won't start
```bash
docker logs atlassian-jira
# Wait 2-3 minutes for initial startup
```

### Database connection fails
```bash
# Check Postgres is running
docker logs atlassian-postgres

# Restart database
docker restart atlassian-postgres
```

### Port conflicts
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8088:8080"  # Change 8088 to another port
```

## Why This is Better for Your Hackathon

✅ **No "atl-missing-tcs" errors** - Self-hosted = no restrictions
✅ **REST API works perfectly** - Full control over authentication
✅ **Air-gap demo ready** - Shows on-prem deployment capability
✅ **Faster development** - No internet latency
✅ **Real enterprise scenario** - This IS how it will deploy in prod

## Next Steps

Once Jira is configured and you have your API token:

1. Update `.env` with local credentials
2. Test REST API with `/api/direct-test` endpoint
3. Import your test data using `npm run setup-data`
4. Demo the working solution! 🚀
