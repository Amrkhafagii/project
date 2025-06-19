import { supabase } from '@/lib/supabase';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export class ApiClient {
  private static instance: ApiClient;

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(table: string, options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(table).select(options?.select || '*');

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: new ApiError(error.message, undefined, error.code),
        };
      }

      return { data: data as T[], error: null };
    } catch (error) {
      return {
        data: null,
        error: new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        ),
      };
    }
  }

  async getById<T>(table: string, id: string, select?: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(select || '*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: new ApiError(error.message, undefined, error.code),
        };
      }

      return { data: data as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        ),
      };
    }
  }

  async create<T>(table: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: new ApiError(error.message, undefined, error.code),
        };
      }

      return { data: result as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        ),
      };
    }
  }

  async update<T>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: new ApiError(error.message, undefined, error.code),
        };
      }

      return { data: result as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        ),
      };
    }
  }

  async delete(table: string, id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) {
        return {
          data: null,
          error: new ApiError(error.message, undefined, error.code),
        };
      }

      return { data: null, error: null };
    } catch (error) {
      return {
        data: null,
        error: new ApiError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        ),
      };
    }
  }
}

export const apiClient = ApiClient.getInstance();
