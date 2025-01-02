import * as brevo from '@getbrevo/brevo';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private apiInstance: any;

  constructor(private configService: ConfigService) {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    let apiKey = this.apiInstance.authentications['apiKey'];
    apiKey.apiKey = configService.get<string>('brevo.apiKey');
  }

  async send(contactDto: ContactDto) {
    const { name, email, phone, message } = contactDto;
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Add timestamp to params
    sendSmtpEmail.params = {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'long',
      }),
    };

    sendSmtpEmail.subject = `New Contact Form Message from ${name}`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
              /* Reset styles for email clients */
              body, table, td, div, p {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
              }
              
              /* Main container */
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
              }
              
              /* Header styles */
              .header {
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-bottom: 3px solid #00A9FF;
                  text-align: center;
              }
              
              .logo {
                  max-width: 150px;
                  height: auto;
              }
              
              .company-name {
                  color: #2c3e50;
                  font-size: 24px;
                  margin: 0;
              }
              
              .subtitle {
                  color: #7f8c8d;
                  margin: 5px 0 0 0;
              }
              
              /* Content styles */
              .content {
                  background-color: #ffffff;
                  padding: 20px;
                  border: 1px solid #e0e0e0;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              
              .field-group {
                  margin-bottom: 15px;
              }
              
              .field-label {
                  font-weight: bold;
                  color: #2c3e50;
                  margin-bottom: 5px;
              }
              
              .field-value {
                  color: #333333;
                  background-color: #f8f9fa;
                  padding: 8px;
                  border-radius: 4px;
              }
              
              /* Footer styles */
              .footer {
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 1px solid #e0e0e0;
                  font-size: 12px;
                  color: #7f8c8d;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://drive.google.com/uc?id=1aCor-dlzh4YOJ4IyhWJXgOh4HjoVUfco" alt="Adiwisata Logo" class="logo">
                  <p class="subtitle">New Contact Form Submission</p>
              </div>
              
              <div class="content">
                  <p>You have received a new message from your website's contact form.</p>
                  
                  <div class="field-group">
                      <div class="field-label">Submission Date:</div>
                      <div class="field-value">{{params.timestamp}}</div>
                  </div>
                  
                  <div class="field-group">
                      <div class="field-label">Name:</div>
                      <div class="field-value">{{params.name}}</div>
                  </div>
                  
                  <div class="field-group">
                      <div class="field-label">Email Address:</div>
                      <div class="field-value">{{params.email}}</div>
                  </div>
                  
                  <div class="field-group">
                      <div class="field-label">Phone Number:</div>
                      <div class="field-value">{{params.phone}}</div>
                      <a />
                  </div>
                  
                  <div class="field-group">
                      <div class="field-label">Message:</div>
                      <div class="field-value">{{params.message}}</div>
                  </div>
              </div>
              
              <div class="footer">
                  <p>This is an automated message from your website's contact form system. Please do not reply to this email directly.</p>
                  <p>© 2025 Adiwisata. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    sendSmtpEmail.sender = {
      email: 'adiwisata.dignitas@gmail.com',
      name: 'Adiwisata',
    };

    sendSmtpEmail.to = [
      {
        email: 'adiwisata.dignitas@gmail.com',
        name: 'Adiwisata',
      },
    ];

    sendSmtpEmail.headers = {
      'Contact-Form-ID': `contact-form-${Date.now()}`,
    };

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return {
        statusCode: HttpStatus.OK,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
