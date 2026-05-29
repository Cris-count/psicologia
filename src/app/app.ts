import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { GameLoaderComponent } from './shared/ui/game-loader/game-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private navSub: Subscription | null = null;
  transitioning = false;

  ngOnInit(): void {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.transitioning = false;
        this.guardProtectedRoute(this.router.url);
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.auth.ensureAuthenticatedOrRedirect();
    }
  }

  onActivate(): void {
    this.guardProtectedRoute(this.router.url);
  }

  private guardProtectedRoute(url: string): void {
    const isPublic = url === '/' || url.startsWith('/login');
    if (!isPublic && !this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
