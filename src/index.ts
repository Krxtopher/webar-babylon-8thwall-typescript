import * as BABYLON from '@babylonjs/core';
import { Engine } from '@babylonjs/core';

import DemoScene from './DemoScene';
import './index.css';

// TRICKY: 8thWall expects Babylon to be available as a global, but we're using
// Bablon as an imported ESM module instead, so we have to explicitly add it to
// the global namespace.
const globals = window as any;
globals.BABYLON = BABYLON;

function startScene(disableAr = false) {
  // Initialize the BabylonJS engine.
  const renderCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const engine = new Engine(renderCanvas, true, { stencil: true, preserveDrawingBuffer: false });
  engine.enableOfflineSupport = false;
  window.addEventListener('resize', () => engine.resize());

  // Create the demo scene.
  const scene = new DemoScene(engine, disableAr);
  engine.runRenderLoop(() => scene.render());
}

function onXrLoaded() {
  globals.XR8.addCameraPipelineModules([ // Add camera pipeline modules.
    globals.XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
    globals.XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
    globals.XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
  ]);

  const urlParams = new URLSearchParams(window.location.search);
  const showDebugMessages = urlParams.get('debug') === '1';
  if (showDebugMessages) {
    // Display browser log messages to screen.
    globals.XRExtras.DebugWebViews.enableLogToScreen();
    window.addEventListener('error', (e) => console.error(e.message)); // Write errors to screen.
  }

  startScene();
}

// Show loading screen before the full XR library has been loaded.
function onXrExtrasLoaded() {
  globals.XRExtras.Loading.showLoading({ onxrloaded: onXrLoaded });
}

function startArMode() {
  window.onload = () => {
    if (globals.XRExtras) {
      onXrExtrasLoaded();
    } else {
      window.addEventListener('xrextrasloaded', onXrExtrasLoaded);
    }
  };
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('disableAR') === '1') {
  startScene(true);
} else {
  startArMode();
}
