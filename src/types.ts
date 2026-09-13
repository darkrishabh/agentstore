export const OBJECT_KINDS = [
  "note",
  "todo",
  "reminder",
  "calendar",
  "reference",
  "other",
] as const;

export type ObjectKind = (typeof OBJECT_KINDS)[number];
export type JsonObject = Record<string, unknown>;

export interface PutObjectInput {
  key: string;
  kind: ObjectKind;
  value: JsonObject;
  searchableText: string;
  description?: string | null;
  labels?: string[];
  sourceClient?: string | null;
  dueAt?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  completed?: boolean | null;
  expiresAt?: string | null;
}

export interface StoredObject {
  id: string;
  key: string;
  kind: ObjectKind;
  value: JsonObject;
  searchableText: string;
  description: string | null;
  labels: string[];
  sourceClient: string | null;
  dueAt: string | null;
  startAt: string | null;
  endAt: string | null;
  completed: boolean | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type ObjectMetadata = Omit<StoredObject, "value" | "searchableText">;

export type SearchSort =
  | "relevance"
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "updated_asc"
  | "due_asc";

export interface SearchObjectsInput {
  query?: string;
  kind?: ObjectKind[];
  sourceClient?: string[];
  labels?: string[];
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  dueAfter?: string;
  dueBefore?: string;
  completed?: boolean;
  keyPrefix?: string;
  sort?: SearchSort;
  limit?: number;
}

export interface SearchMatch {
  score: number;
  matchedFields: string[];
  snippet: string | null;
}

export interface SearchResult extends ObjectMetadata {
  match: SearchMatch;
}

export interface ListObjectsInput {
  kind?: ObjectKind[];
  sourceClient?: string[];
  labels?: string[];
  dueBefore?: string;
  completed?: boolean;
  cursor?: string;
  limit?: number;
}

export interface ListObjectsPage {
  objects: ObjectMetadata[];
  nextCursor: string | null;
  totalCount: number;
}

export interface StoreStats {
  total: number;
  byKind: Record<ObjectKind, number>;
  sourceCount: number;
  sources: string[];
  scheduled: number;
  expiring: number;
}
