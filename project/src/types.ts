export interface MissingUser {
  currentUser: string;
  files: string[];
  count: number;
}

export interface ComparisonResult {
  totalJsonFiles: number;
  matchingUsers: number;
  missingUsers: MissingUser[];
}
