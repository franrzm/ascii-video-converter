class ImageToAsciiConverter {
    constructor(
        private readonly rowWidth: number,
        private readonly charsByDensity: string[] = ['Ñ', '@', '#', 'W', '$', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0', '?', '!', 'a', 'b', 'c', ';', ':', '+', '=', '-', ',', '.', '_', ' ', ' ', ' ', ' '],
        private readonly whiteSpaceSubstitution: string = '&nbsp;',
        private readonly lineBreak: string = '<br/>'
    ) {
    }

    public convert = (image: Uint8ClampedArray): string => {
        let asciiImage = '';
        let charactersCount = 0;

        for (let pixel = 0; pixel < image.length; pixel += 4) {
            const [red, green, blue] = this.getImagePixelRgb(image, pixel);
            const density = this.getPixelDensityLevel(red, green, blue);

            asciiImage += this.getAsciiCharacterByPixelDensity(density);

            charactersCount += 1
            if (this.shouldAddNewLine(charactersCount)) {
                asciiImage += this.lineBreak;
            }
        }

        return asciiImage;
    };

    private shouldAddNewLine(charactersCount: number): boolean {
        return charactersCount % this.rowWidth === 0;
    }

    private getPixelDensityLevel = (red: number, green: number, blue: number): number => {
        const rgbMean = this.getRgbMean(red, green, blue);
        return Math.floor(((this.charsByDensity.length / 255) * rgbMean));
    };

    private getRgbMean = (red: number, green: number, blue: number): number => (red + green + blue) / 3;

    private getAsciiCharacterByPixelDensity = (density: number) => {
        const char = this.charsByDensity[density];
        return this.substituteSpecialCharacters(char);
    };

    private substituteSpecialCharacters = (char: string): string => {
        if (char === ' ' || char === undefined) {
            return this.whiteSpaceSubstitution;
        }

        return char;
    };

    private getImagePixelRgb = (image: Uint8ClampedArray, pixel: number): number[] => [
        image[pixel],
        image[pixel + 1],
        image[pixel + 2]
    ];
}
