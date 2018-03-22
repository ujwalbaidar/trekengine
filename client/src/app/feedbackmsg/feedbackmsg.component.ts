import { Component, OnInit } from '@angular/core';
import { AuthService, FeedbackMsgService } from '../services/index';

export class Feedback {
    constructor(
        message: string
    ){}
}

@Component({
  selector: 'app-feedbackmsg',
  templateUrl: './feedbackmsg.component.html',
  styleUrls: ['./feedbackmsg.component.css']
})
export class FeedbackmsgComponent implements OnInit {
	feedbackObj: Feedback = <Feedback>{};
	public displayBlock: boolean = false;

	constructor(public authService: AuthService, public feedbackMsgService: FeedbackMsgService) { }

	ngOnInit() {
		this.getFeedbackMsg();
	}

	getFeedbackMsg(){
		this.feedbackMsgService.getFeedbackMsg()
			.subscribe(feedbackMsg=>{
				if(feedbackMsg.length>0){
					this.feedbackObj = feedbackMsg[0];
				}
			}, error =>{
				console.log(error);
			});
	}

	submitFeedbackMsg(){
		if(this.feedbackObj && this.feedbackObj['_id']){
			this.updateFeedbackMsg();
		}else{
			this.saveFeedbackMsg();
		}
	}

	saveFeedbackMsg(){
		this.feedbackMsgService.saveFeedbackMsg(this.feedbackObj)
			.subscribe(saveResp=>{
				this.toggleDiv();
				this.getFeedbackMsg();
			},error=>{
				console.log(error);
			});
	}

	updateFeedbackMsg(){
		this.feedbackMsgService.updateFeedbackMsg(this.feedbackObj)
			.subscribe(saveResp=>{
				this.toggleDiv();
				this.getFeedbackMsg();
			},error=>{
				console.log(error);
			});
	}

	toggleDiv(){
		if(this.displayBlock === true){
			this.displayBlock = false;
		}else{
			this.displayBlock = true;
		}
	}
}
