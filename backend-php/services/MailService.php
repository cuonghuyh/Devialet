<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailService
{
    private $mailer;
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/mail.php';
        $this->mailer = new PHPMailer(true);
        $this->setup();
    }

    private function setup()
    {
        $this->mailer->isSMTP();
        $this->mailer->Host = $this->config['host'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $this->config['username'];
        $this->mailer->Password = $this->config['password'];
        $this->mailer->SMTPSecure = $this->config['encryption'];
        $this->mailer->Port = $this->config['port'];
        $this->mailer->setFrom($this->config['from_address'], $this->config['from_name']);
        $this->mailer->CharSet = 'UTF-8';
    }

    public function sendOTP($email, $otp, $userName)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Email Verification Code';
            $this->mailer->Body = $this->getOTPTemplate($otp, $userName);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email send failed: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendPasswordResetOTP($email, $otp, $userName)
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Password Reset Code';
            $this->mailer->Body = $this->getPasswordResetTemplate($otp, $userName);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email send failed: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    private function getOTPTemplate($otp, $userName)
    {
        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2>Email Verification</h2>
                <p>Hello $userName,</p>
                <p>Your verification code is:</p>
                <h1 style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;'>$otp</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        ";
    }

    private function getPasswordResetTemplate($otp, $userName)
    {
        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2>Password Reset</h2>
                <p>Hello $userName,</p>
                <p>Your password reset code is:</p>
                <h1 style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;'>$otp</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        ";
    }
}
