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

class DemoScene extends ArSceneBase {
  // The model to be loaded.
  private modelUrl: string = './assets/models/Biplane.glb';

  // The main mesh loaded into the scene.
  private heroMesh: Nullable<Mesh> = null;

  private worldCursor!: HSurfaceCursor;

  private placeObjectButton!: HTMLButtonElement;

  constructor(engine: Engine, disableAr = false) {
    super(engine, disableAr);

    const cursorSize = 1.5;
    this.worldCursor = new HSurfaceCursor(this, cursorSize);

    this.setUpInteraction();
  }

  protected setUpInteraction(): void {
    // Handle placeObjectButton clicks.
    this.placeObjectButton = document.getElementById('placeObjectButton') as HTMLButtonElement;
    this.placeObjectButton.addEventListener('click', this.placeObjectButtonClickHandler.bind(this));
  }

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
    this.heroMesh.position = position;

    // Rotate mesh to face camera.
    const targetPoint = this.activeCamera!.position.clone();
    targetPoint.y = position.y;
    const directionToCamera = position.subtract(targetPoint).normalize();
    this.heroMesh.setDirection(directionToCamera);
  }

  // == EVENT HANDLERS ==

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
