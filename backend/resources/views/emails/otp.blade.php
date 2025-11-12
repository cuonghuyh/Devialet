<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #D4A574 0%, #BC8F8F 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        .email-body {
            padding: 40px 30px;
            color: #333333;
        }
        .email-body h2 {
            color: #D4A574;
            font-size: 22px;
            margin-bottom: 20px;
        }
        .email-body p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .otp-box {
            background: linear-gradient(135deg, #D4A574 0%, #BC8F8F 100%);
            color: #ffffff;
            text-align: center;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 8px;
            font-family: 'Courier New', Courier, monospace;
        }
        .otp-label {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 10px;
        }
        .info-box {
            background-color: #f9f9f9;
            border-left: 4px solid #D4A574;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .email-footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            color: #666666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
        }
        .email-footer p {
            margin: 5px 0;
        }
        .brand-name {
            color: #D4A574;
            font-weight: 700;
            font-size: 18px;
        }
        .warning {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>DEVIALET</h1>
        </div>

        <!-- Body -->
        <div class="email-body">
            <h2>Hello {{ $userName }},</h2>
            
            <p>We received a request to reset your password for your Devialet account. To proceed with resetting your password, please use the One-Time Password (OTP) below:</p>

            <!-- OTP Box -->
            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-label">Your OTP Code</div>
            </div>

            <!-- Info Box -->
            <div class="info-box">
                <p><strong>⏱️ Valid for:</strong> 10 minutes</p>
                <p><strong>🔒 Security:</strong> Do not share this code with anyone</p>
            </div>

            <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>

            <p class="warning">⚠️ This OTP will expire in 10 minutes. After that, you'll need to request a new one.</p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="brand-name">DEVIALET</p>
            <p>Premium Audio Excellence</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
