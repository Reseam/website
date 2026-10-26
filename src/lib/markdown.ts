import { Marked } from 'marked';

const SAFE_URL = /^(https?:|mailto:)/i;

function escape(text: string) {
	return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function link(href: string, label: string) {
	return `<a href="${escape(href)}" rel="nofollow ugc noopener" target="_blank">${label}</a>`;
}

// Requests, comments and announcements come from the public: raw HTML shows as text, links keep to
// http(s) and mail, images stay links, and headings stay at body size.
const marked = new Marked({
	gfm: true,
	breaks: true,
	async: false,
	renderer: {
		html: ({ text }) => escape(text),
		heading({ tokens }) {
			return `<p><strong>${this.parser.parseInline(tokens)}</strong></p>`;
		},
		link({ href, tokens }) {
			const label = this.parser.parseInline(tokens);
			return SAFE_URL.test(href) ? link(href, label) : label;
		},
		image: ({ href, text }) =>
			SAFE_URL.test(href) ? link(href, escape(text || href)) : escape(text),
	},
});

export function renderMarkdown(text: string) {
	return marked.parse(text) as string;
}
