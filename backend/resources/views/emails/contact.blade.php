<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #1a1a1a;
            color: #D4A574;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .field {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            margin-top: 5px;
            padding: 10px;
            background-color: white;
            border-left: 3px solid #D4A574;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DEVIALET</h1>
            <p>New Contact Message</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">{{ $contactData['name'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{ $contactData['email'] }}</div>
            </div>
            
            @if(!empty($contactData['phone']))
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">{{ $contactData['phone'] }}</div>
            </div>
            @endif
            
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">{{ ucfirst($contactData['subject']) }}</div>
            </div>
            
            <div class="field">
                <div class="label">Message:</div>
                <div class="value">{{ $contactData['message'] }}</div>
            </div>
        </div>
    </div>
</body>
</html>
