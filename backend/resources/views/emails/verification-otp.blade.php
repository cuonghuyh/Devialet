<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .otp-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            margin: 10px 0;
        }
        .message {
            color: #666;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">DEVIALET</div>
            <h2>Email Verification</h2>
        </div>

        <p>Hello <strong>{{ $userName }}</strong>,</p>

        <p class="message">
            Thank you for registering with Devialet Store! To complete your registration and activate your account, 
            please verify your email address using the OTP code below:
        </p>

        <div class="otp-box">
            <div style="color: #666; font-size: 14px;">Your verification code is:</div>
            <div class="otp-code">{{ $otp }}</div>
            <div style="color: #999; font-size: 12px; margin-top: 10px;">This code will expire in 10 minutes</div>
        </div>

        <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            - Do not share this code with anyone<br>
            - This code is only valid for 10 minutes<br>
            - If you didn't request this, please ignore this email
        </div>

        <p class="message">
            Once verified, you'll be able to access all features of your Devialet Store account.
        </p>

        <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; {{ date('Y') }} Devialet Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
