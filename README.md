# Hubfaces

## Development server

Create a `.env` file from the `.env.example` file and use your API key for pixlab.

Run `npm install`

Run the proxy server `npm run express`

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Usage

On first run you will be met with an upload prompt to select a local image to upload.

Once you select an image it will automatically upload to the server and be displayed to you.

You can then click the "Find Faces" button to check if the image has any faces within it.

If the image does have faces that are found you will now see these faces highlighted on screen.

You can select some or all of the faces and then you can click on the "Blur Faces" button to blur out the selected faces.

### History

You have access to your three previous detected/blurred images, you can cycle between these and continue from where you left off.