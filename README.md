# Logo Resizer CLI

Python command-line tool to resize a logo image so that it fits inside a target box (default 150×50), preserving aspect ratio. Any remaining space is filled with the inferred background color from the original image, and the result is saved as a PNG.

## Requirements

- Python 3.9+ recommended
- Pip

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

For development and packaging (PyInstaller, etc.):

```bash
python3 -m pip install -r requirements-dev.txt
```

## Usage

Basic example (150×50 target):

```bash
python logo_resizer.py -i path/to/input_logo.jpg -o path/to/output_logo.png
```

Custom canvas size:

```bash
python logo_resizer.py -i input.png -o output.png --width 200 --height 80
```

Behavior:

- Loads the input image.
- Scales the logo to be as large as possible while fitting inside the target width/height, preserving aspect ratio.
- Infers a background color by sampling the borders of the original image. If any border pixel is fully transparent, the padding/background is left transparent; otherwise the inferred color is used.
- Fills the remaining area of the target canvas with that inferred background color (or transparency if the border is transparent).
- Centers the scaled logo on the canvas and saves the result as a PNG.

## Supported image formats

The tool accepts any image format that Pillow can open. Common examples include:

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.webp`
- `.tif` / `.tiff`

Regardless of the input format, the output is always saved as a PNG.

Examples:

```bash
python logo_resizer.py -i logo.gif -o logo_resized.png
python logo_resizer.py -i logo.webp -o logo_resized.png --width 180 --height 60
```

For SVG files, convert to PNG first using a tool such as ImageMagick:

```bash
magick logo.svg logo.png
python logo_resizer.py -i logo.png -o logo_resized.png
```

## Installers

### Windows

- Build the standalone executable on Windows (already configured for PyInstaller):

  ```bash
  python -m PyInstaller --onefile --name logo-resizer-cli logo_resizer.py
  ```

- Open `logo_resizer_installer.iss` in Inno Setup and compile it to produce `LogoResizerSetup.exe`.
- Distribute `LogoResizerSetup.exe` to users. After installation, the CLI will be available as `logo-resizer-cli.exe` in the chosen install directory (by default, `C:\Program Files\LogoResizer`).

### macOS

- A ready-made DMG is created by the build steps as `LogoResizer.dmg` in the project root.
- Users can:
  - Open `LogoResizer.dmg`.
  - Drag the `LogoResizer` folder into `/Applications`.
  - Run the tool from Terminal:

    ```bash
    /Applications/LogoResizer/logo-resizer-cli -i input.jpg -o output.png
    ```

On both platforms, the installers bundle Python and dependencies, so a separate Python installation is not required for end users.
