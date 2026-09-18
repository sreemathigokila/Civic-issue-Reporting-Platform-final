@ECHO OFF

IF EXIST "C:\Program Files\OpenLogic\jdk-25.0.2.10-hotspot" (
    SET "JAVA_HOME=C:\Program Files\OpenLogic\jdk-25.0.2.10-hotspot"
)

ECHO Using JAVA_HOME: %JAVA_HOME%

SET "MAVEN_OPTS=-Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true -Dmaven.wagon.http.ssl.ignore.validity.dates=true -Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"

SET "BACKEND_DIR=%~dp0"
IF "%BACKEND_DIR:~-1%"=="\" SET "BACKEND_DIR=%BACKEND_DIR:~0,-1%"
SET "MAVEN_BIN=%BACKEND_DIR%\.mvn\apache-maven-3.9.6\bin\mvn.cmd"

IF EXIST "%MAVEN_BIN%" (
    "%MAVEN_BIN%" %*
) ELSE (
    ECHO Local Maven not found at %MAVEN_BIN%
)
