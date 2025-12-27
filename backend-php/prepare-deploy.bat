@echo off
echo ======================================
echo Devialet - Prepare for Byethost Deploy
echo ======================================
echo.

REM Step 1: Install dependencies
echo Step 1: Installing Composer dependencies...
call composer install --no-dev --optimize-autoloader

REM Step 2: Create deployment package
echo.
echo Step 2: Creating deployment package...

REM Create deploy directory
if not exist "..\deploy-byethost" mkdir "..\deploy-byethost"
del /q /s "..\deploy-byethost\*" 2>nul

REM Copy necessary files
echo Copying files...
xcopy /E /I /Y "config" "..\deploy-byethost\config"
xcopy /E /I /Y "core" "..\deploy-byethost\core"
xcopy /E /I /Y "controllers" "..\deploy-byethost\controllers"
xcopy /E /I /Y "middleware" "..\deploy-byethost\middleware"
xcopy /E /I /Y "services" "..\deploy-byethost\services"
xcopy /E /I /Y "routes" "..\deploy-byethost\routes"
xcopy /E /I /Y "public" "..\deploy-byethost\public"
xcopy /E /I /Y "vendor" "..\deploy-byethost\vendor"
copy /Y ".htaccess" "..\deploy-byethost\"
copy /Y ".env.production" "..\deploy-byethost\.env"
copy /Y "composer.json" "..\deploy-byethost\"
copy /Y "README.md" "..\deploy-byethost\"
copy /Y "DEPLOY-BYETHOST.md" "..\deploy-byethost\"

echo.
echo ======================================
echo ✅ Deployment package ready!
echo ======================================
echo.
echo Next steps:
echo 1. Edit ..\deploy-byethost\.env with your Byethost credentials
echo 2. Upload all files in ..\deploy-byethost\ to Byethost htdocs/
echo 3. Import database schema to Byethost MySQL
echo 4. Test your API at: https://your-domain.byet.host/api/products
echo.
pause
