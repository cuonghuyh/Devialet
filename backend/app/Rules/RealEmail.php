<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RealEmail implements ValidationRule
{
    /**
     * List of disposable/temporary email domains to block
     */
    private $disposableDomains = [
        // Temporary email services
        '10minutemail.com', '10minutemail.net', 'tempmail.com', 'guerrillamail.com',
        'mailinator.com', 'maildrop.cc', 'throwaway.email', 'yopmail.com',
        'fakeinbox.com', 'trashmail.com', 'getnada.com', 'temp-mail.org',
        'disposablemail.com', 'dispostable.com', 'throwawaymail.com',
        'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
        'spam4.me', 'tempinbox.com', 'mintemail.com', 'emailondeck.com',
        'mytemp.email', 'mohmal.com', 'tempail.com', '20minutemail.com',
        'emailfake.com', 'fakemail.net', 'anonymousemail.me', 'anonbox.net',
        'bugmenot.com', 'deadaddress.com', 'mailnesia.com', 'mailcatch.com',
        
        // Add more as needed
    ];

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Extract domain from email
        $domain = strtolower(substr(strrchr($value, "@"), 1));
        
        // Check if domain is in disposable list
        if (in_array($domain, $this->disposableDomains)) {
            $fail('Please use a real email address. Temporary/disposable emails are not allowed.');
            return;
        }

        // Additional check: domain should have MX records
        if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
            $fail('Please use a valid email address from an existing email provider.');
            return;
        }
    }
}
