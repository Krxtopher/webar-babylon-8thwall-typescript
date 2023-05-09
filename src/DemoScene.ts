import {
  SceneLoader,
  Vector3,
  Mesh,
  Nullable,
  Engine,
} from '@babylonjs/core';
import '@babylonjs/loaders'; // Plugins for loading glTF files
import ArSceneBase from './ArSceneBase';
import HSurfaceCursor from './HSurfaceCursor';

/**
 * The main scene for this application. You may edit this scene to add your own
 * custom functionality.
 */
class DemoScene extends ArSceneBase {
  // The model to be loaded.
  private modelUrl: string = './assets/models/Biplane.glb';

  // The main mesh loaded into the scene.
  private heroMesh: Nullable<Mesh> = null;

  // A visual cursor used to sample 3D positions in the real world.
  private worldCursor!: HSurfaceCursor;

  private placeObjectButton!: HTMLButtonElement;

  /**
   * Constructor
   * @param engine The Babylon.js engine instance to use.
   * @param disableAr A value of true will result in a scene that contains
   * a visible ground plane and a non-AR camera.
   */
  constructor(engine: Engine, disableAr = false) {
    super(engine, disableAr);

    const cursorSize = 1.5;
    this.worldCursor = new HSurfaceCursor(this, cursorSize);

    this.setUpInteraction();
  }

  /**
   * Sets up user input. Called automtically during construction.
   */
  protected setUpInteraction(): void {
    // Handle placeObjectButton clicks.
    this.placeObjectButton = document.getElementById('placeObjectButton') as HTMLButtonElement;
    this.placeObjectButton.addEventListener('click', this.placeObjectButtonClickHandler.bind(this));
  }

  /**
   * Spawns a mesh into the scene at the specified location.
   * @param modelUrl The URL of a .glb or .gltf file to spawn.
   * @param position The location at which to spawn the model.
   * @returns A Promise that does not resolve to a value.
   */
  protected async spawnMesh(modelUrl: string, position: Vector3): Promise<void> {
    // Remove old hero mesh.
    this.heroMesh?.dispose();

    let result;
    try {
      console.log('Starting hero mesh load.');
      result = await SceneLoader.ImportMeshAsync('', modelUrl, undefined, this);
      console.log('Hero mesh loaded.');
      this.worldCursor.enabled = false;
    } catch (e: any) {
      console.error(e.message);
      return;
    }

    const { meshes } = result;
    meshes.forEach((mesh) => {
      mesh.receiveShadows = true;
      this.shadowGenerator.addShadowCaster(mesh);
    });

    this.heroMesh = meshes[0] as Mesh;
    this.heroMesh.scaling = new Vector3(2, 2, 2);
    this.heroMesh.position = position;

    // Rotate mesh to face camera.
    const targetPoint = this.activeCamera!.position.clone();
    targetPoint.y = position.y;
    const directionToCamera = position.subtract(targetPoint).normalize();
    this.heroMesh.setDirection(directionToCamera);
  }

  // == EVENT HANDLERS ==

  /**
   * Triggered whenever the user clicks the "Place Object" button.
   */
  protected placeObjectButtonClickHandler(): void {
    const worldPosition = this.worldCursor?.position;
    if (worldPosition) {
      this.placeObjectButton.hidden = true;
      this.worldCursor.lockPosition(true);
      this.spawnMesh(this.modelUrl, worldPosition);
    }
  }
}

export default DemoScene;
