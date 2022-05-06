# Babylon, 8thWall, TypeScript Template

*A web augmented reality (AR) template using Babylon.js (3D engine), 8th Wall (AR tracking), and TypeScript.*



## Prerequisites

- An [8th Wall](https://www.8thwall.com/) developer account
- NPM installed
- (Recommended) VS Code



## Local Dev Environment Setup

1. After cloning this repository, open an Terminal window and navigate to the repository root folder.
2. Install project dependencies by running:

```
npm install
```



## 8th Wall Setup

1. Log into the 8th Wall developer console and create a new project.
2. Authorize one or more mobile devices to access that project.
3. Edit line 29 of the `public/index.html` file to include the app key from your 8th Wall project. The project's app key can be found on the "Settings" tab within the project on the 8th Wall developer portal.



## Building and Distributing the Application

To build a distributable version of the application run:

```
npm build
```

This will generate a distributable build to a folder called `dist/`. Deploy the files in this folder to a publicly accessible web server.

> :bulb: Tip: [AWS Amplify](https://aws.amazon.com/amplify/) provides a fantastic, easy solution for hosting web apps like this one!



## Using the App

From one of the mobile devices you authorized above, visit the URL of your deployed application.

> :pencil2: Note: Alternatively, you can open the URL in a desktop browser. It will automatically display a QR code that can be scanned from your authorized device.

Upon loading the app, you will be prompted to allow the app to access the motion sensors and camera on your device.

After approving sensor access, you will see a camera view with a yellow target in the middle. Aim your camera wherever you would like to place the sample AR object and click the "Place Object" button.

### Magic URL Parameters

#### `?disableAR=1`

By default, when you load the website on a device that doesn't support AR - such as a laptop - it will present the user with a QR code to be scanned by an AR-capable device. However, during development, it can be much more convenient to interact with your 3D content on your desktop. By appending this URL parameter, the scene will supress the QR code and instead display your scene with a simple ground plane and a camera that can be rotated and panned with the mouse.

*Example URL:* `https://my-ar-app-url.com/?disableAR=1`

#### `?debug=1`

Appending the query parameter `debug=1` to the URL when loading the website will add a small message panel to the top of the screen to display any log messages written to the JavaScript console via `console.log()` and similar console API calls. This makes it possible to easily view log messages while running on mobile.

*Example URL:* `https://my-ar-app-url.com/?debug=1`

Note, the `debug` param only works if AR hasn't been disabled via the `disableAR` URL parameter.



## Customizing the App

To start adding your own custom functionality to the app, you'll likely want to modify the `DemoScene.ts` file.

