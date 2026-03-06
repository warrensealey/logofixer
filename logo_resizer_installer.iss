[Setup]
AppName=Logo Resizer CLI
AppVersion=1.0.0
DefaultDirName={pf}\LogoResizer
DefaultGroupName=Logo Resizer
OutputBaseFilename=LogoResizerSetup
Compression=lzma
SolidCompression=yes

[Files]
Source: "dist\logo-resizer-cli.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Logo Resizer CLI"; Filename: "{app}\logo-resizer-cli.exe"

