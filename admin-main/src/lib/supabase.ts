/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import { createBackendDataClient } from './backendData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type LocalRecord = Record<string, any>;

const localStorageKey = 'sciscript-admin-local-data';

function readLocalData(): Record<string, LocalRecord[]> {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey) || '{}');
  } catch {
    return {};
  }
}

function writeLocalData(data: Record<string, LocalRecord[]>) {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
}

class LocalQuery implements PromiseLike<{ data: any; error: null; count?: number }> {
  private filters: Array<[string, any]> = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private maxRows: number | null = null;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: LocalRecord | LocalRecord[] | null = null;
  private singleRow = false;
  private headOnly = false;

  constructor(private readonly table: string) {}

  select(columns = '*', options: { count?: string; head?: boolean } = {}) {
    void columns;
    this.operation = 'select';
    this.headOnly = Boolean(options.head);
    return this;
  }

  insert(payload: LocalRecord | LocalRecord[]) {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  upsert(payload: LocalRecord | LocalRecord[]) {
    return this.insert(payload);
  }

  update(payload: LocalRecord) {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push([column, value]);
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push([column, value.toLowerCase()]);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.sort = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(value: number) {
    this.maxRows = value;
    return this;
  }

  maybeSingle() {
    this.singleRow = true;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  then<TResult1 = { data: any; error: null; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private execute() {
    const data = readLocalData();
    const rows = [...(data[this.table] || [])];

    if (this.operation === 'insert') {
      const records = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((item) => ({
        ...item,
        id: item?.id || crypto.randomUUID(),
        created_at: item?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      data[this.table] = [...rows, ...records];
      writeLocalData(data);
      return { data: this.singleRow ? records[0] : records, error: null, count: records.length };
    }

    const matches = (row: LocalRecord) => this.filters.every(([column, value]) => {
      if (typeof value === 'string' && value.includes('%')) {
        return String(row[column] || '').toLowerCase().includes(value.replace(/%/g, ''));
      }
      return row[column] === value;
    });

    if (this.operation === 'update') {
      const updated = rows.map((row) => matches(row) ? { ...row, ...this.payload, updated_at: new Date().toISOString() } : row);
      data[this.table] = updated;
      writeLocalData(data);
      return { data: this.singleRow ? updated.find(matches) || null : updated.filter(matches), error: null };
    }

    if (this.operation === 'delete') {
      data[this.table] = rows.filter((row) => !matches(row));
      writeLocalData(data);
      return { data: null, error: null };
    }

    let result = rows.filter(matches);
    if (this.sort) {
      const { column, ascending } = this.sort;
      result.sort((left, right) => String(left[column] || '').localeCompare(String(right[column] || '')) * (ascending ? 1 : -1));
    }
    if (this.maxRows !== null) result = result.slice(0, this.maxRows);
    if (this.headOnly) return { data: null, error: null, count: result.length };
    return { data: this.singleRow ? result[0] || null : result, error: null, count: result.length };
  }
}

function createLocalClient() {
  const session = {
    access_token: 'local-demo-token',
    refresh_token: 'local-demo-refresh-token',
    expires_in: 86400,
    token_type: 'bearer',
    user: {
      id: 'local-admin',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'admin@sciscript.local',
      app_metadata: {},
      user_metadata: { name: 'Local Admin' },
      created_at: new Date().toISOString(),
    },
  } as any;

  return {
    isLocal: true,
    from: (table: string) => new LocalQuery(table),
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: (callback: unknown) => {
        void callback;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => ({ data: { session, user: session.user }, error: null }),
      signUp: async () => ({ data: { session, user: session.user }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: session.user }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        remove: async () => ({ data: [], error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path }, error: null }),
      }),
    },
  };
}

export const isLocalMode = !supabaseUrl || !supabaseAnonKey;

const useLegacySupabase = import.meta.env.VITE_USE_SUPABASE === 'true' && Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = useLegacySupabase
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createBackendDataClient();
