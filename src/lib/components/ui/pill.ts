const pill =
	'inline-flex items-center rounded-full border border-outline-variant text-body-medium text-on-surface-variant transition-colors duration-150 hover:text-on-surface';

/** One look for filter chips, tabs and view switches; each marks its chosen pill through its own attribute. */
export const pillClass = {
	toggle: `${pill} data-[state=on]:border-on-surface data-[state=on]:bg-on-surface data-[state=on]:text-surface`,
	tab: `${pill} data-[state=active]:border-on-surface data-[state=active]:bg-on-surface data-[state=active]:text-surface`,
	link: `${pill} aria-[current=page]:border-on-surface aria-[current=page]:bg-on-surface aria-[current=page]:text-surface`,
};
