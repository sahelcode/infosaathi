// Standard ABO/Rh red-cell compatibility. Same rules every blood bank teaches; the final match is always done by the hospital.
export const GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export type Group = (typeof GROUPS)[number];
export const slugOf = (g: Group) => g.replace('+', '-positive').replace(/-$/, '-negative').toLowerCase();
export const fromSlug = (s: string) => GROUPS.find((g) => slugOf(g) === s);
export const RECEIVE_FROM: Record<Group, Group[]> = {
  'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'], 'AB-': ['AB-', 'A-', 'B-', 'O-'], 'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};
export const DONATE_TO = (g: Group): Group[] => GROUPS.filter((x) => RECEIVE_FROM[x].includes(g));
