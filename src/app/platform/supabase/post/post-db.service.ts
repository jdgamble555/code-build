import { Injectable } from '@angular/core';
import { DbModule } from '@db/db.module';
import { supabase_to_post } from '@db/supabase.types';
import { PostInput, PostListRequest, PostRequest } from '@post/post.model';
import { decode, encode, range } from 'j-supabase';
import { SupabaseService } from '../supabase.service';


@Injectable({
  providedIn: DbModule
})
export class PostDbService {

  constructor(private sb: SupabaseService) { }

  /**
  * Get a total count for the collection
  * @param col - Collection Path
  * @returns - total count
  */
  async getTotal(col: string): Promise<PostRequest> {
    let q = this.sb.supabase.from(col)
      .select(undefined, { count: 'exact' });
    if (col === 'posts') {
      q = q.lte('published_at', new Date().toISOString())
    }
    const { error, count } = await q;
    return { error, count: count };
  }

  async getPostById(id: string, published = true): Promise<PostRequest> {
    const pid = decode(id);
    let error: any;
    let data: any;

    const x = (pub: boolean) => this.sb.supabase.from(pub ? 'posts_hearts_tags' : 'drafts')
      .select('*, author!inner(*)').eq('id', pid).limit(1);

    // draft
    if (!published) {
      ({ data, error } = await x(false));
      if (error) {
        console.error(error);
      }
    }

    // published
    if (!data?.length) {
      ({ data, error } = await x(true));
      if (error) {
        console.error(error);
      }
    }
    data = data?.length ? supabase_to_post(data[0]) : undefined;
    return { data, error };
  }

  /**
 * Search posts by term
 * @param term
 * @returns Observable of search
 */
  async searchPost(phrase: string): Promise<PostListRequest> {
    //const { data, error } = await this.sb.supabase.rpc('search_posts', { phrase });
    const { data, error } = await this.sb.supabase.from('search_posts').select('*')//.textSearch('content', phrase, { type: 'phrase', config: 'english' });
      .or(`title.phfts.${phrase},content.phfts.${phrase},tags.phfts.${phrase}`);
    return { data: data?.map((p) => ({ ...p, id: encode(p.id) })) as any, error };
  }

  async getPosts({
    authorId,
    tag,
    sortField = 'created_at',
    sortDirection = 'desc',
    pageSize = 5,
    page = 1,
    drafts = false
  }: PostInput = {}): Promise<PostListRequest> {

    const _sorts: any = {
      'updatedAt': 'updated_at',
      'createdAt': 'created_at',
      'heartsCount': 'hearts_count'
    };

    sortField = _sorts[sortField] ?? sortField;

    let error = null;
    let count = null;
    let data = null;

    let q = this.sb.supabase.from(drafts ? 'drafts' : 'posts_hearts_tags')
      .select('*, author!inner(*)', { count: 'exact' });

    if (!drafts) {
      q = q.lt('published_at', new Date().toISOString());
    }

    if (tag) {

      // tag query
      q = q.contains('tags', [tag]);

    } else if (authorId) {

      // author query
      q = q.eq('author.id', decode(authorId));
    }

    const { to, from } = range({ page, size: pageSize });

    // get results
    ({ data, count } = await q.order(sortField, { ascending: sortDirection === 'asc' }).range(from, to));

    if (count && count > 0) {

      // translate results
      data = data?.map((_p: any) => supabase_to_post(_p));
    }
    return { error, data, count };
  }
}


