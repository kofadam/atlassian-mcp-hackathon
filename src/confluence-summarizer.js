/**
 * Confluence Document Summarizer
 *
 * Supports two modes:
 * 1. AI-powered summarization using Anthropic's Claude API (requires API key)
 * 2. Free extractive summarization (no API key needed)
 */

import Anthropic from '@anthropic-ai/sdk';

class ConfluenceSummarizer {
  constructor(apiKey = null) {
    this.useAI = !!apiKey;
    if (this.useAI) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Extract plain text from Confluence storage format HTML
   */
  extractTextFromStorage(storageHtml) {
    // Remove HTML tags and decode entities
    let text = storageHtml
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  }

  /**
   * Free extractive summarization - no API needed
   * Takes first paragraphs and key sentences
   */
  extractiveSummarize(plainText, title) {
    const sentences = plainText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Filter out very short sentences

    if (sentences.length === 0) {
      return plainText.substring(0, 300);
    }

    // Take first 3-5 sentences as summary
    const summaryLength = Math.min(5, Math.max(3, Math.ceil(sentences.length * 0.15)));
    const summary = sentences.slice(0, summaryLength).join('. ') + '.';

    return summary;
  }

  /**
   * Summarize a Confluence page
   */
  async summarizePage(pageContent, options = {}) {
    const { title, body } = pageContent;
    const summaryLength = options.length || 'medium'; // short, medium, long

    // Extract plain text from HTML
    const plainText = this.extractTextFromStorage(body);

    if (plainText.length < 100) {
      return {
        summary: plainText,
        title: title,
        type: 'direct', // Too short to summarize
        wordCount: plainText.split(/\s+/).length
      };
    }

    // Use free extractive summarization if no API key
    if (!this.useAI) {
      const summary = this.extractiveSummarize(plainText, title);
      return {
        summary: summary,
        title: title,
        type: 'extractive',
        wordCount: plainText.split(/\s+/).length,
        model: 'extractive (free)'
      };
    }

    // AI-powered summarization with Anthropic API
    // Determine summary instructions based on length
    let lengthInstruction = '';
    switch (summaryLength) {
      case 'short':
        lengthInstruction = 'Provide a brief 2-3 sentence summary.';
        break;
      case 'long':
        lengthInstruction = 'Provide a comprehensive summary with key points in bullet format.';
        break;
      default: // medium
        lengthInstruction = 'Provide a concise summary in 1 paragraph (4-6 sentences).';
    }

    const prompt = `Please summarize the following Confluence document titled "${title}":

${plainText}

${lengthInstruction}

Focus on:
- Main topics and key points
- Important decisions or conclusions
- Action items or next steps (if any)

Provide the summary in a clear, professional tone.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const summary = message.content[0].text;

      return {
        summary: summary,
        title: title,
        type: 'ai-generated',
        wordCount: plainText.split(/\s+/).length,
        model: 'claude-3-5-sonnet-20241022'
      };
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Summarize multiple pages
   */
  async summarizePages(pages, options = {}) {
    const summaries = [];

    for (const page of pages) {
      try {
        const summary = await this.summarizePage(page, options);
        summaries.push({
          ...summary,
          pageId: page.id,
          url: page.url
        });
      } catch (error) {
        summaries.push({
          pageId: page.id,
          title: page.title,
          error: error.message,
          type: 'error'
        });
      }
    }

    return summaries;
  }
}

export default ConfluenceSummarizer;
