<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devialet - Premium Audio Excellence</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
</head>
<body>
    <div id="root"></div>
    
    @if(app()->environment('local'))
        {{-- Development: Load from Vite dev server --}}
        <script type="module" crossorigin src="http://localhost:5173/@vite/client"></script>
        <script type="module" crossorigin src="http://localhost:5173/src/main.jsx"></script>
    @else
        {{-- Production: Load built assets --}}
        @vite(['frontend/src/main.jsx'])
    @endif
</body>
</html>
