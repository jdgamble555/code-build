import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserRec } from '@auth/user.model';
import { PostDbService } from '@db/post/post-db.service';
import { UserDbService } from '@db/user/user-db.service';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { Post } from '@post/post.model';
import { DarkModeService } from '@shared/dark-mode/dark-mode.service';
import { debounceTime, from, Observable, of, take, tap } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  @Output() menuButtonClicked = new EventEmitter();
  @Input() title!: string;

  env: any;

  isActiveSearch = false;
  terms!: Observable<Post[] | null>;
  user$: Observable<UserRec | null>;

  constructor(
    public ns: NavService,
    public dm: DarkModeService,
    private ps: PostDbService,
    private us: UserDbService,
    private router: Router
  ) {
    this.user$ = this.ns.isBrowser ? this.us.user$ : of(null);
    this.dm.setTheme();
    this.env = environment;
  }

  toggle() {
    this.dm.toggleTheme();
  }

  bookmarksPage() {
    this.ns.type = 'bookmarks';
    this.ns.dashboardIndex = 0;
    this.router.navigate(['/dashboard']);
  }

  userPostsPage() {
    this.ns.type = 'user';
    this.ns.dashboardIndex = 1;
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.us.logout();
    this.ns.home();
  }

  async search(event: Event): Promise<void> {
    const term = (<HTMLInputElement>event.target).value;
    if (term) {
      this.terms = term
        ? from(this.getPostData(term)).pipe(
          debounceTime(500),
          take(1)
        )
        : of(null);
    }
  }

  async getPostData(term: string) {
    let data;
    let error = null;
    ({ data, error } = await this.ps.searchPost(term));
    if (error) {
      console.error(error);
    }
    return data || null;
  }
}
