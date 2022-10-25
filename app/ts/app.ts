const MAX_HEIGHT = 1080;
const MAX_WIDTH = 1920;
let ratio = 0.1;
let height = MAX_HEIGHT * ratio;
let width = MAX_WIDTH * ratio;

const videoPlayer = document.querySelector('#webcam-viewer') as HTMLVideoElement;
const canvas = document.querySelector('#canvas-player') as HTMLCanvasElement;
const asciiVideoDiv = document.querySelector('#ascii-video') as HTMLDivElement;
const takeSnapshotButton = document.querySelector('button[name="take-snapshot"]') as HTMLButtonElement;

function getUserWebcamVideo(): Promise<MediaProvider> {
    return navigator.mediaDevices.getUserMedia({video: {height: {ideal: height}, width: {ideal: width}}});
}

async function accessUserWebcam(): Promise<void> {
    videoPlayer.crossOrigin = 'anonymous'
    videoPlayer.srcObject = await getUserWebcamVideo();
}

async function playVideo(): Promise<void> {
    await videoPlayer.play();
}

function requestFrame(cb): number {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        //@ts-ignore
        return videoPlayer.requestVideoFrameCallback(cb);
    }

    return requestAnimationFrame(cb);
}

function getImageData(context: CanvasRenderingContext2D): ImageData {
    canvas.height = height;
    canvas.width = width;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(videoPlayer, 0, 0);

    return context.getImageData(0, 0, width, height);
}

function draw(converter: ImageToAsciiConverter, context: CanvasRenderingContext2D) {
    const frameData = getImageData(context);
    asciiVideoDiv.innerHTML = converter.convert(frameData.data);
    requestFrame(draw.bind(this, converter, context));
}

function playVideoInCanvas() {
    const context = canvas.getContext('2d', {willReadFrequently: true});
    const converter = new ImageToAsciiConverter(width)

    requestFrame(draw.bind(this, converter, context));
}

async function prepareStyles(): Promise<void> {
    asciiVideoDiv.style.fontFamily = '"Courier 10 Pitch", monospace';
    asciiVideoDiv.style.fontSize = `calc(100vw / ${width})`;
    asciiVideoDiv.style.lineHeight = `calc(100vh / ${height})`;
}

takeSnapshotButton.addEventListener('click', (event: MouseEvent): void => {
    navigator.clipboard.writeText(asciiVideoDiv.innerHTML).then(() => {
        // @ts-ignore
        UIkit.notification({
            message: 'ASCII image copied to clipboard. Go paste it!!',
            status: 'success',
            timeout: 3000,
            pos: 'bottom-center'
        });
    });
});

function start(): void {
    height = MAX_HEIGHT * ratio;
    width = MAX_WIDTH * ratio;

    prepareStyles()
        .then(playVideo)
        .then(playVideoInCanvas)
        .catch(console.error)
}

accessUserWebcam()
    .then(start)
    .catch(() => {
        videoPlayer.parentElement.innerHTML = '<p class="uk-text-danger">Looks like you haven´t given me access to your camera...</p><a href="' + window.location.href + '">Try again</a>'
    });
