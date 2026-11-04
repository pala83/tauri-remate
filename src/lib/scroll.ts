/** Scrolls to a section and optionally moves the focus to one of its fields. */
export const irA = (id: string, foco?: string) => {
  document.getElementById(id)?.scrollIntoView();
  if (foco) document.getElementById(foco)?.focus({ preventScroll: true });
};
