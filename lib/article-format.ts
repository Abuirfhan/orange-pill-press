export const CATEGORIES = [
  'Bitcoin', 'Nostr', 'Austrian economics',
  'Fiat & Debt', 'Fiat & War', 'Fiat',
  'Bitcoin & self-custody', 'Genesis block',
]

export interface ArticleFormValues {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  featuredImg: string
  readTime: number
}

export function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function countWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

export function estimateReadTime(text: string) {
  return Math.max(1, Math.ceil(countWords(text) / 200))
}

export function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .split('\n\n')
    .map(block => {
      if (block.match(/^<(h[1-3]|ul|blockquote)/)) return block
      if (block.trim() === '') return ''
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')
}

function wrapInlineMarkdown(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }

  if (!(node instanceof HTMLElement)) {
    return ''
  }

  const children = Array.from(node.childNodes).map(nodeToMarkdown).join('')

  switch (node.tagName.toLowerCase()) {
    case 'h1':
      return `# ${wrapInlineMarkdown(children)}`
    case 'h2':
      return `## ${wrapInlineMarkdown(children)}`
    case 'h3':
      return `### ${wrapInlineMarkdown(children)}`
    case 'p':
      return wrapInlineMarkdown(children)
    case 'strong':
    case 'b':
      return `**${wrapInlineMarkdown(children)}**`
    case 'em':
    case 'i':
      return `*${wrapInlineMarkdown(children)}*`
    case 'a': {
      const href = node.getAttribute('href') ?? ''
      return `[${wrapInlineMarkdown(children)}](${href})`
    }
    case 'blockquote':
      return wrapInlineMarkdown(children)
        .split('\n')
        .filter(Boolean)
        .map(line => `> ${line}`)
        .join('\n')
    case 'ul':
      return Array.from(node.children)
        .filter(child => child.tagName.toLowerCase() === 'li')
        .map(child => `- ${wrapInlineMarkdown(nodeToMarkdown(child))}`)
        .join('\n')
    case 'ol':
      return Array.from(node.children)
        .filter(child => child.tagName.toLowerCase() === 'li')
        .map((child, index) => `${index + 1}. ${wrapInlineMarkdown(nodeToMarkdown(child))}`)
        .join('\n')
    case 'li':
      return wrapInlineMarkdown(children)
    case 'br':
      return '\n'
    case 'hr':
      return '---'
    case 'img': {
      const src = node.getAttribute('src') ?? ''
      const alt = node.getAttribute('alt') ?? ''
      return src ? `![${alt}](${src})` : ''
    }
    default:
      return children
  }
}

export function htmlToMarkdown(html: string) {
  if (typeof window === 'undefined' || !html) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  return Array.from(doc.body.childNodes)
    .map(nodeToMarkdown)
    .map(block => block.trim())
    .filter(Boolean)
    .join('\n\n')
}
