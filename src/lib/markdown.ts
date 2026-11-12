import { Marked, type RendererObject } from 'marked';
import markedAlert from 'marked-alert';

const SAFE_URL = /^(https?:|mailto:)/i;

function escape(text: string) {
	return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function link(href: string, label: string) {
	return `<a href="${escape(href)}" rel="nofollow ugc noopener" target="_blank">${label}</a>`;
}

// Links keep to http(s) and mail, and images stay links.
const safeLinks: RendererObject = {
	link({ href, tokens }) {
		const label = this.parser.parseInline(tokens);
		return SAFE_URL.test(href) ? link(href, label) : label;
	},
	image: ({ href, text }) =>
		SAFE_URL.test(href) ? link(href, escape(text || href)) : escape(text),
};

// Requests, comments and announcements come from the public: raw HTML shows as text and headings
// stay at body size.
const marked = new Marked({
	gfm: true,
	breaks: true,
	async: false,
	renderer: {
		...safeLinks,
		html: ({ text }) => escape(text),
		heading({ tokens }) {
			return `<p><strong>${this.parser.parseInline(tokens)}</strong></p>`;
		},
	},
});

// READMEs and release notes are written for a repository's page: their HTML keeps only its text,
// and their headings sit two levels below the page's own.
const authored = new Marked({
	gfm: true,
	async: false,
	renderer: {
		...safeLinks,
		html({ text, block }) {
			const plain = text
				.replace(/<[^>]*>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim()
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
			return block && plain ? `<p>${plain}</p>` : plain;
		},
		heading({ tokens, depth }) {
			const level = Math.min(depth + 2, 6);
			return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>`;
		},
	},
}).use(markedAlert());

export function renderMarkdown(text: string) {
	return marked.parse(text) as string;
}

export function renderDocument(text: string) {
	return authored.parse(text) as string;
}
