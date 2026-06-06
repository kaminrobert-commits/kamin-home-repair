const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, address, phone, description } = data;

    // Validate required fields
    if (!name || !email || !address || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Email content to send to you
    const mailToYou = {
      from: process.env.GMAIL_USER,
      to: 'kaminrobert@gmail.com',
      subject: `New Quote Request from ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Project Description:</strong></p>
        <p>${description.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Reply directly to ${email} to contact this customer.</p>
      `,
    };

    // Confirmation email to send to customer
    const mailToCustomer = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Quote Request Received - Kamin Home Repair',
      html: `
        <h2>Thank you for contacting Kamin Home Repair!</h2>
        <p>Hi ${name},</p>
        <p>I've received your quote request and will review it shortly. I'll get back to you within 24 hours with thoughts or next steps.</p>
        <p><strong>Your request details:</strong></p>
        <ul>
          <li><strong>Location:</strong> ${address}</li>
          <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
          <li><strong>Project:</strong> ${description.replace(/\n/g, '<br>')}</li>
        </ul>
        <p>If you have any questions in the meantime, feel free to reach out.</p>
        <p>Best regards,<br>
        Rob<br>
        Kamin Home Repair<br>
        Seattle, WA</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailToYou);
    await transporter.sendMail(mailToCustomer);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Quote request sent successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send quote request' }),
    };
  }
};
