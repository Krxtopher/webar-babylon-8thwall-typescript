import {
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Color3,
  Scene,
  Nullable,
  Vector3,
  Vector2,
} from '@babylonjs/core';

/**
 *
 */
class HSurfaceCursor {
  targetScreenPosition: Nullable<Vector2> = null;

  private _position: Nullable<Vector3> = null;

  get position(): Nullable<Vector3> {
    return this._position;
  }

  private _enabled = true;

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    this.cursorMesh.setEnabled(value);
  }

  private cursorMesh!: Mesh;

  private surfaceMesh!: Mesh;

  private scene: Scene;

  private isPositionLocked = false;

  constructor(scene: Scene, diameter = 1) {
    this.scene = scene;
    this.createSurfaceMesh();
    this.createCursorMesh(diameter, diameter);

    // Default to targeting the center of the screen.
    const { offsetWidth, offsetHeight } = this.scene.getEngine().getRenderingCanvas()!;
    this.targetScreenPosition = new Vector2(offsetWidth / 2, offsetHeight / 2);

    // Configure a method to be called on every render update.
    this.scene.onBeforeRenderObservable.add(() => this.beforeRenderHandler());
  }

  lockPosition(lock: boolean): void {
    this.isPositionLocked = lock;
  }

  private calculatePosition(): Nullable<Vector3> {
    if (this.enabled && this.targetScreenPosition) {
      const { x: screenX, y: screenY } = this.targetScreenPosition;
      const pickInfo = this.scene.pick(screenX, screenY, (mesh) => mesh === this.surfaceMesh);
      if (pickInfo?.pickedPoint) {
        return pickInfo.pickedPoint;
      }
    }

    return null;
  }

  /**
   * Creates an invisible plane to represent a real-world surface (floor, table, etc.)
   */
  private createSurfaceMesh(): void {
    const mesh = MeshBuilder.CreateGround('ArSurface', { width: 20, height: 20 });

    const material = new StandardMaterial('ArSurface');
    material.zOffset = 100;
    material.alpha = 0;
    mesh.material = material;

    this.surfaceMesh = mesh;
  }

  private createCursorMesh(width = 1, height = 1): void {
    const mesh = MeshBuilder.CreateGround('ArCursor', { width, height });
    mesh.isPickable = false;

    const material = new StandardMaterial('ArCursor');
    material.backFaceCulling = false;
    material.disableLighting = true; // Make material unlit
    material.opacityTexture = new Texture('./assets/textures/ar-placement-target.png', this.scene);
    material.emissiveColor = Color3.FromHexString('#FFE082');
    mesh.material = material;

    this.cursorMesh = mesh;
  }

  beforeRenderHandler(): void {
    if (this.isPositionLocked) return;

    this._position = this.calculatePosition();
    if (this._position) {
      this.cursorMesh.position = this._position.clone();
      // Show the cursor.
      this.cursorMesh.setEnabled(true);
    } else {
      // Hide the cursor.
      this.cursorMesh.setEnabled(false);
    }
  }
}

export default HSurfaceCursor;
