import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchService } from './services/search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  searchControl: FormControl;
  private searchSub?: Subscription;

  constructor(private fb: FormBuilder, private searchService: SearchService) {
    this.searchControl = this.fb.control('');
  }

  onSearchFocus() {
    if (!this.searchSub) {
      this.searchSub = this.searchControl.valueChanges
        .pipe(debounceTime(400))
        .subscribe(value => {
          this.searchService.setSearch(value);
        });
    }
  }

  onSearchBlur() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
      this.searchSub = undefined;
    }
  }

  ngOnDestroy() {
    this.onSearchBlur();
  }
}
