import { TestBed } from '@angular/core/testing';
import { AuthModule } from '@angular/fire/auth';
import { RouterTestingModule } from '@angular/router/testing';
import { DbModule } from '@db/db.module';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { AuthService } from './auth.service';



describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule, AuthModule, MarkdownModule.forRoot(), RouterTestingModule],
      providers: [MarkdownService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
