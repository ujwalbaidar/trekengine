import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import { SumTotalPipe } from "./pipes/sumTotal.pipe";

@NgModule({
	declarations:[SumTotalPipe],
	imports:[CommonModule],
	exports:[SumTotalPipe]
})

export class MainPipe{}