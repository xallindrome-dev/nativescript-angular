import { Component, ViewContainerRef, OnInit, OnDestroy } from "@angular/core";
import { ModalDialogService } from 'nativescript-angular/modal-dialog'
import { Subscription } from "rxjs";

import { DayModalComponent } from "../day-modal/day-modal.component";
import { UIService } from "~/app/shared/ui.service";
import { ChallengeService } from "../challenge.service";
import { Challenge } from "../challenge.model";
import { Day, DayStatus } from "../day.model";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: 'ns-current-challenge',
    templateUrl: './current-challenge.component.html',
    styleUrls: [
        './_current-challenge.component.common.scss',
        './current-challenge.component.scss'
    ],
    moduleId: module.id
})
export class CurrentChallengeComponent implements OnInit, OnDestroy {
    weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    currentChallenge: Challenge;
    private currChallengeSub: Subscription;

    constructor(
        private modalDialog: ModalDialogService,
        private vcRef: ViewContainerRef,
        private router: RouterExtensions,
        private uiService: UIService,
        private challengeService: ChallengeService) { }

    ngOnInit() {
        this.currChallengeSub = this.challengeService.currentChallenge.subscribe(cc => {
            console.log("Testing Current CHallenge Sub", cc);
            this.currentChallenge = cc;
        });
    }

    getIsSettable(dayInMonth: number) {
        return dayInMonth <= new Date().getDate();
    }

    getRow(index: number, day: { dayInMonth: number, dayInWeek: number }) {
        const startRow = 1;
        const weekRow = Math.floor(index / 7);
        const firstWeekDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
        const irregularRow = day.dayInWeek < firstWeekDayOfMonth ? 1 : 0;
        console.log("GetRow: ", startRow + weekRow + irregularRow);

        return startRow + weekRow + irregularRow;
    }

    onChangeStatus(day: Day) {
        if (!this.getIsSettable(day.dayInMonth)) {
            console.log("No status changed");
            return;
        }

        this.modalDialog
            .showModal(DayModalComponent, {
                fullscreen: true,
                viewContainerRef: this.uiService.getRootVCRef()
                    ? this.uiService.getRootVCRef()
                    : this.vcRef,
                context: { date: day.date, status: day.status }
            })
            .then((status: DayStatus) => {
                if (status === DayStatus.Open) {
                    return;
                }
                this.challengeService.updateDayStatus(day.dayInMonth, status);
            })
    }

    onRouteAction(route: string) {
        if (route === "add") {
            this.router.navigate(['/challenges/replace'])
        } else {
            this.router.navigate(['/challenges/edit'])
        }
    }

    ngOnDestroy() {
        if (this.currChallengeSub) {
            this.currChallengeSub.unsubscribe();
        }
    }
}