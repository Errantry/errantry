echo off
if defined PROGRAMFILES(x86) (
  echo x64
  set php=x64/php/php.exe
) else (
  echo x86
  set php=x86/php/php.exe
)
echo %php%

cd editor && start ../%php% -S localhost:8080
cd ..
cd app && start ../%php% -S localhost:8081

start "" "http://localhost:8080/editor