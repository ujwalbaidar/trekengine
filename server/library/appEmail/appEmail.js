const nodemailer = require('nodemailer');
class AppEmail {
	constructor(config) {
		this.emailConfigs = config;
	}

	sendEmail(){
		return new Promise((resolve, reject)=>{
			let transporter = nodemailer.createTransport({
			    // service: this.emailConfigs.service,
			    host: 'smtp.zoho.com',
			    port: 465,
			    secure: true,
			    auth: {
			        user: this.emailConfigs.address,
			        pass: this.emailConfigs.password
			    }
			});
			let mailOptions = this.emailConfigs.mailOptions;
			transporter.sendMail(mailOptions, (error, info) => {
			    if (error) {
			        reject(error);
			    }else{
			    	resolve(info);
			    }
			});
		});             
	}
}
module.exports = AppEmail;