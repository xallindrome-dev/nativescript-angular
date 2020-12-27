import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageRoute, RouterExtensions } from 'nativescript-angular/router';

import { ChallengeService } from '../challenge.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ns-challenge-edit',
  templateUrl: './challenge-edit.component.html',
  styleUrls: ['./challenge-edit.component.scss']
})
export class ChallengeEditComponent implements OnInit {
  isCreating = true;
  title: string = '';
  description: string = '';

  constructor(
    private activatedRoutes: ActivatedRoute,
    private pageRoute: PageRoute,
    private router: RouterExtensions,
    private challengeService: ChallengeService
  ) { }

  ngOnInit() {
    this.pageRoute.activatedRoute.subscribe(activatedRoute => {
      activatedRoute.paramMap.subscribe(paramMap => {
        if (!paramMap.has("mode")) {
          this.isCreating = true;
        } else {
          this.isCreating = paramMap.get("mode") !== 'edit';
        }

        if (!this.isCreating) {
          this.challengeService.currentChallenge.pipe(take(1)).subscribe(cc => {
            this.title = cc.title;
            this.description == cc.description;
          })
        }
      });
    })
  }

  onSubmit(title: string, desc: string) {
    if (this.isCreating) {
      this.challengeService.createNewChallenge(title, desc);
    } else {
      this.challengeService.updateChallenge(title, desc);
    }
    this.router.backToPreviousPage();
  }
}
