-- Create databases for Jira and Confluence
CREATE DATABASE jiradb WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0;
CREATE DATABASE confluencedb WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE jiradb TO atlassian;
GRANT ALL PRIVILEGES ON DATABASE confluencedb TO atlassian;
